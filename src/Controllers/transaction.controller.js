const transactionmodel = require('../config/Models/transaction.model.js');
const ledgermodel = require('../config/Models/ledger.models.js');
const emailservice = require('../services/email.services.js');
const accountmodel = require('../config/Models/account.model.js');
const mongoose = require('mongoose');

async function createtransfer(req, res) {
    const { fromaccount, toaccount, amount, idempotencyKey } = req.body;

    if (!fromaccount || !toaccount || !amount || !idempotencyKey) {
        return res.status(400).json({ success: false, message: "all fields are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(fromaccount) || !mongoose.Types.ObjectId.isValid(toaccount)) {
        return res.status(400).json({ success: false, message: "Invalid Account ID format" });
    }

    try {
        const fromAccount = await accountmodel.findOne({ _id: fromaccount, user: req.user._id });
        const toAccount = await accountmodel.findById(toaccount);

        if (!fromAccount || !toAccount) {
            return res.status(404).json({ success: false, message: "Invalid account(s) provided" });
        }

        const balance = await fromAccount.getBalance();
        if (balance < amount) {
            return res.status(400).json({ success: false, message: "Insufficient balance" });
        }

        const transaction = await transactionmodel.create({
            fromaccount: fromAccount._id,
            toaccount: toAccount._id,
            amount,
            idempotencyKey,
            status: "SUCCESS"
        });

        await ledgermodel.create([
            { account: fromAccount._id, amount, transaction: transaction._id, type: "DEBIT" },
            { account: toAccount._id, amount, transaction: transaction._id, type: "CREDIT" }
        ]);

        res.status(201).json({ success: true, message: "Transfer successful", transaction: transaction });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

async function createdeposit(req, res) {
    const { accountId, amount, idempotencyKey } = req.body;

    if (!accountId || !amount || !idempotencyKey) {
        return res.status(400).json({ success: false, message: "all fields are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(accountId)) {
        return res.status(400).json({ success: false, message: "Invalid Account ID format" });
    }

    try {
        const account = await accountmodel.findOne({ _id: accountId, user: req.user._id });
        if (!account) return res.status(404).json({ success: false, message: "Account not found" });

        const transaction = await transactionmodel.create({
            fromaccount: account._id,
            toaccount: account._id,
            amount,
            idempotencyKey,
            status: "SUCCESS"
        });

        await ledgermodel.create([{
            account: account._id,
            amount,
            transaction: transaction._id,
            type: "CREDIT"
        }]);

        res.status(201).json({ success: true, message: "Deposit successful", transaction: transaction });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

async function createwithdraw(req, res) {
    const { accountId, amount, idempotencyKey } = req.body;

    if (!accountId || !amount || !idempotencyKey) {
        return res.status(400).json({ success: false, message: "all fields are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(accountId)) {
        return res.status(400).json({ success: false, message: "Invalid Account ID format" });
    }

    try {
        const account = await accountmodel.findOne({ _id: accountId, user: req.user._id });
        if (!account) return res.status(404).json({ success: false, message: "Account not found" });

        const balance = await account.getBalance();
        if (balance < amount) {
            return res.status(400).json({ success: false, message: "Insufficient balance for withdrawal" });
        }

        const transaction = await transactionmodel.create({
            fromaccount: account._id,
            toaccount: account._id,
            amount,
            idempotencyKey,
            status: "SUCCESS"
        });

        await ledgermodel.create([{
            account: account._id,
            amount,
            transaction: transaction._id,
            type: "DEBIT"
        }]);

        res.status(201).json({ success: true, message: "Withdrawal successful", transaction: transaction });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

async function gethistory(req, res) {
    try {
        const { accountId } = req.params;
        if (!accountId) return res.status(400).json({ message: "Account ID is required" });

        if (!mongoose.Types.ObjectId.isValid(accountId)) {
            return res.status(400).json({ message: "Invalid Account ID format" });
        }

        const transactions = await transactionmodel.find({
            $or: [
                { fromaccount: accountId },
                { toaccount: accountId }
            ]
        }).sort({ createdAt: -1 });

        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function createinitialfunds(req, res) {
    const { toaccount, amount, idempotencykey } = req.body;

    if (!toaccount || !amount || !idempotencykey) {
        return res.status(400).json({ success: false, message: "all fields are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(toaccount)) {
        return res.status(400).json({ success: false, message: "Invalid Account ID format" });
    }

    try {
        const touseraccount = await accountmodel.findById(toaccount);
        if (!touseraccount) return res.status(404).json({ success: false, message: "Target account not found" });

        const transaction = await transactionmodel.create({
            fromaccount: touseraccount._id,
            toaccount: touseraccount._id,
            amount,
            idempotencyKey: idempotencykey,
            status: "SUCCESS"
        });

        await ledgermodel.create([{
            account: touseraccount._id,
            amount,
            transaction: transaction._id,
            type: "CREDIT"
        }]);

        res.status(201).json({ success: true, message: "Funds added", transaction: transaction });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = { createinitialfunds, createdeposit, createtransfer, gethistory, createwithdraw };