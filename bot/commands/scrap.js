const {Job, Intern, ScrapeInfo} = require('../../models');
const helloJobScraper = require('../../services/scraper_model_1');
const tecrubeAzScraper = require('../../services/scrapper_model_2');
require('dotenv').config();

let modelName = [];
try {
    modelName = JSON.parse(process.env.MODEL_NAMES);
} catch (err) {
    console.error('❌ MODEL_NAMES .env faylında düzgün JSON deyil:', err.message);
}

module.exports = function (bot, isAllowed) {
    bot.onText(/\/scrap(?:\s(\d+))?/, async (msg, match) => {
        const chatId = msg.chat.id;
        if (!isAllowed(chatId)) return;

        const option = match[1];

        if (!option) {
            const optionsMessage = `📌 Hansı saytdan scraping etmək istəyirsiniz?\n\n` +
                modelName.map(site => `${site.id} - ${site.name}`).join('\n') +
                `\n\nMisal: /scrap 2`;
            return bot.sendMessage(chatId, optionsMessage);
        }

        let scraperFn;
        let Model;
        let sourceId = parseInt(option);

        if (sourceId === 1) {
            scraperFn = helloJobScraper;
            Model = Job;
        } else if (sourceId === 2) {
            scraperFn = tecrubeAzScraper;
            Model = Intern;
        } else {
            return bot.sendMessage(chatId, "❌ Yanlış seçim. Zəhmət olmasa 1 və ya 2 daxil edin.");
        }

        try {
            const result = await scraperFn();
            console.log(result)
            const total = await Model.countDocuments();
            const info = await ScrapeInfo.findOne({sourceId});
            const lastScrapedAt = info?.lastScrapedAt?.toLocaleString() || 'Yoxdur';
            const testJobs = await Model.countDocuments({status: 'test'});
            const prodJobs = await Model.countDocuments({status: 'prod'});

            const site = modelName.find(x => x.id === sourceId);
            const message = `🔍 ${site?.name || 'Sayt'} - Scraping tamamlandı!
📅 Son scraping: ${lastScrapedAt}
📥 Saytdan çəkilən: ${result.total}
🆕 Yeni əlavə edilən: ${result.added}
📦 Cəmi saxlanılan: ${total}
📤 Göndərilmiş (Prod): ${prodJobs}
🧪 Göndərilmiş (Test): ${testJobs}`;

            bot.sendMessage(chatId, message);
        } catch (error) {
            console.error(error);
            bot.sendMessage(chatId, "⚠️ Scraping zamanı xəta baş verdi.");
        }
    });
};
