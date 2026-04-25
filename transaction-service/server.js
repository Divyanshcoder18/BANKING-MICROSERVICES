require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./src/app.js');
const { connectRabbitMQ } = require('./src/utils/producer.js');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/banking-system')
    .then(async () => {
        console.log("✅ Transaction Service Database Connected");

        // Connect to RabbitMQ for event publishing
        await connectRabbitMQ();

        const PORT = process.env.PORT || 5001;
        app.listen(PORT, () => {
            console.log(`🚀 Transaction Service is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ Transaction Service Initialization Error:", err);
    });
