const amqp = require('amqplib');
const axios = require('axios');

let channel;
const exchange = 'banking-events';

async function connectRabbitMQ() {
    let retries = 5;
    while (retries) {
        try {
            console.log(`[RABBITMQ] Attempting to connect... (Retries left: ${retries})`);
            const connection = await amqp.connect(process.env.RABBITMQ_URI || 'amqp://localhost');
            channel = await connection.createChannel();
            
            // Use Fanout so ALL services (Audit, Fraud, etc) get every transaction
            await channel.assertExchange(exchange, 'fanout', { durable: true });
            
            console.log("✅ [RABBITMQ] Connected successfully to Exchange");
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
    if (channel) {
        try {
            // Broadcast to the exchange instead of a single queue
            channel.publish(exchange, '', Buffer.from(JSON.stringify(eventData)), { persistent: true });
            console.log(`[RABBITMQ] Broadcasted to exchange: ${eventData.type}`);
            return;
        } catch (error) {
            console.error("❌ [RABBITMQ] Broadcast failed, falling back to HTTP...");
        }
    }

    // Emergency HTTP Fallback
    try {
        console.log(`[HYBRID] Sending direct HTTP notification...`);
        // Note: Direct fallback only hits Notification Service
        await axios.post('http://banking-notification-service:10000/api/notify/transaction', eventData);
    } catch (httpError) {
        console.error("❌ [HYBRID] Fallback failed:", httpError.message);
    }
}

module.exports = { connectRabbitMQ, publishTransactionEvent };
