const {Job, Intern, ScrapeInfo} = require('../../models');
const helloJobScraper = require('../../services/scraper'); // 1 - HelloJob
const tecrubeAzScraper = require('../../services/tecrubeAzScraper'); // 2 - Tecrube.Az

module.exports = function (bot, isAllowed) {
    let modelName = [{
        id: 1,
        name: 'HelloJob.Az'
    }, {
        id: 2,
        name: 'Tecrube.Az'
    }]

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
        let sourceId;

        if (option === '1') {
            scraperFn = helloJobScraper;
            Model = Job;
            sourceId = 1;
        } else if (option === '2') {
            scraperFn = tecrubeAzScraper;
            Model = Intern;
            sourceId = 2;
        } else {
            return bot.sendMessage(chatId, "❌ Yanlış seçim. Zəhmət olmasa 1 və ya 2 daxil edin.");
        }

        try {
            const result = await scraperFn(); // bu funksiyalar öz içində modelə save edir
            const total = await Model.countDocuments();
            console.log(option)
            const info = await ScrapeInfo.findOne({sourceId});
            const lastScrapedAt = info?.lastScrapedAt?.toLocaleString() || 'Yoxdur';
            const testJobs = await Model.countDocuments({status: 'test'});
            const prodJobs = await Model.countDocuments({status: 'prod'});

            const message = `🔍 ${modelName.find(x => x.id == option).name} - Scraping tamamlandı!
            \n📅 Son scraping: ${lastScrapedAt}\n📥 Saytdan çəkilən: ${result.total}\n🆕 Yeni əlavə edilən: ${result.added}\n📦 Cəmi saxlanılan: ${total}\n📤 Göndərilmiş (Prod): ${prodJobs}\n🧪 Göndərilmiş (Test): ${testJobs}`;
            bot.sendMessage(chatId, message);
        } catch (error) {
            console.error(error);
            bot.sendMessage(chatId, "⚠️ Scraping zamanı xəta baş verdi.");
        }
    });
};
