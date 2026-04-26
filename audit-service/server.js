require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { connectRabbitMQ } = require('./src/utils/consumer.js');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'audit' });
});

const PORT = process.env.PORT || 10000;

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ Audit Service DB Connected"))
    .catch(err => console.error("❌ Audit DB Error:", err));

connectRabbitMQ();

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Audit Service is recording on port ${PORT}`);
});
