const { Job, ScrapeInfo } = require('../../models');
const scrapeJobs = require('../../services/scraper');

module.exports = function (bot, isAllowed) {
    bot.onText(/\/scrap/, async (msg) => {
        const chatId = msg.chat.id;
        if (!isAllowed(chatId)) return;

        const result = await scrapeJobs();
        const totalJobs = await Job.countDocuments();
        const sentJobs = await Job.countDocuments({ status: 'prod' });
        const testJobs = await Job.countDocuments({ status: 'test' });
        const pendingJobs = totalJobs - sentJobs - testJobs;
        const info = await ScrapeInfo.findOne();
        const lastScrapedAt = info?.lastScrapedAt?.toLocaleString() || 'Yoxdur';

        const message = `🔍 Scraping tamamlandı!\n\n📅 Son scraping: ${lastScrapedAt}\n📥 Saytdan çəkilən: ${result.total}\n🆕 Yeni əlavə edilən: ${result.added}\n📤 Göndərilmiş (Prod): ${sentJobs}\n🧪 Göndərilmiş (Test): ${testJobs}\n🕓 Gözləmədə: ${pendingJobs}`;

        bot.sendMessage(chatId, message);
    });
};
