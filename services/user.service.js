const { mongoConfig } = require("../config");
const MongoDB = require("./mongodb.services");

const getUserData = async (username) => {
    try {
        let userObject = await MongoDB.db
            .collection(mongoConfig.collections.USERS)
            .findOne({ username })
        if (userObject) {
            return {
                status: true,
                message: "user found successfully",
                data: userObject,
            }
        } else {
            return {
                status: false,
                message: "no user found"
            }
        }
    } catch (error) {
        return {
            status: false,
            message: "user finding failed",
            error: `user finding failed ${error?.message}`
        }
    }
};

module.exports = { getUserData }