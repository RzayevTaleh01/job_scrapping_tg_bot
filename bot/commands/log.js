const { Job, Intern } = require('../../models');
require('dotenv').config();

let modelName = [];
try {
    modelName = JSON.parse(process.env.MODEL_NAMES);
} catch (err) {
    console.error('❌ MODEL_NAMES .env faylında düzgün JSON deyil:', err.message);
}

module.exports = function (bot, isAllowed) {
    bot.onText(/\/log(?:\s(\d+))?/, async (msg, match) => {
        const chatId = msg.chat.id;
        if (!isAllowed(chatId)) return;

        const option = match[1];

        if (!option) {
            const optionsMessage = `📌 Hansı sayta aid göndərilmiş vakansiyaları görmək istəyirsiniz?\n\n` +
                modelName.map(site => `${site.id} - ${site.name}`).join('\n') +
                `\n\nMisal: /log 2`;
            return bot.sendMessage(chatId, optionsMessage);
        }

        let Model;
        if (option === '1') {
            Model = Job;
        } else if (option === '2') {
            Model = Intern;
        } else {
            return bot.sendMessage(chatId, "❌ Yanlış seçim. Zəhmət olmasa 1 və ya 2 daxil edin.");
        }

        const sentItems = await Model.find({ status: 'prod' }).sort({ createdAt: -1 }).limit(25);
        if (!sentItems.length) return bot.sendMessage(chatId, '🔍 Hələ ki, heç bir vakansiya göndərilməyib.');

        const site = modelName.find(x => x.id == option);
        let msgText = `📋 ${site?.name || 'Sayt'} üçün göndərilmiş vakansiyalar (son 25):\n\n`;

        sentItems.forEach(j => {
            msgText += `🆔 \`${j._id}\`\n💼 ${j.title || j.head}\n🏢 ${j.company}\n🔗 ${j.link || j.apply_link}\n📌 Status: ${j.status}\n\n`;
        });

        bot.sendMessage(chatId, msgText, { parse_mode: 'Markdown' });
    });
};
