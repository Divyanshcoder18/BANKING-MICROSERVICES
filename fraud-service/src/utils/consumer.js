const amqp = require('amqplib');
const Fraud = require('../models/fraud.model.js');

async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();
        
        const exchange = "transaction-events";
        await channel.assertExchange(exchange, "fanout", { durable: false });
        
        const q = await channel.assertQueue("fraud_queue", { durable: false });
        await channel.bindQueue(q.queue, exchange, "");
        
        console.log("✅ Fraud Service listening on queue:", q.queue);

        channel.consume(q.queue, async (msg) => {
            if (msg.content) {
                const data = JSON.parse(msg.content.toString());
                console.log("🕵️ Checking transaction:", data);

                if (data.amount > 10000) {
                    console.log("🚨 HIGH RISK TRANSACTION DETECTED"); 

                    await Fraud.create({
                        transactionId: data.transactionId,
                        email: data.email,
                        amount: data.amount,
                        riskLevel: "HIGH", 
                        reason: "Transaction amount is greater than 10000",
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

