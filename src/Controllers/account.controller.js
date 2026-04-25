const accountmodel = require('../config/Models/account.model.js');
const userModel = require('../config/Models/user.model.js');
const transactionmodel = require('../config/Models/transaction.model.js');
const ledgermodel = require('../config/Models/ledger.models.js');
const mongoose = require('mongoose');

async function accountcontroller(req, res) {
    try {
        const { nickname, accountType } = req.body;

        // 1. Create the account
        const account = await accountmodel.create({
            user: req.user._id,
            nickname: nickname || "Primary Account",
            accountType: accountType || "SAVINGS",
            status: "ACTIVE"
        });

        // 2. Add Welcome Bonus ($500)
        // Standalone mode: No sessions used to support standard local MongoDB
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
            console.error("Welcome Bonus Failed (Non-critical):", err.message);
        }

        return res.status(201).json({
            success: true,
            message: "Account created successfully with $500 welcome bonus!",
            account: { ...account.toObject(), balance: 500 }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error creating account",
            error: error.message
        });
    }
}

async function getuseraccount(req, res) {
    try {
        const accounts = await accountmodel.find({ user: req.user._id });

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

        if (!id) {
            return res.status(200).json({ success: true, balance: 0 });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid Account ID format" });
        }

        const account = await accountmodel.findOne({
            _id: id,
            user: req.user._id
        })
        if (!account) {
            return res.status(404).json({
                success: false,
                message: "Account not found or access denied"
            })
        }
        const balance = await account.getBalance();
        return res.status(200).json({
            success: true,
            account: account._id,
            balance: balance,
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = { accountcontroller, getbalance, getuseraccount };
