const mongoose = require('mongoose');

const transactionschema = new mongoose.Schema({
    fromaccount: {
        type: mongoose.Schema.Types.ObjectId, // Fixed ObjectId reference
        ref: "account",
        required: true,
        index: true,
    },
    toaccount: {
        type: mongoose.Schema.Types.ObjectId, // Fixed spelling of objectID to Types.ObjectId
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
        type: String, // Capitalized String
        required: true,
        unique: true,
    }
}, { timestamps: true });

// Fixed spelling of transaction schema and model, and module.exports
const transactionmodel = mongoose.model("transaction", transactionschema);
module.exports = transactionmodel;