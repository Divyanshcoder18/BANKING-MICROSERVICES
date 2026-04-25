const express = require("express");
const router = express.Router();
const { accountcontroller, getuseraccount, getbalance } = require("../Controllers/account.controller.js");
const { authmiddleware } = require("../middleware/auth.middleware.js");

// We add authmiddleware before the controller so req.user is set
router.post('/account', authmiddleware, accountcontroller);
router.post('/create', authmiddleware, accountcontroller);
router.get('/balance', authmiddleware, getbalance);
router.get('/useraccount', authmiddleware, getuseraccount);


module.exports = router;
