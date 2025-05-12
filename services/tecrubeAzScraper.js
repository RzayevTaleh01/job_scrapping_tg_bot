const axios = require('axios');
const cheerio = require('cheerio');
const Intern = require('../models/Intern');
const ScrapeInfo = require('../models/ScrapeInfo');

const BASE_URL = 'https://tecrube.az';
const START_URL = `${BASE_URL}/vacancies?category=tecrube-proqramlari&city=Baku&page=1&postedDate=month`;

async function scrapeTecrubeAz() {
    const { data } = await axios.get(START_URL);
    const $ = cheerio.load(data);
    const cardLinks = [];

    $('.grid.grid-cols-12.gap-3 .col-span-12').each((i, el) => {
        const link = $(el).find('.p-6.pt-0.px-4.pb-4 a').attr('href');
        if (link) cardLinks.push(BASE_URL + link);
    });

    function formatDescription(html) {
        const $ = cheerio.load(html);
        let result = '';

        $('div').each((i, section) => {
            const header = $(section).find('p.h5-header').first().text().trim();
            if (header) result += `\n\n*${header}*\n`;

            const paragraphs = $(section).find('p').not('.h5-header');
            paragraphs.each((j, p) => {
                const text = $(p).text().trim();
                if (text) result += `${text}\n`;
            });

            const lists = $(section).find('ul');
            lists.each((j, ul) => {
                $(ul).find('li').each((k, li) => {
                    const item = $(li).text().trim();
                    if (item) result += `• ${item}\n`;
                });
            });
        });

        return result.trim();
    }

    let addedCount = 0;

    for (const link of cardLinks) {
        try {
            const { data: detailHtml } = await axios.get(link);
            const $$ = cheerio.load(detailHtml);
            const company = $$('.text-base.text-center').text().trim();
            const head = $$('h1.h3-header.font-semibold.text-center').text().trim();
            const descriptionHtml = $$('.w-full.lg\\:w-2\\/3.border.border-\\[\\#E4E6E8\\].border-opacity-60.rounded-2xl.p-6.lg\\:py-7.lg\\:px-12.flex.flex-col.gap-10').html();
            const description = formatDescription(descriptionHtml);
            console.log(descriptionHtml)
            const apply_link = $$('.hidden.lg\\:flex.items-center.gap-2 a').attr('href');

            let start_date = '';
            let end_date = '';

            const exists = await Intern.findOne({ apply_link });
            if (!exists) {
                await Intern.create({ company, head, description, apply_link, start_date, end_date });
                addedCount++;
            }
        } catch (err) {
            console.error(`❌ ${link} səhifəsində xəta baş verdi`, err.message);
        }
    }

    await ScrapeInfo.findOneAndUpdate(
        { sourceId: 2 },
        { lastScrapedAt: new Date() },
        { upsert: true, new: true }
    );

    return { total: cardLinks.length, added: addedCount };
}

module.exports = scrapeTecrubeAz;
