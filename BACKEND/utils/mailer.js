const { Resend } = require('resend');

// Render env variable la irunthu API key edukkurom
const resend = new Resend(process.env.RESEND_API_KEY);

const sendOtpEmail = async (toEmail, name, otpCode, subject = "OTP Verification", message = "Your verification code is:") => {
  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev', // ⚠️ Note: Ippothiki ithu apdiye irukatum.
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

    console.log(`✅ Resend Email successfully sent to ${toEmail}`);
    console.log("Resend Response ID:", data.id); // For debugging
    
  } catch (err) {
    console.error("❌ Error sending email inside sendOtpEmail function:", err);
    throw err; 
  }
};

module.exports = { sendOtpEmail };