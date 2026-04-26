require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const Redis = require('ioredis');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());

// Redis Setup
const redis = new Redis(process.env.REDIS_URL);
redis.on('connect', () => console.log('✅ Gateway Protected with Redis'));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests'
});
app.use(limiter);

// INTERNAL & EXTERNAL URLS
const getUrls = (key, defaultInternal, defaultExternal) => [
    process.env[key] || defaultInternal,
    defaultExternal
];

const SERVICES = [
    { name: 'Auth Service', urls: getUrls('AUTH_SERVICE_URL', 'http://banking-auth-service:10000', 'https://banking-auth-service.onrender.com') },
    { name: 'User Service', urls: getUrls('USER_SERVICE_URL', 'http://banking-user-service:10000', 'https://banking-user-service.onrender.com') },
    { name: 'Transaction Service', urls: getUrls('TRANSACTION_SERVICE_URL', 'http://banking-transaction-service:10000', 'https://banking-transaction-service.onrender.com') },
    { name: 'Notification Service', urls: getUrls('NOTIFICATION_SERVICE_URL', 'http://banking-notification-service:10000', 'https://banking-notification-service.onrender.com') },
    { name: 'Fraud Service', urls: getUrls('FRAUD_SERVICE_URL', 'http://banking-fraud-service:10000', 'https://banking-fraud-service.onrender.com') },
    { name: 'Audit Service', urls: getUrls('AUDIT_SERVICE_URL', 'http://banking-audit-service:10000', 'https://banking-audit-service.onrender.com') }
];

// PROXY ROUTES (Using Internal)
const proxyOptions = (target) => ({
    target,
    changeOrigin: true,
    pathRewrite: { '^/api/[^/]+': '' },
    timeout: 30000
});

app.use('/api/auth', createProxyMiddleware(proxyOptions(process.env.AUTH_SERVICE_URL || 'http://banking-auth-service:10000')));
app.use('/api/users', createProxyMiddleware(proxyOptions(process.env.USER_SERVICE_URL || 'http://banking-user-service:10000')));
app.use('/api/transaction', createProxyMiddleware(proxyOptions(process.env.TRANSACTION_SERVICE_URL || 'http://banking-transaction-service:10000')));

// RESILIENT HEALTH DASHBOARD
app.get('/api/health/status', async (req, res) => {
    const results = await Promise.all(SERVICES.map(async (service) => {
        for (const url of service.urls) {
            try {
                const response = await axios.get(`${url}/health`, { timeout: 8000 });
                if (response.status === 200) {
                    return { name: service.name, status: 'UP', latency: 'Active' };
                }
            } catch (err) {
                // Ignore and try next URL
            }
        }
        return { name: service.name, status: 'DOWN', latency: 'N/A', error: 'Syncing...' };
    }));

    res.json({ services: results });
});

app.get('/health', (req, res) => res.json({ status: 'GATEWAY_UP' }));

app.listen(PORT, () => {
    console.log(`🚀 Gateway Active on ${PORT}`);
});
