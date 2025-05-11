require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const app = express();
const PORT = 3000;

// ==== Mongo Setup ====
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB qoşuldu'))
    .catch(err => console.error('Mongo səhvi:', err));

const jobSchema = new mongoose.Schema({
    title: String,
    link: String,
    company: String,
    date: String,
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

const Job = mongoose.model('Job', jobSchema);

const scrapeInfoSchema = new mongoose.Schema({
    lastScrapedAt: { type: Date, default: null }
});
const ScrapeInfo = mongoose.model('ScrapeInfo', scrapeInfoSchema);

// ==== Telegram Setup ====
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const PROD_CHANNEL_USERNAME = process.env.PROD_CHANNEL_USERNAME;
const TEST_CHANNEL_USERNAME = process.env.TEST_CHANNEL_USERNAME;
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

const allowedUsers = process.env.ALLOWED_USERS
    ? process.env.ALLOWED_USERS.split(',').map(id => parseInt(id.trim(), 10))
    : [];

const isAllowed = (userId) => allowedUsers.includes(userId);

// ==== Scraper ====
async function scrapeJobs() {
    const url = process.env.JOB_URL;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const jobs = [];
    $('.vacancies__list .vacancies__item').each((i, el) => {
        const title = $(el).find('.vacancies__title').text().trim();
        const link = $(el).find('a').attr('href');
        const company = $(el).find('.vacancies__company').text().trim();

        const infoItems = $(el).find('.vacancies__info__item');
        const date = $(infoItems[infoItems.length - 1]).text().trim();

        jobs.push({ title, link, company, date });
    });

    let addedCount = 0;
    for (const job of jobs) {
        const exists = await Job.findOne({ link: job.link });
        if (!exists) {
            await Job.create(job);
            addedCount++;
        }
    }

    await ScrapeInfo.findOneAndUpdate(
        {},
        { lastScrapedAt: new Date() },
        { upsert: true, new: true }
    );

    return { total: jobs.length, added: addedCount };
}

// ==== Telegram Commands ====

async function sendBatchPendingJobs(channelUsername, chatId = null) {
    const isProd = channelUsername === PROD_CHANNEL_USERNAME;
    // Prod üçün pending + test, test kanalı üçün yalnız pending
    const statuses = isProd ? ['pending', 'test'] : ['pending'];
    const jobsToSend = await Job.find({ status: { $in: statuses } }).limit(10);

    if (jobsToSend.length === 0) {
        if (chatId) bot.sendMessage(chatId, 'Gözləmədə vakansiya yoxdur.');
        return;
    }

    let msgText = '📤 Sonuncu əlavə edilmiş vakansiyalar:\n\n';
    for (const job of jobsToSend) {
        msgText += `💼 *${job.title}*\n🏢 ${job.company}\n📅 ${job.date}\n🔗 [Elana keçid](${job.link})\n\n`;

        // Statusu prod və ya test olaraq yenilə
        job.status = isProd ? 'prod' : 'test';
        await job.save();
    }
    msgText += `\n\n @TechCodeAz | TechCode.Az`;

    await bot.sendMessage(channelUsername, msgText, { parse_mode: 'Markdown' });
    if (chatId) bot.sendMessage(chatId, '✅ 10 vakansiya göndərildi!');
}


async function sendJobById(jobId, channelUsername, chatId = null) {
    try {
        const job = await Job.findById(jobId);
        if (!job) return bot.sendMessage(chatId, '❌ Vakansiya tapılmadı.');

        const message = `💼 *${job.title}*\n🏢 ${job.company}\n📅 ${job.date}\n🔗 [Elana keçid](${job.link})\n @TechCodeAz | TechCode.Az`;
        await bot.sendMessage(channelUsername, message, { parse_mode: 'Markdown' });

        // Update status based on channel
        job.status = channelUsername === PROD_CHANNEL_USERNAME ? 'prod' : 'test';
        await job.save();

        bot.sendMessage(chatId, '✅ Vakansiya göndərildi!');
    } catch (err) {
        console.error(err);
        bot.sendMessage(chatId, '❌ Xəta baş verdi!');
    }
}

// ==== Telegram Bot Logic ====

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  if (!isAllowed(chatId)) {
    bot.sendMessage(chatId, "❌ Bu bot Techcode-a məxsusdur və yalnız idarəçilər üçündür.");
  }
});

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    if (!isAllowed(chatId)) return;

    const totalJobs = await Job.countDocuments();
    const sentJobs = await Job.countDocuments({ status: 'prod' });  // Proda göndərilənlər
    const testJobs = await Job.countDocuments({ status: 'test' });  // Testə göndərilənlər
    const pendingJobs = totalJobs - sentJobs - testJobs;  // Gözləmədəki vakansiyalar
    const info = await ScrapeInfo.findOne();
    const lastScrapedAt = info?.lastScrapedAt?.toLocaleString() || 'Yoxdur';

    let message = '🤖 Bot işə düşdü!\n\n';
    message += `📅 Son scraping: ${lastScrapedAt}\n`;
    message += `📤 Göndərilmiş (Prod): ${sentJobs}\n`;
    message += `🧪 Göndərilmiş (Test): ${testJobs}\n`;
    message += `🕓 Gözləmədə: ${pendingJobs}`;

    bot.sendMessage(chatId, message);
});

bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    if (!isAllowed(chatId)) return;

    const helpText = `🆘 *Əmrlər siyahısı*:

  /start - Botun statusu
  /help - Komandaların siyahısı
  /scrap - Saytdan vakansiya yığ
  /send prod - prod kanalına 10 vakansiya göndər
  /send test - test kanalına 10 vakansiya göndər
  /send prod <id> - prod kanalına bir vakansiya göndər
  /send test <id> - test kanalına bir vakansiya göndər
  /list - Son 10 vakansiyanı göstər
  /log - Son 10 göndərilmiş vakansiyanı göstər
  `;
    bot.sendMessage(chatId, helpText, { parse_mode: 'Markdown' });
});

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

    let message = '🔍 Scraping tamamlandı!\n\n';
    message += `📅 Son scraping: ${lastScrapedAt}\n`;
    message += `📥 Saytdan çəkilən: ${result.total}\n`;
    message += `🆕 Yeni əlavə edilən: ${result.added}\n`;
    message += `📤 Göndərilmiş (Prod): ${sentJobs}\n`;
    message += `🧪 Göndərilmiş (Test): ${testJobs}\n`;
    message += `🕓 Gözləmədə: ${pendingJobs}`;

    bot.sendMessage(chatId, message);
});

bot.onText(/\/send (prod|test)$/, async (msg, match) => {
    const chatId = msg.chat.id;
    if (!isAllowed(chatId)) return;

    const channel = match[1] === 'prod' ? PROD_CHANNEL_USERNAME : TEST_CHANNEL_USERNAME;
    await sendBatchPendingJobs(channel, chatId);
});

bot.onText(/\/send (prod|test) (\w+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    if (!isAllowed(chatId)) return;

    const channel = match[1] === 'prod' ? PROD_CHANNEL_USERNAME : TEST_CHANNEL_USERNAME;
    const jobId = match[2];
    await sendJobById(jobId, channel, chatId);
});

bot.onText(/\/list/, async (msg) => {
    const chatId = msg.chat.id;
    if (!isAllowed(chatId)) return;

    const jobs = await Job.find().sort({ createdAt: -1 }).limit(10);
    if (!jobs.length) return bot.sendMessage(chatId, 'Vakansiya yoxdur.');

    let msgText = '📋 Ən son 10 vakansiya:\n\n';
    jobs.forEach(j => {
        msgText += `🆔 \`${j._id}\`\n💼 ${j.title}\n🏢 ${j.company}\n📅 ${j.date}\n🔗 ${j.link}\n📌 Status: ${j.status}\n\n`;
    });

    bot.sendMessage(chatId, msgText);
});

bot.onText(/\/log/, async (msg) => {
    const chatId = msg.chat.id;
    if (!isAllowed(chatId)) return;

    const sentJobs = await Job.find({ status: 'prod' }).sort({ createdAt: -1 }).limit(10);
    if (!sentJobs.length) return bot.sendMessage(chatId, 'Heç bir vakansiya göndərilməyib.');

    let msgText = '📋 Son 10 göndərilən vakansiya:\n\n';
    sentJobs.forEach(j => {
        msgText += `🆔 \`${j._id}\`\n💼 ${j.title}\n🏢 ${j.company}\n📅 ${j.date}\n🔗 ${j.link}\n📌 Status: ${j.status}\n\n`;
    });

    bot.sendMessage(chatId, msgText);
});

app.listen(PORT, () => console.log(`🚀 Server işləyir: http://localhost:${PORT}`));
