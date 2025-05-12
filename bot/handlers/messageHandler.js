module.exports = function (bot, allowedUsers) {
    bot.on('message', (msg) => {
        const chatId = msg.chat.id;
        const chatUserName = msg.chat.username;
        console.log(`-- Username: ${chatUserName} -- Command: ${msg.text} --`);

        if (!allowedUsers.includes(chatId)) return;

        // logs
        console.log(`📩 Message from allowed user: ${msg.text}`);
    });
};
