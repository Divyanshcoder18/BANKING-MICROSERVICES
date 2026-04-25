const mongoose = require('mongoose');

const transactionschema = new mongoose.Schema({
    fromaccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: true,
        index: true,
    },
    toaccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: true,
    },
    status: {
        type: String,
        enum: ["PENDING", "SUCCESS", "FAILED"],
        default: "PENDING",
    },
    amount: {
        type: Number,
        required: true,
    },
    idempotencyKey: {
        type: String,
        required: true,
        unique: true,
    }
}, { timestamps: true });

// Safe model registration for microservices
const transactionmodel = mongoose.models.transaction || mongoose.model("transaction", transactionschema);
module.exports = transactionmodel;
