require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const Redis = require('ioredis');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());

// 1. Redis Setup
const redis = new Redis(process.env.REDIS_URL);
redis.on('connect', () => console.log('✅ Gateway Protected with Redis'));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests'
});
app.use(limiter);

// 2. DISCOVERY LOGIC
// We try Internal first (fast), then External (backup)
const SERVICES = [
    { id: 'auth', name: 'Auth Service', internal: 'http://banking-auth-service:10000', external: 'https://banking-auth-service.onrender.com' },
    { id: 'user', name: 'User Service', internal: 'http://banking-user-service:10000', external: 'https://banking-user-service.onrender.com' },
    { id: 'transaction', name: 'Transaction Service', internal: 'http://banking-transaction-service:10000', external: 'https://banking-transaction-service.onrender.com' },
    { id: 'notification', name: 'Notification Service', internal: 'http://banking-notification-service:10000', external: 'https://banking-notification-service.onrender.com' },
    { id: 'fraud', name: 'Fraud Service', internal: 'http://banking-fraud-service:10000', external: 'https://banking-fraud-service.onrender.com' },
    { id: 'audit', name: 'Audit Service', internal: 'http://banking-audit-service:10000', external: 'https://banking-audit-service.onrender.com' }
];

// PROXY ROUTES (Using Internal by default for speed)
const proxyOptions = (id) => {
    const s = SERVICES.find(x => x.id === id);
    return {
        target: s.internal,
        changeOrigin: true,
        pathRewrite: { '^/api/[^/]+': '' },
        timeout: 60000,
        proxyTimeout: 60000,
        router: async (req) => {
            // If internal fails, the proxy will naturally throw
            return s.internal; 
        }
    }
};

app.use('/api/auth', createProxyMiddleware(proxyOptions('auth')));
app.use('/api/users', createProxyMiddleware(proxyOptions('user')));
app.use('/api/transaction', createProxyMiddleware(proxyOptions('transaction')));

// 4. SMART DIAGNOSTIC HEALTH CHECK
app.get('/api/health/status', async (req, res) => {
    const results = await Promise.all(SERVICES.map(async (s) => {
        // Try Internal, then External
        const urls = [s.internal, s.external];
        let lastError = 'Booting...';

        for (const url of urls) {
            try {
                const response = await fetch(`${url}/health`, { signal: AbortSignal.timeout(15000) });
                if (response.ok) return { name: s.name, status: 'UP', latency: 'Active' };
            } catch (e) {
                lastError = e.message;
            }
        }
        return { name: s.name, status: 'DOWN', latency: 'N/A', error: lastError };
    }));

    res.json({ services: results });
});

app.get('/health', (req, res) => res.json({ status: 'GATEWAY_UP' }));

app.listen(PORT, () => {
    console.log(`🚀 Gateway Active on ${PORT}`);
});
