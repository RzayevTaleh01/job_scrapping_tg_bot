const mongoose = require('mongoose');

const scrapeInfoSchema = new mongoose.Schema({
    lastScrapedAt: { type: Date, default: null }
});

module.exports = mongoose.model('ScrapeInfo', scrapeInfoSchema);
