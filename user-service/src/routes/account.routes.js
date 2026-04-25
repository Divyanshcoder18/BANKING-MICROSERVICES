const express = require('express');
const router = express.Router();

// Import our logic (Controller) and security (Middleware)
const { accountcontroller, getuseraccount, getbalance } = require('../controllers/account.controller.js');
const { authmiddleware } = require('../middleware/auth.middleware.js');

/**
 * ROUTES DEFINITION
 * We use authmiddleware on every route to ensure only logged-in users 
 * can access these banking functions.
 */

// 1. Create a new account entry
// URL path will be: /api/account/create
router.post('/create', authmiddleware, accountcontroller);

// 2. Fetch all accounts for the current user
// URL path will be: /api/account/useraccount
router.get('/useraccount', authmiddleware, getuseraccount);

// 3. Fetch balance for a specific account (Inter-service call)
// URL path will be: /api/account/balance/:accountId
router.get('/balance/:accountId', authmiddleware, getbalance);

module.exports = router;
