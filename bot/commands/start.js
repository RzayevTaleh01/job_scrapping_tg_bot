const { Job, ScrapeInfo } = require('../../models');

module.exports = function (bot, isAllowed) {
    bot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id;
        if (!isAllowed(chatId)) return;

        const totalJobs = await Job.countDocuments();
        const sentJobs = await Job.countDocuments({ status: 'prod' });
        const testJobs = await Job.countDocuments({ status: 'test' });
        const pendingJobs = totalJobs - sentJobs - testJobs;
        const info = await ScrapeInfo.findOne();
        const lastScrapedAt = info?.lastScrapedAt?.toLocaleString() || 'Yoxdur';

        const message = `🤖 Bot işə düşdü!\n\n📅 Son scraping: ${lastScrapedAt}\n📤 Göndərilmiş (Prod): ${sentJobs}\n🧪 Göndərilmiş (Test): ${testJobs}\n🕓 Gözləmədə: ${pendingJobs}`;

        bot.sendMessage(chatId, message);
    });
};
