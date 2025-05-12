const axios = require('axios');
const cheerio = require('cheerio');
const Job = require('../models/Job');
const ScrapeInfo = require('../models/ScrapeInfo');

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

module.exports = scrapeJobs;
