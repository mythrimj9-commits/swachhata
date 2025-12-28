const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

/**
 * Send email
 */
const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"Swachhata 2.0" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email error:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send OTP email
 */
const sendOTPEmail = async (email, otp, name = '') => {
    const subject = 'Swachhata 2.0 - Email Verification OTP';
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .otp { font-size: 32px; font-weight: bold; color: #4CAF50; text-align: center; 
               padding: 20px; background: white; border-radius: 10px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌿 Swachhata 2.0</h1>
        </div>
        <div class="content">
          <h2>Email Verification</h2>
          <p>Hello${name ? ` ${name}` : ''},</p>
          <p>Your OTP for email verification is:</p>
          <div class="otp">${otp}</div>
          <p>This OTP is valid for <strong>10 minutes</strong>.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>Swachh Bharat Mission | Clean India, Green India</p>
        </div>
      </div>
    </body>
    </html>
  `;

    const text = `Your OTP for Swachhata 2.0 email verification is: ${otp}. Valid for 10 minutes.`;

    return sendEmail({ to: email, subject, text, html });
};

/**
 * Send admin account creation email
 */
const sendAdminCreationEmail = async (email, otp, name) => {
    const subject = 'Swachhata 2.0 - Admin Account Created';
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .otp { font-size: 32px; font-weight: bold; color: #2196F3; text-align: center; 
               padding: 20px; background: white; border-radius: 10px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏛️ Swachhata 2.0 Admin</h1>
        </div>
        <div class="content">
          <h2>Welcome, ${name}!</h2>
          <p>Your admin account has been created for the Swachhata 2.0 platform.</p>
          <p>Please verify your email using the OTP below:</p>
          <div class="otp">${otp}</div>
          <p>This OTP is valid for <strong>10 minutes</strong>.</p>
          <p><strong>Note:</strong> You can log in after verifying your email.</p>
        </div>
        <div class="footer">
          <p>Municipal Corporation - Swachh Bharat Mission</p>
        </div>
      </div>
    </body>
    </html>
  `;

    const text = `Hello ${name}, your admin account has been created. Verify with OTP: ${otp}. Valid for 10 minutes.`;

    return sendEmail({ to: email, subject, text, html });
};

/**
 * Send fine notification email
 */
const sendFineNotificationEmail = async (email, fineDetails) => {
    const { vehicleNo, amount, complaintId, remarks } = fineDetails;
    const subject = 'Swachhata 2.0 - Fine Issued for Illegal Dumping';
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f44336; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .amount { font-size: 32px; font-weight: bold; color: #f44336; text-align: center; 
                  padding: 20px; background: white; border-radius: 10px; margin: 20px 0; }
        .details { background: white; padding: 15px; border-radius: 10px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Fine Notice</h1>
        </div>
        <div class="content">
          <h2>Illegal Garbage Dumping Violation</h2>
          <p>A fine has been issued against your vehicle for illegal dumping.</p>
          <div class="amount">₹${amount.toLocaleString('en-IN')}</div>
          <div class="details">
            <p><strong>Vehicle No:</strong> ${vehicleNo}</p>
            <p><strong>Complaint ID:</strong> ${complaintId}</p>
            ${remarks ? `<p><strong>Remarks:</strong> ${remarks}</p>` : ''}
          </div>
          <p style="margin-top: 20px;"><strong>Please pay this fine promptly to avoid further action.</strong></p>
        </div>
        <div class="footer">
          <p>Municipal Corporation - Swachh Bharat Mission</p>
        </div>
      </div>
    </body>
    </html>
  `;

    const text = `Fine of ₹${amount} issued for vehicle ${vehicleNo}. Complaint ID: ${complaintId}. ${remarks ? `Remarks: ${remarks}` : ''}`;

    return sendEmail({ to: email, subject, text, html });
};

module.exports = {
    sendEmail,
    sendOTPEmail,
    sendAdminCreationEmail,
    sendFineNotificationEmail
};
