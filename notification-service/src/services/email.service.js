const nodemailer = require('nodemailer');
require('dotenv').config();

/*
se require to bring in the tools. nodemailer is the world-standard library for sending emails in Node.js.
Why: We need dotenv because we never want to "hard-code" your secret keys like CLIENT_ID. We keep them safely in the .env file instead.
*/

/**
 * THE EMAIL ENGINE (Transporter)
 * We use OAuth2 here. It's like having a secure VIP pass to Gmail's server 
 * instead of just a basic key (password).
 */
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN
    }
});

/*
Instead of just using a username and password (which is old and unsafe), I used the OAuth2 type.
Why: Imagine you are trying to enter a bank vault. Instead of a key (password), you have a Digital Badge (REFRESH_TOKEN). Gmail trusts this badge much more. The clientId and clientSecret identify who is asking (your project), and the refreshToken gives the permission.

*/


/**
 * 1. Send Transaction Alert
 * This will be called whenever RabbitMQ tells us a transfer happened.
 */
const sendTransactionAlert = async (toEmail, amount, type) => {
    try {
        const mailOptions = {
            from: `Banking System <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: `Banking Alert: ${type} Successful`,
            text: `A ${type} of ${amount} INR has been processed in your account.`,
            html: `<h3>Banking Alert</h3><p>A <b>${type}</b> of <b>${amount} INR</b> has been processed successfully.</p>`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("✉️ Transaction Email Sent: " + info.messageId);
    } catch (error) {
        console.error("❌ Error sending transaction email:", error);
    }
};

/**
 * 2. Send Welcome Email
 * Called when a new account is opened.
 */
const sendWelcomeEmail = async (toEmail, name) => {
    try {
        const mailOptions = {
            from: `Banking System <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: "Welcome to our Banking System!",
            text: `Hello ${name}, welcome! Your bank account has been successfully opened.`,
            html: `<h1>Welcome, ${name}!</h1><p>Your banking account is now active and ready to use.</p>`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("✉️ Welcome Email Sent: " + info.messageId);
    } catch (error) {
        console.error("❌ Error sending welcome email:", error);
    }
};

module.exports = { sendTransactionAlert, sendWelcomeEmail };
