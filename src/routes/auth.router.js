const express = require('express');
const { userregistercontroller, userlogincontroller, userlogoutcontroller } = require('../Controllers/auth.controller.js');
const { authmiddleware } = require('../middleware/auth.middleware.js');

const router = express.Router();

router.post('/register', userregistercontroller);
router.post('/login',userlogincontroller); 
router.post('/logout',authmiddleware,userlogoutcontroller);

module.exports = router;
