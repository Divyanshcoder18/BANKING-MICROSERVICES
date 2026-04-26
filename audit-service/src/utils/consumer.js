const amqp = require('amqplib');
// We would import an Audit model here if we had one

const exchange = 'banking-events';
const queue = 'audit-service-queue';

async function connectRabbitMQ() {
    try {
        const uri = process.env.RABBITMQ_URI || "amqps://blvweviz:7I9b-e4T1lV5URLhQwVphx5bdQ_pg87s@chameleon.lmq.cloudamqp.com/blvweviz";
        const connection = await amqp.connect(uri);
        const channel = await connection.createChannel();
        
        await channel.assertExchange(exchange, 'fanout', { durable: true });
        
        // Create a unique queue for Audit Service
        const q = await channel.assertQueue(queue, { durable: true });
        await channel.bindQueue(q.queue, exchange, "");
        
        console.log("✅ Audit Service archiving to:", q.queue);

        channel.consume(q.queue, (msg) => {
            if (msg.content) {
                const data = JSON.parse(msg.content.toString());
                console.log("📜 [AUDIT] Archiving transaction:", data.transactionId);
                // In a real app, we would Audit.create(data)
                channel.ack(msg); 
            }
        });
    } catch (error) {
        console.error("❌ Audit Consumer Error:", error);
    }
}

module.exports = { connectRabbitMQ };
