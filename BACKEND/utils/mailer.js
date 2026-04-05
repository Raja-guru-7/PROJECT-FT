const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Explicit Google SMTP host
  port: 465,              // Secure port for Render/Production
  secure: true,           // true for 465, false for other ports
  pool: true,             // Handle multiple requests efficiently
  connectionTimeout: 10000, 
  auth: {
    user: String(process.env.GMAIL_USER).trim(),
    pass: String(process.env.GMAIL_APP_PASSWORD).trim() // Must be 16-digit App Password
  },
  tls: {
    rejectUnauthorized: false // Helps bypass strict node TLS checks on Render
  }
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Connection Error:", error.message);
    if (error.code === 'EAUTH') {
      console.error("👉 Tip: Check your GMAIL_USER and GMAIL_APP_PASSWORD in Render Environment Settings. Ensure you are using a 16-digit App Password, not your normal login password.");
    }
  } else {
    console.log("✅ SMTP Server is ready to take our messages");
  }
});


const sendOtpEmail = async (toEmail, name, otpCode, subject = "OTP Verification", message = "Your verification code is:") => {
  try {
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
    console.log(`✅ Email successfully sent to ${toEmail}`);
  } catch (err) {
    console.error("❌ Error sending email inside sendOtpEmail function:", err);
    throw err; // Re-throw to be caught by the route handler
  }
};

module.exports = { sendOtpEmail };