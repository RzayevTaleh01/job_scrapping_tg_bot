const { Job } = require('../../models');

module.exports = function (bot, isAllowed) {
    bot.onText(/\/list/, async (msg) => {
        const chatId = msg.chat.id;
        if (!isAllowed(chatId)) return;

        const jobs = await Job.find().sort({ createdAt: -1 }).limit(10);
        if (!jobs.length) return bot.sendMessage(chatId, 'Vakansiya yoxdur.');

        let msgText = '📋 Ən son 10 vakansiya:\n\n';
        jobs.forEach(j => {
            msgText += `🆔 \`${j._id}\`\n💼 ${j.title}\n🏢 ${j.company}\n📅 ${j.date}\n🔗 ${j.link}\n📌 Status: ${j.status}\n\n`;
        });

        bot.sendMessage(chatId, msgText, { parse_mode: 'Markdown' });
    });
};
