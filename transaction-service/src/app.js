const express = require('express');
const cookieParser = require('cookie-parser');
const transactionRoutes = require('./routes/transaction.routes.js');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Mount all transaction routes directly (API Gateway handles the /api/transaction prefix)
app.use('/', transactionRoutes);

app.get('/health', (req, res) => {
    res.json({ status: "TRANSACTION_SERVICE_UP", timestamp: new Date() });
});

module.exports = app;
