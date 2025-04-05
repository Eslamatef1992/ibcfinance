require("dotenv").config();
module.exports = {
    HOST        : process.env.DB_HOSTNAME || 'localhost',
    USER        : process.env.DB_USERNAME || 'root',
    PASSWORD    : process.env.DB_PASSWORD || '',
    DB          : process.env.DB_NAME || process.env.APP_NAME,
    dialect     : process.env.DB_DIALECT || "mysql",
    pool        : {
        max     : parseInt(process.env.DB_POOL_MAX) || 5,
        min     : parseInt(process.env.DB_POOL_MIN) || 0,
        acquire : parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
        idle    : parseInt(process.env.DB_POOL_IDLE) || 10000
    }
};