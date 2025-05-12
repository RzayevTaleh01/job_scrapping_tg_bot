const { Job } = require('../../models');

module.exports = function (bot, isAllowed, prodChannel, testChannel) {
    async function sendBatchPendingJobs(channelUsername, chatId = null) {
        const isProd = channelUsername === prodChannel;
        const statuses = isProd ? ['pending', 'test'] : ['pending'];
        const jobsToSend = await Job.find({ status: { $in: statuses } }).limit(10);

        if (!jobsToSend.length) {
            if (chatId) bot.sendMessage(chatId, 'Gözləmədə vakansiya yoxdur.');
            return;
        }

        let msgText = '📤 Sonuncu əlavə edilmiş vakansiyalar:\n\n';
        for (const job of jobsToSend) {
            msgText += `💼 *${job.title}*\n🏢 ${job.company}\n📅 ${job.date}\n🔗 [Elana keçid](${job.link})\n\n`;

            job.status = isProd ? 'prod' : 'test';
            await job.save();
        }

        msgText += `\n@TechCodeAz | TechCode.Az`;

        await bot.sendMessage(channelUsername, msgText, { parse_mode: 'Markdown' });
        if (chatId) bot.sendMessage(chatId, '✅ Vakansiyalar göndərildi!');
    }

    async function sendJobById(jobId, channelUsername, chatId = null) {
        try {
            const job = await Job.findById(jobId);
            if (!job) return bot.sendMessage(chatId, '❌ Vakansiya tapılmadı.');

            const message = `💼 *${job.title}*\n🏢 ${job.company}\n📅 ${job.date}\n🔗 [Elana keçid](${job.link})\n@TechCodeAz | TechCode.Az`;
            await bot.sendMessage(channelUsername, message, { parse_mode: 'Markdown' });

            job.status = channelUsername === prodChannel ? 'prod' : 'test';
            await job.save();

            if (chatId) bot.sendMessage(chatId, '✅ Vakansiya göndərildi!');
        } catch (err) {
            console.error(err);
            bot.sendMessage(chatId, '❌ Xəta baş verdi!');
        }
    }

    bot.onText(/\/send (prod|test)$/, async (msg, match) => {
        const chatId = msg.chat.id;
        if (!isAllowed(chatId)) return;

        const channel = match[1] === 'prod' ? prodChannel : testChannel;
        await sendBatchPendingJobs(channel, chatId);
    });

    bot.onText(/\/send (prod|test) (\w+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        if (!isAllowed(chatId)) return;

        const channel = match[1] === 'prod' ? prodChannel : testChannel;
        const jobId = match[2];
        await sendJobById(jobId, channel, chatId);
    });
};
