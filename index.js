require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;

// Mongo bağlantısı
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB qoşuldu'))
    .catch(err => console.error('Mongo səhvi:', err));

// Botu işə sal
require('./bot');

app.listen(PORT, () => console.log(`🚀 Server işləyir: http://localhost:${PORT}`));
