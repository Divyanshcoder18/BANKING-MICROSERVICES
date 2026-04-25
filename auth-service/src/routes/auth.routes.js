const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller.js');
const { authmiddleware } = require('../middleware/auth.middleware.js');

// Register: POST /api/auth/register
router.post('/register', authController.userregistercontroller);

// Login: POST /api/auth/login
router.post('/login', authController.userlogincontroller);

// Logout: POST /api/auth/logout (Protected)
router.post('/logout', authmiddleware, authController.userlogoutcontroller);

module.exports = router;
