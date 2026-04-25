const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
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
    action: {
        type: String,
        default: "TRANSACTION_LOGGED"
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Audit', auditSchema);
