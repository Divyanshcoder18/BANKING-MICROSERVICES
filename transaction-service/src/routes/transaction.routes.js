const express = require('express');
const router = express.Router();
const { createtransfer, gethistory, createdeposit, createwithdraw } = require('../controllers/transaction.controller.js');
const { authmiddleware } = require('../middleware/auth.middleware.js');

// Standardized routes PROTECTED by authentication
router.post('/transfer', authmiddleware, createtransfer);
router.get('/history/:accountId', authmiddleware, gethistory);
router.post('/deposit', authmiddleware, createdeposit);
router.post('/withdraw', authmiddleware, createwithdraw);

module.exports = router;
