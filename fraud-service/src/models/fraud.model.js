const mongoose = require('mongoose');

const fraudSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    riskLevel: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        default: 'LOW'
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'RESOLVED', 'REJECTED'],
        default: 'PENDING'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Fraud', fraudSchema);
