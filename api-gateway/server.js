require('dotenv').config();
const express = require('express');
const cors = require('cors');
const proxy = require('express-http-proxy');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const Redis = require('ioredis');
const { RedisStore } = require('rate-limit-redis');

const app = express();
app.set('trust proxy', 1);

const redisClient = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL)
    : new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
    });

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());

// Gateway Logging
app.use((req, res, next) => {
    console.log(`[GATEWAY] ${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// 🛡️ Rate Limiter (The Bouncer)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    }),
});
app.use(limiter);

const protect = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = req.cookies.token || (authHeader && (authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader));

    if (!token) {
        console.log("❌ [GATEWAY] Auth Failed: No token found");
        console.log("🔍 Incoming Headers:", JSON.stringify(req.headers, null, 2));
        return res.status(401).json({ message: "Authentication required" });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'divu123', (err, decoded) => {
        if (err) {
            console.log("❌ [GATEWAY] Auth Failed: Invalid token", err.message);
            return res.status(403).json({ message: "Invalid or expired token" });
        }
        console.log(`✅ [GATEWAY] Auth Success: User ${decoded.id}`);
        req.user = decoded;
        next();
    });
};

// Proxy Helper
const createProxyOptions = (targetUrl) => ({
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        const url = new URL(targetUrl);
        proxyReqOpts.headers['host'] = url.host;
        return proxyReqOpts;
    },
    proxyReqPathResolver: (req) => {
        return req.url; // preserves /register etc.
    },
    proxyErrorHandler: (err, res, next) => {
        console.error(`[GATEWAY PROXY ERROR] to ${targetUrl}:`, err.message);
        res.status(502).json({ error: 'Service Unavailable', details: err.message });
    }
});

// SERVICE ROUTING
app.use('/api/auth', proxy(process.env.AUTH_SERVICE_URL || 'http://localhost:5002', createProxyOptions(process.env.AUTH_SERVICE_URL || 'http://localhost:5002')));
app.use('/api/users', protect, proxy(process.env.USER_SERVICE_URL || 'http://localhost:5003', createProxyOptions(process.env.USER_SERVICE_URL || 'http://localhost:5003')));
app.use('/api/account', protect, proxy(process.env.USER_SERVICE_URL || 'http://localhost:5003', createProxyOptions(process.env.USER_SERVICE_URL || 'http://localhost:5003')));
app.use('/api/transaction', protect, proxy(process.env.TRANSACTION_SERVICE_URL || 'http://localhost:5001', createProxyOptions(process.env.TRANSACTION_SERVICE_URL || 'http://localhost:5001')));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`📡 API Gateway Protected with Redis on port ${PORT}`);
});
