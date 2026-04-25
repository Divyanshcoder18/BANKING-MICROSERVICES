const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');


const app = express();
app.use(cors({ origin: true, credentials: true })); // Allow all origins for local testing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

//The require() command reaches into those remote files, grabs the specific "Router Object" you built there, and stores it in variables (acctRouter and authRouter
const acctRouter = require('./routes/acct.router.js');
const authRouter = require('./routes/auth.router.js');
const transactionRouter = require('./routes/transaction.router.js');


//app.use() connects a specific URL path to the "mini-app" you imported. It acts like a fork in the road:

app.use("/api/auth", authRouter);
app.use("/api/account", acctRouter);
app.use("/api/transaction", transactionRouter);
app.use("/api/users", acctRouter);



// Global Error Handler
app.use((err, req, res, next) => {
    console.log("-----------------------------------------");
    console.log("❌ GLOBAL APP ERROR DETECTED!");
    console.error(err);
    console.log("-----------------------------------------");
    res.status(500).json({ success: false, message: err.message });
});

module.exports = app;




