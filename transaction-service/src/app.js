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

module.exports = app;
