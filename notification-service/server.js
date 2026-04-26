require('dotenv').config();
const express = require('express');
const { connectRabbitMQ } = require('./src/utils/consumer.js');

const app = express();
app.use(express.json());

// THE MAGIC FIX: This route must be exactly like the others
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'notification' });
});

const PORT = process.env.PORT || 10000;

// Connect to RabbitMQ in background so it doesn't block startup
connectRabbitMQ().catch(err => console.log("RabbitMQ pending..."));

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Notification Service active on port ${PORT}`);
});
