const { Job, Intern } = require('../../models');
require('dotenv').config();

let modelName = [];
try {
    modelName = JSON.parse(process.env.MODEL_NAMES);
} catch (err) {
    console.error('❌ MODEL_NAMES .env faylında düzgün JSON deyil:', err.message);
}

module.exports = function (bot, isAllowed) {
    bot.onText(/\/list(?:\s(\d+))?/, async (msg, match) => {
        const chatId = msg.chat.id;
        if (!isAllowed(chatId)) return;

        const option = match[1];

        if (!option) {
            const listOptions = `📌 Hansı saytdan vakansiya siyahısı göstərilsin?\n\n` +
                modelName.map(site => `${site.id} - ${site.name}`).join('\n') +
                `\n\nMisal: /list 2`;
            return bot.sendMessage(chatId, listOptions);
        }

        let Model;
        if (option === '1') {
            Model = Job;
        } else if (option === '2') {
            Model = Intern;
        } else {
            return bot.sendMessage(chatId, "❌ Yanlış seçim. Zəhmət olmasa 1 və ya 2 daxil edin.");
        }

        const entries = await Model.find().sort({ createdAt: -1 }).limit(25);
        if (!entries.length) return bot.sendMessage(chatId, '🔍 Vakansiya tapılmadı.');

        const site = modelName.find(x => x.id == option);
        let msgText = `📋 ${site?.name || 'Sayt'} üçün bazadakı son 25 vakansiya:\n\n`;

        entries.forEach(j => {
            msgText += `🆔 \`${j._id}\`\n💼 ${j.title || j.head}\n🏢 ${j.company}\n🔗 ${j.link || j.apply_link}\n📌 Status: ${j.status || 'yoxdur'}\n\n`;
        });

        bot.sendMessage(chatId, msgText, { parse_mode: 'Markdown' });
    });
};
