const accountmodel = require('../models/account.model.js');
const usermodel = require('../models/user.model.js'); // Ensure this matches UserFresh
const transactionmodel = require('../models/transaction.model.js');
const ledgermodel = require('../models/ledger.models.js');
const mongoose = require('mongoose');
const Redis = require('ioredis');
const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
});


async function accountcontroller(req, res) {
    try {
        const { nickname, accountType } = req.body;

        // 1. Create the account
        const account = await accountmodel.create({
            user: req.user._id || req.user.id,
            nickname: nickname || "Primary Account",
            accountType: accountType || "SAVINGS",
            status: "ACTIVE"
        });

        // 2. Add Welcome Bonus ($500)
        try {
            const bonusTransaction = await transactionmodel.create({
                fromaccount: account._id,
                toaccount: account._id,
                amount: 500,
                idempotencyKey: `bonus-${account._id}-${Date.now()}`,
                status: "SUCCESS"
            });

            await ledgermodel.create({
                account: account._id,
                amount: 500,
                transaction: bonusTransaction._id,
                type: "CREDIT"
            });

        } catch (err) {
            console.error("[USER-SERVICE] Welcome Bonus Failed:", err.message);
        }

        return res.status(201).json({
            success: true,
            message: "Account created successfully with $500 welcome bonus!",
            account: { ...account.toObject(), balance: 500 }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

async function getuseraccount(req, res) {
    try {
        const accounts = await accountmodel.find({ user: req.user._id || req.user.id });

        const accountsWithBalance = await Promise.all(accounts.map(async (acc) => {
            const balance = await acc.getBalance();
            return {
                ...acc.toObject(),
                balance: balance
            };
        }));

        return res.status(200).json({
            success: true,
            accounts: accountsWithBalance
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

async function getbalance(req, res) {
    try {
        const { accountId } = req.query;
        const id = accountId || req.params.accountId;

        if (!id) return res.status(400).json({ success: false, message: "Account ID is required" });

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid Account ID format" });
        }

        const account = await accountmodel.findOne({
            _id: id,
            user: req.user._id || req.user.id
        });

        if (!account) return res.status(404).json({ success: false, message: "Account not found" });

        // 🛡️ 1. CHECK REDIS FIRST
        const cachedBalance = await redisClient.get(`balance:${id}`);
        if (cachedBalance) {
            console.log(" [REDIS] Serving Balance from Cache");
            return res.status(200).json({ success: true, balance: cachedBalance, source: 'cache' });
        }

        const balance = await account.getBalance();

        // 💾 2. SAVE TO REDIS FOR NEXT TIME (Cache for 1 hour)
        await redisClient.set(`balance:${id}`, balance, 'EX', 3600);

        return res.status(200).json({ success: true, balance: balance, source: 'database' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = { accountcontroller, getbalance, getuseraccount };
