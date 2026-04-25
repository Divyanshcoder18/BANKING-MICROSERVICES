const jwt = require('jsonwebtoken');
const usermodel = require('../models/user.model.js');
const tokenblacklistmodel = require('../models/blacklistmodel.js');

async function authmiddleware(req, res, next) {
    try {
        // Look for token in Cookies OR Header (standard for microservices)
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No token provided" });
        }

        // 1. Check if token was blacklisted (Logout check)
        const isblacklisted = await tokenblacklistmodel.findOne({ token });
        if (isblacklisted) {
            return res.status(401).json({ message: "Unauthorized - Token is blacklisted" });
        }

        // 2. Verify the JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'divu123');

        // 3. Attach User (This works here because Auth Service has the User model)
        const user = await usermodel.findOne({ _id: decoded.id });
        if (!user) {
            return res.status(401).json({ message: "Unauthorized - User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }
}

module.exports = { authmiddleware };
