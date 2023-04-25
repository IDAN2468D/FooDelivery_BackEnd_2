const config = require("./package.json").projectConfig

module.exports = {
    mongoConfig: {
        connectionUrl: config.mongoConnectionUrl,
        database: "FoodDelivery_db",
        collections: {
            USERS: "users",
            RESTAURANTS: "restaurants",
        },
    },
    serverConfig: {
        ip: config.serverIp,
        port: config.serverPort,
    },
    tokenSecret: "foodelivery_secret",
};