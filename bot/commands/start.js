const {Job, Intern, ScrapeInfo} = require('../../models');

module.exports = function (bot, isAllowed) {
    bot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id;
        if (!isAllowed(chatId)) return;

        // HelloJob statistika
        const totalJobs = await Job.countDocuments();
        const sentJobs = await Job.countDocuments({status: 'prod'});
        const testJobs = await Job.countDocuments({status: 'test'});
        const pendingJobs = totalJobs - sentJobs - testJobs;

        const helloInfo = await ScrapeInfo.findOne({sourceId: 1});
        const helloLastScrapedAt = helloInfo?.lastScrapedAt?.toLocaleString() || 'Yoxdur';

        // Tecrube.Az statistika
        const totalInterns = await Intern.countDocuments();
        const sentInterns = await Intern.countDocuments({status: 'prod'});
        const testInterns = await Intern.countDocuments({status: 'test'});
        const pendingInterns = totalInterns - sentInterns - testInterns;

        const tecrubeInfo = await ScrapeInfo.findOne({sourceId: 2});
        const tecrubeLastScrapedAt = tecrubeInfo?.lastScrapedAt?.toLocaleString() || 'Yoxdur';

        const message = `
🤖 Bot işə düşdü!

🔗 *HelloJob.Az*
📅 Son scraping: ${helloLastScrapedAt}
📤 Göndərilmiş (Prod): ${sentJobs}
🧪 Göndərilmiş (Test): ${testJobs}
🕓 Gözləmədə: ${pendingJobs}

🔗 *Tecrube.Az*
📅 Son scraping: ${tecrubeLastScrapedAt}
📤 Göndərilmiş (Prod): ${sentInterns}
🧪 Göndərilmiş (Test): ${testInterns}
🕓 Gözləmədə: ${pendingInterns}
`;

        bot.sendMessage(chatId, message, {parse_mode: 'Markdown'});
    });
};
