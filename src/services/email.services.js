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
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});




const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Your Name" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

async function sendregiseremail(useremail,name){
  const subj  = "Welcome to our banking system";
  const text = `Hello ${name}, welcome to our banking system.`;
  const html = `<h1>Hello ${name}, welcome to our banking system.</h1>`;

  await sendEmail(useremail, subj, text, html);
 
}

const sendtransferemail = async(useremail,name,amount)=>{
  const subj = "Transfer successful";
  const text = `Hello ${name}, you have been transferred ${amount} to your account.`;
  const html = `<h1>Hello ${name}, you have been transferred ${amount} to your account.</h1>`;
  await sendEmail(useremail, subj, text, html);
}

const sendtransferfailemail = async(useremail,name)=>{
  const subj = "Transfer failed";
  const text = `Hello ${name}, your transfer has failed.`;
  const html = `<h1>Hello ${name}, your transfer has failed.</h1>`;
  await sendEmail(useremail, subj, text, html);
}

module.exports = {sendregiseremail,sendtransferemail,sendtransferfailemail}; 






