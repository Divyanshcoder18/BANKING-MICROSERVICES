const amqp = require('amqplib');
const { sendTransactionEmail } = require('../services/email.services.js');

const queue = 'transaction-events';

async function connectRabbitMQ() {
    let retries = 5;
    while (retries) {
        try {
            console.log(`[NOTIFY] Attempting to connect... (Retries left: ${retries})`);
            const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');

            const channel = await connection.createChannel();

            // 1. Setup Dead Letter Exchange (DLX) and Queue (DLQ)
            const dlx = 'notification_dlx';
            const dlq = 'notification_dlq';
            await channel.assertExchange(dlx, 'direct', { durable: true });
            await channel.assertQueue(dlq, { durable: true });
            await channel.bindQueue(dlq, dlx, 'failed');

            // 2. Setup Main Queue with DLX configuration
            await channel.assertQueue(queue, {
                durable: true,
                arguments: {
                    'x-dead-letter-exchange': dlx,
                    'x-dead-letter-routing-key': 'failed'
                }
            });

            console.log("✅ [NOTIFY] Connected and DLQ Configured");

            channel.consume(queue, async (msg) => {
                if (msg !== null) {
                    try {
                        const data = JSON.parse(msg.content.toString());
                        console.log(`[NOTIFY] Processing event: ${data.type}`);

                        await sendTransactionEmail(data.type, data);

                        channel.ack(msg);
                        console.log("✅ [NOTIFY] Message processed and acknowledged");
                    } catch (err) {
                        console.error("❌ [NOTIFY] Processing failed. Moving to DLQ:", err.message);
                        // nack (msg, requeue=false) will move it to the DLX
                        channel.nack(msg, false, false);
                    }
                }
            });
            return;
        } catch (error) {
            retries -= 1;
            console.log(`⚠️ [NOTIFY] Connection failed. Retrying in 5 seconds...`);
            if (retries === 0) {
                console.error("❌ [NOTIFY] Critical: Could not connect to RabbitMQ broker.");
                throw error;
            }
            await new Promise(res => setTimeout(res, 5000));
        }
    }
}
module.exports = { connectRabbitMQ };
