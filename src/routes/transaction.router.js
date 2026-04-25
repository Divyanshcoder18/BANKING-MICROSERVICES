const express = require('express');
const router = express.Router();
const { authmiddleware } = require('../middleware/auth.middleware.js');
const { createinitialfunds, createdeposit, createtransfer, gethistory, createwithdraw } = require('../Controllers/transaction.controller.js');

router.post('/transaction', authmiddleware, createinitialfunds);
router.post('/deposit', authmiddleware, createdeposit);
router.post('/withdraw', authmiddleware, createwithdraw);
router.post('/transfer', authmiddleware, createtransfer);
router.get('/history/:accountId', authmiddleware, gethistory);

module.exports = router;
