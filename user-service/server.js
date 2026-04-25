require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./src/app.js');
const { connectRabbitMQ } = require('./src/utils/consumer.js');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/banking-system')
    .then(() => {
        console.log("✅ User Service Database Connected");

        connectRabbitMQ();

        const PORT = process.env.PORT || 5003;
        app.listen(PORT, () => {
            console.log(`🚀 User Service is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ User Service Initialization Error:", err);
    });
