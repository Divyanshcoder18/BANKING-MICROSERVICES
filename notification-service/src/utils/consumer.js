const amqp = require('amqplib');
const { sendTransactionEmail } = require('../services/email.services.js');

const exchange = 'banking-events';
const queue = 'notification-service-queue';

async function connectRabbitMQ() {
    let retries = 5;
    while (retries) {
        try {
            const connection = await amqp.connect(process.env.RABBITMQ_URI || 'amqp://localhost');
            const channel = await connection.createChannel();

            await channel.assertExchange(exchange, 'fanout', { durable: true });
            
            // Create a unique queue for this service
            await channel.assertQueue(queue, { durable: true });
            await channel.bindQueue(queue, exchange, '');

            console.log("✅ [NOTIFY] Connected to Broadcast Exchange");

            channel.consume(queue, async (msg) => {
                if (msg !== null) {
                    try {
                        const data = JSON.parse(msg.content.toString());
                        await sendTransactionEmail(data.type, data);
                        channel.ack(msg);
                    } catch (err) {
                        console.error("❌ [NOTIFY] Error:", err.message);
                        channel.nack(msg, false, false);
                    }
                }
            });
            return;
        } catch (error) {
            retries -= 1;
            console.log(`⚠️ [NOTIFY] Retry ${retries}...`);
            await new Promise(res => setTimeout(res, 5000));
        }
    }
}

module.exports = { connectRabbitMQ };
