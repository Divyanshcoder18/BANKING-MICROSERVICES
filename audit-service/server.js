require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { connectRabbitMQ } = require('./src/utils/consumer.js');

const app = express();
app.use(express.json());

// 1. Connect to Audit Database
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("✅ Audit Service Database Connected");

        // 2. Start Listening
        connectRabbitMQ();

        // 3. Start Server
        const PORT = process.env.PORT || 5006;
        app.listen(PORT, () => {
            console.log(`🚀 Audit Service is recording on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ Audit Service Database Error:", err);
    });

app.get('/health', (req, res) => {
    res.json({ status: "AUDIT_SERVICE_UP", recording: "ACTIVE" });
});
