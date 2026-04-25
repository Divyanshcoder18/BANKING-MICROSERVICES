const amqp = require('amqplib');
const Audit = require('../models/audit.model.js');

/*
 * THE CONSUMER (audit-service)
 * This service acts as the "Bank's Memory," recording every single
 * transaction event into a permanent, immutable log.
 */


async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();
        
        const exchange = "transaction-events";
        await channel.assertExchange(exchange, "fanout", { durable: false });
        
        const q = await channel.assertQueue("audit_queue", { durable: false });
        await channel.bindQueue(q.queue, exchange, "");
        
        console.log("✅ Audit Service listening on queue:", q.queue);

        channel.consume(q.queue, async (msg) => {
            if (msg.content) {
                const data = JSON.parse(msg.content.toString());
                console.log("📝 Recording transaction in Audit Log:", data);

                await Audit.create({
                    transactionId: data.transactionId,
                    email: data.email,
                    amount: data.amount,
                    action: "TRANSACTION_LOGGED",
                    timestamp: data.timestamp || new Date()
                });
                
                channel.ack(msg); 
            }
        });

    } catch (error) {
        console.error("❌ Audit Consumer Error:", error);
    }
}

module.exports = { connectRabbitMQ };
