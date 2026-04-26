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

// 2. FIXED SERVICE URLS
// We use the EXACT URLs from your Render dashboard
const getUrl = (service) => `https://${service}.onrender.com`;

const SERVICES = {
    auth: getUrl('banking-auth-service'),
    user: getUrl('banking-user-service'),
    transaction: getUrl('banking-transaction-service'),
    notification: getUrl('banking-notification-service'),
    fraud: getUrl('banking-fraud-service'),
    audit: getUrl('banking-audit-service')
};

// 3. PROXY ROUTES
const proxyOptions = (target) => ({
    target,
    changeOrigin: true,
    pathRewrite: { '^/api/[^/]+': '' },
    timeout: 60000, // 60 seconds for slow cold starts
    proxyTimeout: 60000
});

app.use('/api/auth', createProxyMiddleware(proxyOptions(SERVICES.auth)));
app.use('/api/users', createProxyMiddleware(proxyOptions(SERVICES.user)));
app.use('/api/transaction', createProxyMiddleware(proxyOptions(SERVICES.transaction)));

// 4. HEARTBEAT MONITORING
app.get('/api/health/status', async (req, res) => {
    const list = [
        { id: 'auth', name: 'Auth Service' },
        { id: 'user', name: 'User Service' },
        { id: 'transaction', name: 'Transaction Service' },
        { id: 'notification', name: 'Notification Service' },
        { id: 'fraud', name: 'Fraud Service' },
        { id: 'audit', name: 'Audit Service' }
    ];

    const results = await Promise.all(list.map(async (s) => {
        const url = SERVICES[s.id];
        try {
            // INCREASED TIMEOUT TO 20 SECONDS FOR COLD STARTS
            const response = await fetch(`${url}/health`, { signal: AbortSignal.timeout(20000) });
            if (response.ok) return { name: s.name, status: 'UP', latency: 'Active' };
        } catch (e) {
            console.error(`FAILED: ${s.name} at ${url} - ${e.message}`);
        }
        return { name: s.name, status: 'DOWN', latency: 'N/A', error: 'Booting...' };
    }));

    res.json({ services: results });
});

app.get('/health', (req, res) => res.json({ status: 'GATEWAY_UP' }));

app.listen(PORT, () => {
    console.log(`🚀 Gateway Active on ${PORT}`);
});
