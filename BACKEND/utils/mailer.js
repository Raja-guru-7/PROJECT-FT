const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  family: 4, // 🔥 THE MAGIC FIX: Ithu thaan IPv6-a block panni IPv4-la anuppum!
  auth: {
    user: String(process.env.GMAIL_USER).trim(),
    pass: String(process.env.GMAIL_APP_PASSWORD).trim()
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Connection Error:", error.message);
  } else {
    console.log("✅ SMTP Server is ready");
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
          </p>
        </div>
      `
    });
    console.log(`✅ Email successfully sent to ${toEmail}`);
  } catch (err) {
    console.error("❌ Error sending email inside sendOtpEmail function:", err);
    throw err; 
  }
};

module.exports = { sendOtpEmail };