const { Job, Intern } = require('../../models');
require('dotenv').config();

let modelName = [];
try {
    modelName = JSON.parse(process.env.MODEL_NAMES);
} catch (err) {
    console.error('❌ MODEL_NAMES .env faylında düzgün JSON deyil:', err.message);
}

module.exports = function (bot, isAllowed) {
    bot.onText(/\/list(?:\s(\d+))?(?:\s(\w+))?/, async (msg, match) => {
        const chatId = msg.chat.id;
        if (!isAllowed(chatId)) return;

        const option = match[1];      // model id
        const statusFilter = match[2]; // status (optional)

        if (!option) {
            const listOptions = `*📌 Hansı saytdan vakansiya siyahısı göstərilsin?*\n\n` +
                modelName.map(site => `${site.id} - ${site.name}`).join('\n') +
                `\n\n✏️ Misal:\n\`/list 1 pending\` — HelloJob üçün pending vakansiyalar`;
            return bot.sendMessage(chatId, listOptions, { parse_mode: 'Markdown' });
        }

        let Model;
        if (option === '1') {
            Model = Job;
        } else if (option === '2') {
            Model = Intern;
        } else {
            return bot.sendMessage(chatId, "❌ Yanlış seçim. Zəhmət olmasa `1` və ya `2` daxil edin.");
        }

        const query = statusFilter ? { status: statusFilter } : {};
        const entries = await Model.find(query).sort({ createdAt: -1 }).limit(20);

        if (!entries.length) {
            return bot.sendMessage(chatId, `🔍 Heç bir vakansiya tapılmadı${statusFilter ? ` (status: ${statusFilter})` : ''}.`);
        }

        const site = modelName.find(x => x.id == option);
        let msgText = `📋 *${site?.name || 'Sayt'}* üçün bazadakı ${statusFilter ? `"${statusFilter}"` : 'son'} 20 vakansiya:\n\n`;

        entries.forEach(j => {
            msgText += `🆔 \`${j._id}\`\n💼 ${j.title || j.head}\n🏢 ${j.company}\n`;

            if (option === '2') {
                msgText += `📅 Tarix: ${j.start_date} - ${j.end_date}\n`;
            }

            msgText += `🔗 ${j.link || j.base_url}\n📌 Status: ${j.status || 'yoxdur'}\n\n`;
        });

        bot.sendMessage(chatId, msgText, { parse_mode: 'Markdown' });
    });
};
