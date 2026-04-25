const express = require('express');
const jwt = require('jsonwebtoken');
const usermodel = require('../config/Models/user.model.js');
const tokenblacklistmodel = require('../config/Models/blacklistmodel.js');

async function authmiddleware(req, res, next) {
    let token = req.cookies.token || req.headers.authorization;

    if (token && token.startsWith('Bearer ')) {
        token = token.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            message: "unauthorized access",
        });
    }
    const isblacklisted = await tokenblacklistmodel.findOne({ token: token });
    if (isblacklisted) {
        return res.status(401).json({
            message: "unauthorized access",
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await usermodel.findOne({ _id: decoded.id });

        if (!user) {
            return res.status(401).json({
                message: "unauthorized access",
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "unauthorized access",
        });
    }
}

async function authsystemmiddleware(req, res, next) {
    let token = req.cookies.token || req.headers.authorization;

    if (token && token.startsWith('Bearer ')) {
        token = token.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            message: "unauthorized access",
        })
    }


    const isblacklisted = await tokenblacklistmodel.findOne({ token: token });
    if (isblacklisted) {
        return res.status(401).json({
            message: "unauthorized access",
        })
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await usermodel.findOne({ _id: decoded.id }).select("+systemUser");

        if (!user) {
            return res.status(401).json({
                message: "unauathorized access",
            })
        }
        if (!user.systemUser) {
            return res.status(401).json({
                message: "unauathorized access",
            })
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "unauthorized access",
        })
    }

}

module.exports = { authmiddleware, authsystemmiddleware };
