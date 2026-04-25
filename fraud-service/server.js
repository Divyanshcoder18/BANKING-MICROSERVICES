require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { connectRabbitMQ } = require('./src/utils/consumer.js');

const app = express();
app.use(express.json());

// 1. Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("✅ Fraud Service Database Connected");

        // 2. Start Listening to RabbitMQ
        connectRabbitMQ();

        // 3. Start the Express Monitoring server
        const PORT = process.env.PORT || 5005;
        app.listen(PORT, () => {
            console.log(`🚀 Fraud Service is monitoring on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ Fraud Service Database Connection Error:", err);
    });

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: "FRAUD_SERVICE_UP", surveillance: "ACTIVE" });
});
