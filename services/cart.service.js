const { mongoConfig } = require("../config")
const MongoDB = require("./mongodb.services")

const addToCart = async ({ foodId, username }) => {
    try {
        let updateCart = await MongoDB.db
            .collection(mongoConfig.collections.CARTS)
            .updateOne(
                { foodId, username },
                { $inc: { count: 1 } },
                { upsert: true }
            );
        if (updateCart?.modifiedCount > 0 || updateCart?.upsertedCount > 0) {
            let cartResponse = await getCartItems({ username })
            return {
                status: true,
                message: "Item Added to Cart Successfully",
                data: cartResponse?.data,
            }
        }
    } catch (error) {
        return {
            status: false,
            message: "Item Added to Cart Failed",
        }
    }
}

const removeFromCart = async ({ foodId, username }) => {
    try {
        let cart = await MongoDB.db
            .collection(mongoConfig.collections.CARTS)
            .findOne({ foodId, username, count: 1 });
        if (cart) {
            await MongoDB.db
                .collection(mongoConfig.collections.CARTS)
                .deleteOne({ foodId, username });
            let cartResponse = await getCartItems({ username })
            return {
                status: true,
                message: "Item Remove from Cart Successfully",
                data: cartResponse?.data,
            }

        }
        let updateCart = await MongoDB.db
            .collection(mongoConfig.collections.CARTS)
            .updateOne(
                { foodId, username },
                { $inc: { count: -1 } },
                { upsert: true }
            );
        if (updateCart?.modifiedCount > 0 || updateCart?.upsertedCount > 0) {
            let cartResponse = await getCartItems({ username })
            return {
                status: true,
                message: "Item Remove from Cart Successfully",
                data: cartResponse?.data,
            }
        }
    } catch (error) {
        return {
            status: false,
            message: "Item Remove from Cart Failed",
        }
    }
}

const getCartItems = async ({ username }) => {
    try {
        let cartItems = await MongoDB.db
            .collection(mongoConfig.collections.CARTS)
            .aggregate([
                {
                    $match: {
                        username: username,
                    },
                }, {
                    $lookup: {
                        from: 'foods',
                        localField: 'foodId',
                        foreignField: 'id',
                        as: 'food',
                    },
                }, {
                    $unwind: {
                        path: '$food',
                    },
                },
            ])
            .toArray();
        if (cartItems?.length > 0) {
            let itemsTotal = cartItems
                ?.map((cartItems) => cartItems?.food?.price * cartItems?.count)
                ?.reduce((a, b) => parseFloat(a) + parseFloat(b));
            let discount = 0
            return {
                status: true,
                message: "Cart items fetched Successfully",
                data: {
                    cartItems,
                    metaData: {
                        itemsTotal,
                        discount: discount,
                        grandTotal: itemsTotal - discount,
                    },
                },
            };
        } else {
            return {
                status: false,
                message: "Cart items not found",
            };
        }
    } catch (error) {
        return {
            status: false,
            message: "Cart items fetched Failed",
        };
    }
};

module.exports = { addToCart, removeFromCart, getCartItems }