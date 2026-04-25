const jwt = require('jsonwebtoken');
const usermodel = require('../models/user.model.js');
const tokenblacklistmodel = require('../models/blacklistmodel.js');
const { sendregiseremail } = require('../services/email.services.js');

const Redis = require('ioredis');
const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
});

const userregistercontroller = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        const isexist = await usermodel.findOne({ email });
        if (isexist) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            })
        }

        const user = await usermodel.create({ email, password, name });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'divu123', { expiresIn: "24d" });
        res.cookie("token", token);

        res.status(201).json({
            success: true,
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
            },
            token,
        });

        // Non-blocking email
        sendregiseremail(user.email, user.name).catch(err => console.log("[AUTH] Email failed:", err.message));
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const userlogincontroller = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await usermodel.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            })
        }

        const ispassword = await user.comparePassword(password);
        if (!ispassword) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            })
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'divu123', { expiresIn: "24d" });
        res.cookie("token", token);

        return res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
            },
            token
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const userlogoutcontroller = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        let token = req.cookies.token || (authHeader && authHeader.split(' ')[1]);

        if (!token) {
            return res.status(400).json({ success: false, message: "Token not found" });
        }

        res.cookie("token", "");

        // 🛡️ Redis Blacklist Save (Expires in 24 days)
        await redisClient.set(token, 'blacklisted', 'EX', 24 * 60 * 60 * 30);
        res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = { userregistercontroller, userlogincontroller, userlogoutcontroller };
