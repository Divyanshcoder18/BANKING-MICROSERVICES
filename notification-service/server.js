require('dotenv').config();
const express = require('express');
const { connectRabbitMQ } = require('./src/utils/consumer.js');

const app = express();
app.use(express.json());

// HEALTH CHECK MUST BE FIRST
app.get('/health', (req, res) => res.json({ status: 'UP' }));

const PORT = process.env.PORT || 5004;

connectRabbitMQ()
    .then(() => {
        console.log("✅ [NOTIFY] Connected to RabbitMQ");
    })
    .catch(err => {
        console.log("⚠️ [NOTIFY] RabbitMQ not found. Running in HTTP-Only mode.");
    });

app.listen(PORT, () => {
    console.log(`🚀 Notification Service active on port ${PORT}`);
});
