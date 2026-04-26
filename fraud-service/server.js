require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { connectRabbitMQ } = require('./src/utils/consumer.js');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'fraud' });
});

const PORT = process.env.PORT || 10000;

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ Fraud Service DB Connected"))
    .catch(err => console.error("❌ Fraud DB Error:", err));

connectRabbitMQ();

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Fraud Service is monitoring on port ${PORT}`);
});
