const mongoose = require('mongoose');
const acctschema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserFresh",
        required: [true, 'User must exist'],
        index: true,
    },
    status: {
        type: String,
        enum: {
            values: ["ACTIVE", "FREEZE", "CLOSED"],
            message: "account may be suspended"
        },
        default: "ACTIVE"
    },
    currency: {
        type: String,
        required: true,
        default: "INR",
    },
    nickname: {
        type: String,
        trim: true,
    },
    accountType: {
        type: String,
        enum: ["SAVINGS", "BUSINESS", "CURRENT", "FIXED"],
        default: "SAVINGS",
    }
}, { timestamps: true });

acctschema.methods.getBalance = async function () {
    const ledgermodel = require('./ledger.models.js');
    const balance = await ledgermodel.aggregate([
        { $match: { account: this._id } },
        { $group: { _id: "$type", total: { $sum: "$amount" } } }
    ]);
    let credits = 0;
    let debit = 0;
    for (let entry of balance) {
        if (entry._id == 'CREDIT') credits += entry.total;
        if (entry._id == 'DEBIT') debit += entry.total;
    }
    return credits - debit;
}
const accountmodel = mongoose.models.account || mongoose.model("account", acctschema);
module.exports = accountmodel;
