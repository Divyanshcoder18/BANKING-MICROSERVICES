const express = require('express');
const jwt = require('jsonwebtoken');
const usermodel = require('../config/Models/user.model.js');
const tokenblacklistmodel = require('../config/Models/blacklistmodel.js');
const { sendregiseremail } = require('../services/email.services.js');

const userregistercontroller = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        const isexist = await usermodel.findOne({ email });
        if (isexist) {
            return res.status(402).json({
                success: false,
                message: "user already exist",
            })
        }

        const user = await usermodel.create({ email, password, name });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "24d" })
        res.cookie("token", token);

        res.status(201).json({
            success: true,
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
            },
            token,
        })

        sendregiseremail(user.email, user.name).catch(err => console.log("Email failed:", err.message));
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
                message: "User not found",
            })
        }

        const ispassword = await user.comparePassword(password)
        if (!ispassword) {
            return res.status(401).json({
                success: false,
                message: "Email and Password you entered is wrong",
            })
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "24d" })
        res.cookie("token", token);

        return res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
            },
            token
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const userlogoutcontroller = async (req, res) => {
    let token = req.cookies.token || req.headers.authorization;

    if (token && token.startsWith('Bearer ')) {
        token = token.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "token not found",
        })
    }

    res.cookie("token", "");

    await tokenblacklistmodel.create({
        token: token,
    })
    res.status(200).json({
        success: true,
        message: "User Logged out successfully",
    })

}
module.exports = { userregistercontroller, userlogincontroller, userlogoutcontroller };
