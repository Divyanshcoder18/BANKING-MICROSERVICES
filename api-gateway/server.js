require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const Redis = require('ioredis');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

// Enable CORS for frontend interaction
app.use(cors());

// 1. Redis Setup (Rate Limiting)
const redis = new Redis(process.env.REDIS_URL);
redis.on('connect', () => console.log('✅ Gateway Protected with Redis'));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.'
});
app.use(limiter);

// 2. LOGGING MIDDLEWARE
app.use((req, res, next) => {
    console.log(`[GATEWAY] ${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// 3. PROXY ROUTES
const createProxyOptions = (target) => ({
    target,
    changeOrigin: true,
    pathRewrite: { '^/api/[^/]+': '' },
    onError: (err, req, res) => {
        console.error(`❌ Proxy Error for ${target}:`, err.message);
        res.status(502).json({ message: 'Service temporarily unavailable' });
    }
});

// URLs from Env (Defaulting to Internal Names if missing)
const AUTH_URL = process.env.AUTH_SERVICE_URL || 'http://banking-auth-service:10000';
const USER_URL = process.env.USER_SERVICE_URL || 'http://banking-user-service:10000';
const TRANS_URL = process.env.TRANSACTION_SERVICE_URL || 'http://banking-transaction-service:10000';
const NOTIF_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://banking-notification-service:10000';
const FRAUD_URL = process.env.FRAUD_SERVICE_URL || 'http://banking-fraud-service:10000';
const AUDIT_URL = process.env.AUDIT_SERVICE_URL || 'http://banking-audit-service:10000';

app.use('/api/auth', createProxyMiddleware(createProxyOptions(AUTH_URL)));
app.use('/api/users', createProxyMiddleware(createProxyOptions(USER_URL)));
app.use('/api/transaction', createProxyMiddleware(createProxyOptions(TRANS_URL)));

// 4. CENTRALIZED HEALTH MONITORING
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
            const start = Date.now();
            const response = await fetch(`${service.url}/health`, { signal: AbortSignal.timeout(10000) });
            const latency = Date.now() - start;
            
            if (response.ok) {
                return { name: service.name, status: 'UP', latency: `${latency}ms` };
            }
            throw new Error(`Status: ${response.status}`);
        } catch (err) {
            return { name: service.name, status: 'DOWN', latency: 'N/A', error: 'Service Unreachable' };
        }
    }));

    res.json({ services: results });
});

app.get('/health', (req, res) => res.json({ status: 'GATEWAY_UP' }));

app.listen(PORT, () => {
    console.log(`🚀 API Gateway running on port ${PORT}`);
});
