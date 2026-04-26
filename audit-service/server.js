require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { connectRabbitMQ } = require('./src/utils/consumer.js');

const app = express();
app.use(express.json());

// HEALTH CHECK MUST BE FIRST
app.get('/health', (req, res) => res.json({ status: 'UP' }));

const PORT = process.env.PORT || 5006;

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ Audit Service DB Connected"))
    .catch(err => console.error("❌ Audit DB Error:", err));

connectRabbitMQ();

app.listen(PORT, () => {
    console.log(`🚀 Audit Service is recording on port ${PORT}`);
});
