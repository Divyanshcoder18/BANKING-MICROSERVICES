require('dotenv').config();
const { connectRabbitMQ } = require('./src/utils/consumer.js');

/**
 * THE POWER SWITCH (server.js)
 * This turns on the Notification Service and starts the "Ear" (RabbitMQ Consumer).
 */

console.log("🚀 Notification Service is starting up...");

// Start listening for messages
const express = require('express');
const app = express();
app.use(express.json());

const { sendTransactionEmail } = require('./src/services/email.services.js');

// EMERGENCY HTTP FALLBACK: If RabbitMQ is down, we can send notifications here
app.post('/api/notify/transaction', async (req, res) => {
    try {
        console.log("📨 [NOTIFY] Received direct HTTP notification");
        await sendTransactionEmail(req.body.type, req.body);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Start listening for messages (RabbitMQ)
connectRabbitMQ()
    .then(() => {
        console.log("✅ [NOTIFY] Connected to RabbitMQ");
    })
    .catch((err) => {
        console.log("⚠️ [NOTIFY] RabbitMQ not found. Running in HTTP-Only mode.");
    });

const PORT = process.env.PORT || 5004;app.get('/health', (req, res) => res.json({ status: 'UP' }));

app.listen(PORT, () => {
    console.log(`🚀 Notification Service active on port ${PORT}`);
});

app.get('/health', (req, res) => {
    res.json({ status: "NOTIFICATION_SERVICE_UP", timestamp: new Date() });
});

// Keep process alive
process.stdin.resume();
