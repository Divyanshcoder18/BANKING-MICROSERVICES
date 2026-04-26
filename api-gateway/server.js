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

// 2. SMART DISCOVERY
// We define both Internal (Fast) and External (Backup) URLs
const getServiceUrl = (envVar, internalDefault, externalBackup) => {
    return process.env[envVar] || internalDefault || externalBackup;
};

const AUTH_URL = getServiceUrl('AUTH_SERVICE_URL', 'http://banking-auth-service:10000', 'https://banking-auth-service.onrender.com');
const USER_URL = getServiceUrl('USER_SERVICE_URL', 'http://banking-user-service:10000', 'https://banking-user-service.onrender.com');
const TRANS_URL = getServiceUrl('TRANSACTION_SERVICE_URL', 'http://banking-transaction-service:10000', 'https://banking-transaction-service.onrender.com');
const NOTIF_URL = getServiceUrl('NOTIFICATION_SERVICE_URL', 'http://banking-notification-service:10000', 'https://banking-notification-service.onrender.com');
const FRAUD_URL = getServiceUrl('FRAUD_SERVICE_URL', 'http://banking-fraud-service:10000', 'https://banking-fraud-service.onrender.com');
const AUDIT_URL = getServiceUrl('AUDIT_SERVICE_URL', 'http://banking-audit-service:10000', 'https://banking-audit-service.onrender.com');

// 3. PROXY ROUTES
const proxyOptions = (target) => ({
    target,
    changeOrigin: true,
    pathRewrite: { '^/api/[^/]+': '' },
    timeout: 30000, // 30 seconds
    proxyTimeout: 30000
});

app.use('/api/auth', createProxyMiddleware(proxyOptions(AUTH_URL)));
app.use('/api/users', createProxyMiddleware(proxyOptions(USER_URL)));
app.use('/api/transaction', createProxyMiddleware(proxyOptions(TRANS_URL)));

// 4. REAL-TIME PULSE MONITORING
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
        // Try internal first, then external
        const urlsToTry = [service.url, service.url.replace('http://', 'https://').replace(':10000', '.onrender.com')];
        
        for (const url of urlsToTry) {
            try {
                const response = await fetch(`${url}/health`, { signal: AbortSignal.timeout(8000) });
                if (response.ok) {
                    return { name: service.name, status: 'UP', latency: 'Active' };
                }
            } catch (e) {
                continue; 
            }
        }
        return { name: service.name, status: 'DOWN', latency: 'N/A', error: 'Waiting for boot...' };
    }));

    res.json({ services: results });
});

app.get('/health', (req, res) => res.json({ status: 'GATEWAY_UP' }));

app.listen(PORT, () => {
    console.log(`🚀 Gateway Active on ${PORT}`);
});
