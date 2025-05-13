const {Job, Intern} = require('../../models');

module.exports = function (bot, isAllowed, prodChannel, testChannel) {
    async function sendBatchPendingItems(Model, channelUsername, chatId = null) {
        const isProd = channelUsername === prodChannel;
        const statuses = isProd ? ['pending', 'test'] : ['pending'];
        const itemsToSend = await Model.find({status: {$in: statuses}}).limit(10);

        if (!itemsToSend.length) {
            if (chatId) bot.sendMessage(chatId, 'Gözləmədə vakansiya yoxdur.');
            return;
        }

        const isIntern = Model.modelName === 'Intern';
        let msgText = isIntern ? '🧪 *Yeni təcrübə proqramları:*\n\n' : '📤 Sonuncu əlavə edilmiş vakansiyalar:\n\n';

        for (const item of itemsToSend) {

            if (isIntern) {
                msgText += `🎓 *${item.head}*\n🏢 ${item.company}\n📅 Başlama: ${item.start_date}\n📅 Bitmə: ${item.end_date}\n${item.base_url ? `🔗 [Elana keçid](${item.base_url})\n` : ""}${item.apply_link ? `✅ [Müraciət Et](${item.apply_link})\n` : ""}\n`;
            } else {
                msgText += `💼 *${item.title}*\n🏢 ${item.company}\n📅 ${item.date}\n🔗 [Elana keçid](${item.link})\n\n`;
            }
            item.status = isProd ? 'prod' : 'test';
            await item.save();
        }

        msgText += `\n@TechCodeAz | TechCode.Az`;

        await bot.sendMessage(channelUsername, msgText, {parse_mode: 'Markdown'});
        if (chatId) bot.sendMessage(chatId, '✅ Göndərildi!');
    }

    async function sendItemById(Model, itemId, channelUsername, chatId = null) {
        try {
            const item = await Model.findById(itemId);
            if (!item) return bot.sendMessage(chatId, '❌ Tapılmadı.');

            let message;
            const isIntern = Model.modelName === 'Intern';

            if (isIntern) {
                message = `🎓 *${item.head}*\n🏢 ${item.company}\n📅 Başlama: ${item.start_date}\n📅 Bitmə: ${item.end_date}\n🔗 [Elana keçid](${item.base_url})\n${item.apply_link ? `🔗 [Müraciət Et](${item.apply_link})\n` : ""}\n${item.description}\n\n@TechCodeAz | TechCode.Az`;
            } else {
                message = `💼 *${item.title}*\n🏢 ${item.company}\n📅 ${item.date}\n🔗 [Elana keçid](${item.link})\n@TechCodeAz | TechCode.Az`;
            }

            await bot.sendMessage(channelUsername, message, {parse_mode: 'Markdown'});

            item.status = channelUsername === prodChannel ? 'prod' : 'test';
            await item.save();

            if (chatId) bot.sendMessage(chatId, '✅ Göndərildi!');
        } catch (err) {
            console.error(err);
            bot.sendMessage(chatId, '❌ Xəta baş verdi!');
        }
    }

    bot.onText(/\/send$/, async (msg) => {
        const chatId = msg.chat.id;
        if (!isAllowed(chatId)) return;

        const message = `📤 *Vakansiya göndərmək üçün model və kanal seçin:*

Misallar:
\`/send prod 1\` – HelloJob vakansiyalarını *prod* kanalına göndər  
\`/send test 1\` – HelloJob vakansiyalarını *test* kanalına göndər  
\`/send prod 2\` – Təcrübə proqramlarını *prod* kanalına göndər  
\`/send test 2\` – Təcrübə proqramlarını *test* kanalına göndər

📌 *ID ilə göndərmək üçün:*
\`/send prod 1 <id>\`  
\`/send test 2 <id>\`
`;

        bot.sendMessage(chatId, message, {parse_mode: 'Markdown'});
    });

    bot.onText(/\/send (prod|test) (\d)?$/, async (msg, match) => {
        const chatId = msg.chat.id;
        if (!isAllowed(chatId)) return;

        const channel = match[1] === 'prod' ? prodChannel : testChannel;
        const modelOption = match[2];

        const Model = modelOption === '2' ? Intern : Job;
        await sendBatchPendingItems(Model, channel, chatId);
    });


    bot.onText(/\/send (prod|test) (\d) (\w+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        if (!isAllowed(chatId)) return;

        const channel = match[1] === 'prod' ? prodChannel : testChannel;
        const modelOption = match[2];
        const itemId = match[3];

        const Model = modelOption === '2' ? Intern : Job;
        await sendItemById(Model, itemId, channel, chatId);
    });
};
