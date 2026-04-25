require('dotenv').config();
const nodemailer = require('nodemailer');

/**
 * APEX GLOBAL BANK - NOTIFICATION ENGINE
 * We use OAuth2 for production-grade security.
 */

// 1. Configure the Email Transporter
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

/**
 * Generic Sender function with Apex Branding
 */
const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Apex Global Bank" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #f8fafc;">
                    <div style="background: linear-gradient(to right, #2563eb, #10b981); padding: 24px; text-align: center; color: white;">
                        <h1 style="margin: 0; font-size: 24px; font-weight: 800;">Apex Global Bank</h1>
                        <p style="margin: 4px 0 0; font-size: 14px; opacity: 0.9;">Secure Digital Banking</p>
                    </div>
                    <div style="padding: 32px; background: white;">
                        ${html}
                        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;">
                        <p style="font-size: 12px; color: #64748b; line-height: 1.6;">
                            This is an automated security alert from Apex Global Bank. 
                            If you did not authorize this activity, please contact our support team immediately at <b>support@apexbank.com</b>.
                        </p>
                    </div>
                    <div style="background: #f1f5f9; padding: 16px; text-align: center; color: #94a3b8; font-size: 12px;">
                        &copy; 2026 Apex Global Bank. All rights reserved.
                    </div>
                </div>
            `,
        });
        console.log('[NOTIFY] Email sent successfully:', info.messageId);
    } catch (error) {
        console.error('[NOTIFY] Email delivery failed:', error.message);
        console.log('---------------------------------------------------------');
        console.log('🔍 [MOCK DELIVERY] Since your Gmail token is expired, here is the email content:');
        console.log(`📬 To: ${to}`);
        console.log(`📌 Subject: ${subject}`);
        console.log('📄 Content (HTML):');
        console.log(html.replace(/<[^>]*>/g, ' ').trim()); // Log text version of HTML
        console.log('---------------------------------------------------------');
        console.log('   💡 Tip: To fix the "invalid_grant" error, generate a new Refresh Token or use an App Password.');
    }
};

/**
 * Professional Transaction Alert Builder
 */
const sendTransactionEmail = async (type, data) => {
    const { amount, userEmail, from, to, timestamp } = data;
    console.log(`📡 [NOTIFY] Preparing email for: ${userEmail} (Type: ${type})`);
    const formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    const dateStr = new Date(timestamp || Date.now()).toLocaleString();

    let subject = `Apex Alert: ${type} of ${formattedAmount}`;
    let bodyContent = '';

    if (type === 'DEPOSIT') {
        bodyContent = `
            <h2 style="color: #0d9488;">Deposit Received</h2>
            <p style="color: #334155; font-size: 16px;">Good news! A deposit has been credited to your account.</p>
            <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-top: 16px;">
                <tr><td style="padding: 8px 0; color: #64748b;">Amount:</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #0d9488;">+ ${formattedAmount}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;">Date:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${dateStr}</td></tr>
            </table>
        `;
    } else if (type === 'WITHDRAWAL') {
        bodyContent = `
            <h2 style="color: #dc2626;">Withdrawal Notificaton</h2>
            <p style="color: #334155; font-size: 16px;">This is a security alert to confirm a withdrawal from your account.</p>
            <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-top: 16px;">
                <tr><td style="padding: 8px 0; color: #64748b;">Amount:</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #dc2626;">- ${formattedAmount}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;">Date:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${dateStr}</td></tr>
            </table>
        `;
    } else if (type === 'TRANSFER') {
        bodyContent = `
            <h2 style="color: #2563eb;">Money Transfer Sent</h2>
            <p style="color: #334155; font-size: 16px;">Your transfer to account <b>${to}</b> has been completed.</p>
            <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-top: 16px;">
                <tr><td style="padding: 8px 0; color: #64748b;">Amount:</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #2563eb;">- ${formattedAmount}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;">Recipient ID:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${to}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;">Date:</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${dateStr}</td></tr>
            </table>
        `;
    }

    if (userEmail && bodyContent) {
        await sendEmail(userEmail, subject, bodyContent);
    } else {
        console.log(`[NOTIFY] Skipping email: Missing userEmail (${userEmail}) or unsupported type (${type})`);
    }
};

module.exports = { sendTransactionEmail };
