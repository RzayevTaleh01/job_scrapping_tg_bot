module.exports = function (bot, allowedUsers) {
    bot.on('message', (msg) => {
        const chatId = msg.chat.id;

        if (!allowedUsers.includes(chatId)) return;

        // logs
        console.log(`📩 Message from allowed user: ${msg.text}`);
    });
};
