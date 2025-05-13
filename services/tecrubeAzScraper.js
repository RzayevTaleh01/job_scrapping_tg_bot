const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const Intern = require('../models/Intern');
const ScrapeInfo = require('../models/ScrapeInfo');

const BASE_URL = 'https://tecrube.az';
const START_URL = `${BASE_URL}/vacancies?category=tecrube-proqramlari&city=Baku&page=2&postedDate=month`;

async function getFullHtmlWithJS(url) {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    const content = await page.content();

    const dates = await page.$$eval(
        '.flex.flex-row.overflow-auto.lg\\:flex-col > div',
        (divs) => {
            const result = { start_date: '', end_date: '' };
            if (divs[2]) {
                result.start_date = divs[2].querySelector('p.text-sm')?.innerText.trim() || '';
            }
            if (divs[3]) {
                result.end_date = divs[3].querySelector('p.text-sm')?.innerText.trim() || '';
            }
            return result;
        }
    );

    await browser.close();
    return { html: content, ...dates };
}

async function scrapeTecrubeAz(bot=null , chatID=null) {
    const { data } = await axios.get(START_URL);
    const $ = cheerio.load(data);
    const cardLinks = [];

    $('.grid.grid-cols-12.gap-3 .col-span-12').each((i, el) => {
        const link = $(el).find('.p-6.pt-0.px-4.pb-4 a').attr('href');
        if (link) cardLinks.push(BASE_URL + link);
    });

    function formatDescription(html, maxSectionLength = 2000) {
        const $ = cheerio.load(html);
        let result = '';
        const seen = new Set();

        $('div').each((i, section) => {
            const header = $(section).find('p.h5-header').first().text().trim();

            if (header.toLowerCase().includes('öhdəliklər')) return;

            let sectionText = '';

            const paragraphs = $(section).find('p').not('.h5-header');
            paragraphs.each((j, p) => {
                const text = $(p).text().trim();
                if (
                    text &&
                    !seen.has(text) &&
                    !text.toLowerCase().includes('məlumat veriləcək')
                ) {
                    sectionText += `${text}\n`;
                    seen.add(text);
                }
            });

            const lists = $(section).find('ul');
            lists.each((j, ul) => {
                $(ul).find('li').each((k, li) => {
                    const item = $(li).text().trim();
                    if (item && !seen.has(item)) {
                        sectionText += `• ${item}\n`;
                        seen.add(item);
                    }
                });
            });

            sectionText = sectionText.trim();
            if (sectionText.length > maxSectionLength) {
                sectionText = sectionText.slice(0, maxSectionLength).trim() + '...';
            }

            if (header || sectionText) {
                if (header) result += `\n\n*${header}*\n`;
                result += sectionText + '\n';
            }
        });

        return result.trim();
    }

    let addedCount = 0;
    for (const link of cardLinks) {
        console.log(link)
        try {
            const { html: detailHtml, start_date, end_date } = await getFullHtmlWithJS(link);
            const $$ = cheerio.load(detailHtml);
            const company = $$('.text-base.text-center').text().trim();
            const head = $$('h1.h3-header.font-semibold.text-center').text().trim();
            const descriptionHtml = $$('.w-full.lg\\:w-2\\/3.border.border-\\[\\#E4E6E8\\].border-opacity-60.rounded-2xl.p-6.lg\\:py-7.lg\\:px-12.flex.flex-col.gap-10').html();
            const description = formatDescription(descriptionHtml || '');
            const apply_link = $$('.hidden.lg\\:flex.items-center.gap-2 a').attr('href');
            const base_url = link;
            const exists = await Intern.findOne({ base_url });
            if (!exists) {
                await Intern.create({ base_url ,company, head, description, apply_link, start_date, end_date , status: 'pending' });
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
