const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  pool: true, // Handle multiple requests efficiently
  secure: false, // Use STARTTLS
  connectionTimeout: 10000, // 10 second timeout for handshake
  auth: {
    user: String(process.env.GMAIL_USER).trim(),
    pass: String(process.env.GMAIL_APP_PASSWORD).trim()
  },
  tls: {
    rejectUnauthorized: false
  }
});


// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Connection Error:", error.message);
    if (error.code === 'EAUTH') {
      console.error("👉 Tip: Check your GMAIL_USER and GMAIL_APP_PASSWORD. 2FA must be on.");
    }
  } else {
    console.log("✅ SMTP Server is ready to take our messages");
  }
});


const sendOtpEmail = async (toEmail, name, otpCode, subject = "OTP Verification", message = "Your verification code is:") => {
  await transporter.sendMail({
    from: `"AroundU" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
        <h2 style="color: #7c3aed; text-align: center;">${subject}</h2>
        <p>Hi ${name},</p>
        <p>${message}</p>
        <div style="text-align: center; margin: 30px 0;">
          <h1 style="color: #7c3aed; letter-spacing: 8px; font-size: 48px; font-weight: 900; background: #f3f4f6; padding: 15px; border-radius: 8px; display: inline-block;">${otpCode}</h1>
        </div>
        <p>This code is valid for 5 minutes only.</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px; text-align: center;">
          <strong>Security Notice:</strong> Never share this code with anyone else. 
          AroundU staff will never ask for this code.
        </p>
      </div>
    `
  });
};

module.exports = { sendOtpEmail };