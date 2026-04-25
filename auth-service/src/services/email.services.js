require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.error('[EMAIL] Authentication Error:', error.message);
    } else {
        console.log('[EMAIL] Ready for Apex Global Bank alerts');
    }
});

const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Apex Global Bank" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html,
        });
        console.log('[EMAIL] Message sent:', info.messageId);
    } catch (error) {
        console.error('[EMAIL] Failed to send:', error.message);
    }
};

async function sendregiseremail(useremail, name) {
    const subj = "Welcome to Apex Global Bank!";
    const text = `Hello ${name}, your journey with Apex Global Bank begins today!`;
    const html = `<h1>Hello ${name},</h1><p>Welcome to <b>Apex Global Bank</b>. Your digital account is now active!</p>`;
    await sendEmail(useremail, subj, text, html);
}

module.exports = { sendregiseremail }; 
