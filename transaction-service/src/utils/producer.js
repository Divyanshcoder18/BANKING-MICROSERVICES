const amqp = require('amqplib');
const axios = require('axios');

let channel;
const queue = 'transaction-events';

async function connectRabbitMQ() {
    let retries = 5;
    while (retries) {
        try {
            console.log(`[RABBITMQ] Attempting to connect... (Retries left: ${retries})`);
            const connection = await amqp.connect(process.env.RABBITMQ_URI || 'amqp://localhost');
            channel = await connection.createChannel();
            await channel.assertQueue(queue, { durable: true });
            console.log("✅ [RABBITMQ] Connected successfully");
            return;
        } catch (error) {
            retries -= 1;
            console.log(`⚠️ [RABBITMQ] Connection failed. Retrying in 5 seconds...`);
            if (retries === 0) {
                console.error("❌ [RABBITMQ] Critical: Could not connect to RabbitMQ broker.");
                throw error;
            }
            await new Promise(res => setTimeout(res, 5000));
        }
    }
}

async function publishTransactionEvent(eventData) {
    // 1. Try RabbitMQ First
    if (channel) {
        try {
            channel.sendToQueue(queue, Buffer.from(JSON.stringify(eventData)), { persistent: true });
            console.log(`[RABBITMQ] Published: ${eventData.type}`);
            return;
        } catch (error) {
            console.error("❌ [RABBITMQ] Publish failed, falling back to HTTP...");
        }
    }

    // 2. Emergency HTTP Fallback (Direct connection to Notification Service)
    try {
        console.log(`[HYBRID] Sending direct HTTP notification for: ${eventData.type}`);
        await axios.post('http://localhost:5004/api/notify/transaction', eventData);
        console.log("✅ [HYBRID] HTTP Notification Sent Successfully");
    } catch (httpError) {
        console.error("❌ [HYBRID] All notification methods failed:", httpError.message);
    }
}

module.exports = { connectRabbitMQ, publishTransactionEvent };
