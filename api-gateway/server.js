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

// SERVICE ROUTING
app.use('/api/auth', proxy(process.env.AUTH_SERVICE_URL || 'http://localhost:5002', proxyOptions));

// Proxy with headers preservation
const proxyOptions = {
    proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
        // Ensure tokens and cookies are passed through
        return proxyReqOpts;
    },
    proxyErrorHandler: (err, res, next) => {
        console.error('[GATEWAY PROXY ERROR]', err.message);
        res.status(502).json({ error: 'Service Unavailable', details: err.message });
    }
};

app.use('/api/users', protect, proxy(process.env.USER_SERVICE_URL || 'http://localhost:5003', proxyOptions));
app.use('/api/account', protect, proxy(process.env.USER_SERVICE_URL || 'http://localhost:5003', proxyOptions));
app.use('/api/transaction', protect, proxy(process.env.TRANSACTION_SERVICE_URL || 'http://localhost:5001', proxyOptions));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`📡 API Gateway Protected with Redis on port ${PORT}`);
});
