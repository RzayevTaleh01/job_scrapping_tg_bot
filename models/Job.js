const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: String,
    link: String,
    company: String,
    date: String,
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);
