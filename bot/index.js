const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const { TELEGRAM_TOKEN, ALLOWED_USERS, PROD_CHANNEL_USERNAME, TEST_CHANNEL_USERNAME } = require('../config/env');
const authMiddleware = require('./middlewares/auth');

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
const allowedUsers = ALLOWED_USERS.split(',').map(id => parseInt(id.trim(), 10));
const isAllowed = (chatId) => authMiddleware(chatId, allowedUsers);

// Unauthorized users filter
bot.on('message', (msg) => {
    const userId = msg.chat.id;

    if (!allowedUsers.includes(userId)) {
        bot.sendMessage(userId, "❌ Bu bot yalnız @TechCodeAz idarəçiləri üçündür.");
    }
});


const commandsPath = path.join(__dirname, 'commands');
fs.readdirSync(commandsPath).forEach(file => {
    const commandFn = require(path.join(commandsPath, file));

    if (file === 'send.js') {
        commandFn(bot, isAllowed, PROD_CHANNEL_USERNAME, TEST_CHANNEL_USERNAME);
    } else {
        commandFn(bot, isAllowed);
    }
});

require('./handlers/messageHandler')(bot, allowedUsers);
