const transactionmodel = require('../models/transaction.model.js');
const ledgermodel = require('../models/ledger.models.js');
const accountmodel = require('../models/account.model.js');
const mongoose = require('mongoose');
const { publishTransactionEvent } = require('../utils/producer.js');

async function createtransfer(req, res) {
    const { fromaccount, toaccount, amount, idempotencyKey } = req.body;

    if (!fromaccount || !toaccount || !amount || !idempotencyKey) {
        return res.status(400).json({ success: false, message: "all fields are required" });
    }

    try {
        const fromAccount = await accountmodel.findOne({ _id: fromaccount, user: req.user.id || req.user._id });
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

        // RABBITMQ EVENT
        publishTransactionEvent({
            type: "TRANSFER",
            amount,
            from: fromAccount._id,
            to: toAccount._id,
            userEmail: req.user.email,
            timestamp: new Date()
        });

        res.status(201).json({ success: true, message: "Transfer successful", transaction: transaction });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

async function createdeposit(req, res) {
    const { accountId, amount, idempotencyKey } = req.body;

    try {
        const account = await accountmodel.findOne({ _id: accountId, user: req.user.id || req.user._id });
        if (!account) return res.status(404).json({ success: false, message: "Account not found" });

        const transaction = await transactionmodel.create({
            fromaccount: account._id,
            toaccount: account._id,
            amount,
            idempotencyKey,
            status: "SUCCESS"
        });

        await ledgermodel.create([{ account: account._id, amount, transaction: transaction._id, type: "CREDIT" }]);

        publishTransactionEvent({
            type: "DEPOSIT",
            amount,
            account: account._id,
            userEmail: req.user.email,
            timestamp: new Date()
        });

        res.status(201).json({ success: true, message: "Deposit successful", transaction: transaction });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

async function createwithdraw(req, res) {
    const { accountId, amount, idempotencyKey } = req.body;

    try {
        const account = await accountmodel.findOne({ _id: accountId, user: req.user.id || req.user._id });
        if (!account) return res.status(404).json({ success: false, message: "Account not found" });

        const balance = await account.getBalance();
        if (balance < amount) return res.status(400).json({ success: false, message: "Insufficient balance" });

        const transaction = await transactionmodel.create({
            fromaccount: account._id,
            toaccount: account._id,
            amount,
            idempotencyKey,
            status: "SUCCESS"
        });

        await ledgermodel.create([{ account: account._id, amount, transaction: transaction._id, type: "DEBIT" }]);

        publishTransactionEvent({
            type: "WITHDRAWAL",
            amount,
            account: account._id,
            userEmail: req.user.email,
            timestamp: new Date()
        });

        res.status(201).json({ success: true, message: "Withdrawal successful", transaction: transaction });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

async function gethistory(req, res) {
    try {
        const { accountId } = req.params;
        const transactions = await transactionmodel.find({
            $or: [{ fromaccount: accountId }, { toaccount: accountId }]
        }).sort({ createdAt: -1 });

        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = { createdeposit, createtransfer, gethistory, createwithdraw };
