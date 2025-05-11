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
const CHANNEL_USERNAME = process.env.CHANNEL_USERNAME;
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

const allowedUsers = [0, 1];
const isAllowed = (userId) => allowedUsers.includes(userId);

// ==== Scraper ====
async function scrapeJobs() {
  const url = 'https://www.hellojob.az/is-elanlari/texnologiya/proqramlasdirma';
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

// ==== Telegrama 10-luq Vakansiya Göndər ====
async function sendBatchPendingJobs(chatId = null) {
  const pendingJobs = await Job.find({ status: 'pending' }).limit(10);
  if (pendingJobs.length === 0) {
    if (chatId) bot.sendMessage(chatId, 'Gözləmədə vakansiya yoxdur.');
    return;
  }

  let msgText = '📤 Son vakansiyalar:\n\n';
  for (const job of pendingJobs) {
    msgText += `💼 *${job.title}*\n🏢 ${job.company}\n📅 ${job.date}\n🔗 [Elana keçid](${job.link})\n\n`;
    job.status = 'sent';
    await job.save();
  }

  await bot.sendMessage(CHANNEL_USERNAME, msgText, { parse_mode: 'Markdown' });
  if (chatId) bot.sendMessage(chatId, '✅ 10 vakansiya göndərildi!');
}

// ==== Telegram Əmrləri ====

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
  const sentJobs = await Job.countDocuments({ status: 'sent' });
  const pendingJobs = totalJobs - sentJobs;
  const info = await ScrapeInfo.findOne();
  const lastScrapedAt = info?.lastScrapedAt?.toLocaleString() || 'Yoxdur';

  let message = '🤖 Bot işə düşdü!\n\n';
  message += `📅 Son scraping: ${lastScrapedAt}\n`;
  message += `📤 Göndərilmiş: ${sentJobs}\n`;
  message += `🕓 Gözləmədə: ${pendingJobs}`;

  bot.sendMessage(chatId, message);
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  if (!isAllowed(chatId)) return;

  const helpText = `
🆘 *Əmrlər siyahısı*:

/start - Botun statusu
/help - Komandaların siyahısı
/scrap - Saytdan vakansiya yığ
/send - 10 gözləyən vakansiyanı göndər
/send <id> - İstədiyin ID-li vakansiyanı göndər
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
  const sentJobs = await Job.countDocuments({ status: 'sent' });
  const pendingJobs = totalJobs - sentJobs;
  const info = await ScrapeInfo.findOne();
  const lastScrapedAt = info?.lastScrapedAt?.toLocaleString() || 'Yoxdur';

  let message = '🔍 Scraping tamamlandı!\n\n';
  message += `📅 Son scraping: ${lastScrapedAt}\n`;
  message += `📥 Saytdan çəkilən: ${result.total}\n`;
  message += `🆕 Yeni əlavə edilən: ${result.added}\n`;
  message += `📤 Göndərilmiş: ${sentJobs}\n`;
  message += `🕓 Gözləmədə: ${pendingJobs}`;

  bot.sendMessage(chatId, message);
});

bot.onText(/^\/send$/, async (msg) => {
  const chatId = msg.chat.id;
  if (!isAllowed(chatId)) return;

  await sendBatchPendingJobs(chatId);
});

bot.onText(/\/send (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!isAllowed(chatId)) return;

  const jobId = match[1];
  try {
    const job = await Job.findById(jobId);
    if (!job) return bot.sendMessage(chatId, '❌ Vakansiya tapılmadı.');

    const message = `💼 *${job.title}*\n🏢 ${job.company}\n📅 ${job.date}\n🔗 [Elana keçid](${job.link})`;
    await bot.sendMessage(CHANNEL_USERNAME, message, { parse_mode: 'Markdown' });

    job.status = 'sent';
    await job.save();
    bot.sendMessage(chatId, '✅ Vakansiya göndərildi!');
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, '❌ Xəta baş verdi!');
  }
});

bot.onText(/\/list/, async (msg) => {
  const chatId = msg.chat.id;
  if (!isAllowed(chatId)) return;

  const jobs = await Job.find().sort({ createdAt: -1 }).limit(10);
  if (!jobs.length) return bot.sendMessage(chatId, 'Vakansiya yoxdur.');

  let msgText = '📋 Ən son 10 vakansiya:\n\n';
  jobs.forEach(j => {
    msgText += `🆔 ${j._id}\n💼 ${j.title}\n🏢 ${j.company}\n📅 ${j.date}\n🔗 ${j.link}\n📌 Status: ${j.status}\n\n`;
  });

  bot.sendMessage(chatId, msgText);
});

bot.onText(/\/log/, async (msg) => {
  const chatId = msg.chat.id;
  if (!isAllowed(chatId)) return;

  const sentJobs = await Job.find({ status: 'sent' }).sort({ createdAt: -1 }).limit(10);
  if (!sentJobs.length) return bot.sendMessage(chatId, 'Göndərilmiş vakansiya yoxdur.');

  let msgText = '📤 Göndərilmiş vakansiyalar:\n\n';
  sentJobs.forEach(j => {
    msgText += `💼 ${j.title}\n🏢 ${j.company}\n📅 ${j.date}\n🔗 ${j.link}\n\n`;
  });

  bot.sendMessage(chatId, msgText);
});

// ==== Server ====
app.listen(PORT, () => {
  console.log(`🚀 Server işləyir: http://localhost:${PORT}`);
});
