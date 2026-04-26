const amqp = require('amqplib');
const Fraud = require('../models/fraud.model.js');

const exchange = 'banking-events';
const queue = 'fraud-service-queue';

async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URI);
        const channel = await connection.createChannel();
        
        await channel.assertExchange(exchange, 'fanout', { durable: true });
        
        // Create a unique queue for Fraud Service
        const q = await channel.assertQueue(queue, { durable: true });
        await channel.bindQueue(q.queue, exchange, "");
        
        console.log("✅ Fraud Service watching for risk on:", q.queue);

        channel.consume(q.queue, async (msg) => {
            if (msg.content) {
                const data = JSON.parse(msg.content.toString());
                if (data.amount > 10000) {
                    await Fraud.create({
                        transactionId: data.transactionId,
                        email: data.email,
                        amount: data.amount,
                        riskLevel: "HIGH", 
                        reason: "Large Transaction (>10000)",
                        status: "PENDING"
                    });
                }
                channel.ack(msg); 
            }
        });
    } catch (error) {
        console.error("❌ Fraud Consumer Error:", error);
    }
}

module.exports = { connectRabbitMQ };
