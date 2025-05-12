const mongoose = require('mongoose');

const scrapeInfoSchema = new mongoose.Schema({
    sourceId: {
        type: Number,
        required: true,
        unique: true,
    },
    lastScrapedAt: {
        type: Date,
        default: null,
    }
}, { timestamps: true });

module.exports = mongoose.model('ScrapeInfo', scrapeInfoSchema);
