const mongoose = require('mongoose');

const ledgerschema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: true,
        index: true,
        immutable: true,
    },
    amount: {
        type: Number,
        required: true,
        immutable: true,
    },
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "transaction",
        required: true,
        immutable: true,
    },
    type: {
        type: String,
        enum: ["DEBIT", "CREDIT"],
        required: [true, "ledger type is required"],
        immutable: true,
    }
}, { timestamps: true });

function preventledgermodification() {
    throw new Error("ledger entry is immutable and cant be modified");
}

ledgerschema.pre("updateOne", preventledgermodification);
ledgerschema.pre("updateMany", preventledgermodification);
ledgerschema.pre("findOneAndUpdate", preventledgermodification);
ledgerschema.pre("deleteOne", preventledgermodification);
ledgerschema.pre("deleteMany", preventledgermodification);
ledgerschema.pre("findOneAndDelete", preventledgermodification);
ledgerschema.pre("replaceOne", preventledgermodification);

// Safe model registration for microservices
const ledgermodel = mongoose.models.ledger || mongoose.model("ledger", ledgerschema);
module.exports = ledgermodel;
