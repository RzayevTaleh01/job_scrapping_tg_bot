require('dotenv').config();

module.exports = {
    TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN,
    MONGO_URI: process.env.MONGO_URI,
    JOB_URL: process.env.JOB_URL,
    PROD_CHANNEL_USERNAME: process.env.PROD_CHANNEL_USERNAME,
    TEST_CHANNEL_USERNAME: process.env.TEST_CHANNEL_USERNAME,
    ALLOWED_USERS: process.env.ALLOWED_USERS
};
