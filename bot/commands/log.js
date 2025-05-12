const { Job } = require('../../models');

module.exports = function (bot, isAllowed) {
    bot.onText(/\/log/, async (msg) => {
        const chatId = msg.chat.id;
        if (!isAllowed(chatId)) return;

        const sentJobs = await Job.find({ status: 'prod' }).sort({ createdAt: -1 }).limit(10);
        if (!sentJobs.length) return bot.sendMessage(chatId, 'Heç bir vakansiya göndərilməyib.');

        let msgText = '📋 Son 10 göndərilən vakansiya:\n\n';
        sentJobs.forEach(j => {
            msgText += `🆔 \`${j._id}\`\n💼 ${j.title}\n🏢 ${j.company}\n📅 ${j.date}\n🔗 ${j.link}\n📌 Status: ${j.status}\n\n`;
        });

        bot.sendMessage(chatId, msgText, { parse_mode: 'Markdown' });
    });
};
