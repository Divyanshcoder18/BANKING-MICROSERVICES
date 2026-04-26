require('dotenv').config();
const express = require('express');
const { connectRabbitMQ } = require('./src/utils/consumer.js');

const app = express();
app.use(express.json());

// FIXED HEALTH CHECK FOR GATEWAY
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

const PORT = process.env.PORT || 10000;

connectRabbitMQ().catch(err => console.log("RabbitMQ pending..."));

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Notification Service active on port ${PORT}`);
});
