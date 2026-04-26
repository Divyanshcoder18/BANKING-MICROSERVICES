require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const Redis = require('ioredis');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

// ALLOW FRONTEND TO TALK TO BACKEND
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

// INTERNAL URLS (From Env Vars or defaults)
const AUTH_URL = process.env.AUTH_SERVICE_URL || 'http://banking-auth-service:10000';
const USER_URL = process.env.USER_SERVICE_URL || 'http://banking-user-service:10000';
const TRANS_URL = process.env.TRANSACTION_SERVICE_URL || 'http://banking-transaction-service:10000';
const NOTIF_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://banking-notification-service:10000';
const FRAUD_URL = process.env.FRAUD_SERVICE_URL || 'http://banking-fraud-service:10000';
const AUDIT_URL = process.env.AUDIT_SERVICE_URL || 'http://banking-audit-service:10000';

// PROXY ROUTES
const proxyOptions = (target) => ({
    target,
    changeOrigin: true,
    pathRewrite: { '^/api/[^/]+': '' }
});

app.use('/api/auth', createProxyMiddleware(proxyOptions(AUTH_URL)));
app.use('/api/users', createProxyMiddleware(proxyOptions(USER_URL)));
app.use('/api/transaction', createProxyMiddleware(proxyOptions(TRANS_URL)));

// HEALTH DASHBOARD
app.get('/api/health/status', async (req, res) => {
    const services = [
        { name: 'Auth Service', url: AUTH_URL },
        { name: 'User Service', url: USER_URL },
        { name: 'Transaction Service', url: TRANS_URL },
        { name: 'Notification Service', url: NOTIF_URL },
        { name: 'Fraud Service', url: FRAUD_URL },
        { name: 'Audit Service', url: AUDIT_URL }
    ];

    const results = await Promise.all(services.map(async (service) => {
        try {
            // We use a simple fetch to see if the service is alive
            const response = await fetch(`${service.url}/health`);
            if (response.ok) return { name: service.name, status: 'UP', latency: 'Active' };
        } catch (err) {}
        return { name: service.name, status: 'DOWN', latency: 'N/A', error: 'Connecting...' };
    }));

    res.json({ services: results });
});

app.get('/health', (req, res) => res.json({ status: 'GATEWAY_UP' }));

app.listen(PORT, () => {
    console.log(`🚀 Gateway Active on ${PORT}`);
});
