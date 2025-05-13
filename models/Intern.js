
const mongoose = require('mongoose');

const internSchema = new mongoose.Schema({
    company: {
        type: String,
    },
    base_url: {
        type: String,
    },
    head: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    apply_link: {
        type: String,
    },
    start_date: {
        type: String,
    },
    end_date: {
        type: String,
    },
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now }

}, { timestamps: true });

module.exports = mongoose.model('Intern', internSchema);
