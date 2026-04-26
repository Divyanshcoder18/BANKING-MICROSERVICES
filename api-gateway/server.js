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

// 🛡️ Rate Limiter (DISABLED FOR DEBUGGING)
/*
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    }),
});
app.use(limiter);
*/

const protect = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = req.cookies.token || (authHeader && (authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader));

    if (!token) {
        console.log("❌ [GATEWAY] Auth Failed: No token found");
        return res.status(401).json({ message: "Authentication required" });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'divu123', (err, decoded) => {
        if (err) {
            console.log("❌ [GATEWAY] Auth Failed: Invalid token", err.message);
            return res.status(403).json({ message: "Invalid or expired token" });
        }
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
        return req.url;
    },
    timeout: 30000, // 30s timeout
    proxyErrorHandler: (err, res, next) => {
        console.error(`[GATEWAY PROXY ERROR] to ${targetUrl}:`, err.message);
        res.status(502).json({ error: 'Service Unavailable', details: err.message });
    }
});

// SERVICE ROUTING (Before express.json to fix POST issues)
// 🔐 Manual Auth Forwarding (Total control to stop 502s)
app.use('/api/auth', async (req, res) => {
    try {
        const targetUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:5002';
        const fullUrl = `${targetUrl}${req.url}`;

        console.log(`[GATEWAY] Forwarding to: ${fullUrl}`);

        const response = await fetch(fullUrl, {
            method: req.method,
            headers: {
                ...req.headers,
                'host': new URL(targetUrl).host
            },
            body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? JSON.stringify(req.body) : undefined
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error('[GATEWAY AUTH ERROR]:', error.message);
        res.status(502).json({ success: false, message: "Auth Service unreachable", details: error.message });
    }
});

app.use('/api/users', protect, proxy(process.env.USER_SERVICE_URL || 'http://localhost:5003', createProxyOptions(process.env.USER_SERVICE_URL || 'http://localhost:5003')));
app.use('/api/account', protect, proxy(process.env.USER_SERVICE_URL || 'http://localhost:5003', createProxyOptions(process.env.USER_SERVICE_URL || 'http://localhost:5003')));
app.use('/api/transaction', protect, proxy(process.env.TRANSACTION_SERVICE_URL || 'http://localhost:5001', createProxyOptions(process.env.TRANSACTION_SERVICE_URL || 'http://localhost:5001')));

// 🏥 GLOBAL SYSTEM HEALTH CHECK
app.get('/api/health/status', async (req, res) => {
    const services = [
        { name: 'Auth Service', url: process.env.AUTH_SERVICE_URL || 'http://localhost:5002' },
        { name: 'User Service', url: process.env.USER_SERVICE_URL || 'http://localhost:5003' },
        { name: 'Transaction Service', url: process.env.TRANSACTION_SERVICE_URL || 'http://localhost:5001' },
        { name: 'Notification Service', url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5004' },
        { name: 'Fraud Service', url: process.env.FRAUD_SERVICE_URL || 'http://localhost:5005' },
        { name: 'Audit Service', url: process.env.AUDIT_SERVICE_URL || 'http://localhost:5006' },
    ];

    const results = await Promise.all(services.map(async (service) => {
        try {
            const start = Date.now();
            const response = await fetch(`${service.url}/health`, { signal: AbortSignal.timeout(3000) });
            const latency = Date.now() - start;
            
            return {
                name: service.name,
                status: response.ok ? 'UP' : 'DOWN',
                latency: `${latency}ms`,
                details: response.ok ? await response.json() : 'Service responded with error'
            };
        } catch (error) {
            return {
                name: service.name,
                status: 'DOWN',
                latency: 'N/A',
                error: error.name === 'TimeoutError' ? 'Connection Timeout' : 'Service Unreachable'
            };
        }
    }));

    res.json({
        gateway: 'UP',
        timestamp: new Date().toISOString(),
        services: results
    });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`📡 API Gateway Protected with Redis on port ${PORT}`);
});
