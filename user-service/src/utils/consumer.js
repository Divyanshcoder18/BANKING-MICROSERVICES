const amqp = require('amqplib');
const Redis = require('ioredis');

// Setup Redis connection for the User Service
const redisClient = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL)
    : new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
    });

async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URI || 'amqp://localhost');
        const channel = await connection.createChannel();
        const queue = 'transaction-events'; // This must match the Transaction Service

        await channel.assertQueue(queue, { durable: true });

        console.log("👂 [USER-SERVICE] Listening for Transaction Events...");

        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                const data = JSON.parse(msg.content.toString());
                console.log(`🔄 [CACHE] Transaction detected. Clearing Redis...`);


                const accountsToClear = [data.account, data.from, data.to].filter(id => id);

                for (const accountId of accountsToClear) {
                    await redisClient.del(`balance:${accountId}`);
                    console.log(` [CACHE] Cleared balance for: ${accountId}`);
                }

                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error("❌ [USER-SERVICE] RabbitMQ Consumer Error:", error.message);
    }
}

module.exports = { connectRabbitMQ };