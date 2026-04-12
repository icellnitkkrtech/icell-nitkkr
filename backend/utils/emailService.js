import Mailjet from "node-mailjet";

// Initialize Mailjet client
function getMailjetClient() {
  const apiKey = process.env.MAILJET_API_KEY;
  const apiSecret = process.env.MAILJET_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error(
      "Mailjet API credentials not configured. Set MAILJET_API_KEY and MAILJET_API_SECRET in environment variables."
    );
  }

  return Mailjet.apiConnect(apiKey, apiSecret);
}

/**
 * Send email verification email to user
 * @param {string} recipientEmail - Email address of the recipient
 * @param {string} recipientName - Name of the recipient
 * @param {string} verificationLink - Verification link to include in email
 * @returns {Promise<void>}
 */
export async function sendVerificationEmail(
  recipientEmail,
  recipientName,
  verificationLink
) {
  try {
    const mailjet = getMailjetClient();
    const senderEmail =
      process.env.MAILJET_FROM_EMAIL ||
      process.env.SMTP_FROM ||
      "noreply@nitkkr.ac.in";
    const senderName = process.env.MAILJET_FROM_NAME || "NITKKR";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .header {
            background-color: #2c3e50;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            background-color: white;
            padding: 30px;
            border: 1px solid #ddd;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #3498db;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .button:hover {
            background-color: #2980b9;
          }
          .footer {
            background-color: #f0f0f0;
            padding: 15px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-radius: 0 0 5px 5px;
          }
          .warning {
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            color: #856404;
            padding: 12px;
            border-radius: 4px;
            margin: 15px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ICell NIT Kurukshetra!</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${recipientName}</strong>,</p>
            
            <p>Thank you for registering with ICell NIT Kurukshetra. To complete your registration, please verify your email address by clicking the button below:</p>
            
            <center>
              <a href="${verificationLink}" class="button">Verify Email Address</a>
            </center>
            
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 3px;">
              ${verificationLink}
            </p>
            
            <div class="warning">
              <strong>Note:</strong> This link will expire in 24 hours. If you did not create this account, please ignore this email.
            </div>
            
            <p>Once you verify your email, you'll be able to log in and access all features of the ICell NIT Kurukshetra platform.</p>
            
            <p>Best regards,<br>ICell Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 NIT Kurukshetra. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      Welcome to ICell NIT Kurukshetra!
      
      Hi ${recipientName},
      
      Thank you for registering with ICell NIT Kurukshetra. To complete your registration, please verify your email address by visiting the following link:
      
      ${verificationLink}
      
      This link will expire in 24 hours. If you did not create this account, please ignore this email.
      
      Once you verify your email, you'll be able to log in and access all features of the ICell NIT Kurukshetra platform.
      
      Best regards,
      ICell Team
    `;

    const response = await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: senderEmail,
            Name: senderName,
          },
          To: [
            {
              Email: recipientEmail,
              Name: recipientName,
            },
          ],
          Subject: "Verify Your ICell NIT Kurukshetra Email Address",
          HTMLPart: htmlContent,
          TextPart: textContent,
        },
      ],
    });

    console.log("Email sent successfully via Mailjet:", {
      messageId: response.body.Messages[0].MessageID,
      to: recipientEmail,
    });

    return response;
  } catch (error) {
    console.error("Error sending email via Mailjet:", error);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
}

/**
 * Send a generic email (for future use)
 * @param {object} options - Email options
 * @returns {Promise<void>}
 */
export async function sendEmail({
  to,
  subject,
  htmlContent,
  textContent,
  fromEmail,
  fromName,
}) {
  try {
    const mailjet = getMailjetClient();
    const senderEmail =
      fromEmail ||
      process.env.MAILJET_FROM_EMAIL ||
      process.env.SMTP_FROM ||
      "noreply@nitkkr.ac.in";
    const senderName = fromName || process.env.MAILJET_FROM_NAME || "NITKKR";

    const response = await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: senderEmail,
            Name: senderName,
          },
          To: Array.isArray(to)
            ? to.map((email) => ({ Email: email }))
            : [{ Email: to }],
          Subject: subject,
          HTMLPart: htmlContent,
          TextPart: textContent,
        },
      ],
    });

    console.log("Generic email sent successfully via Mailjet:", {
      messageId: response.body.Messages[0].MessageID,
    });

    return response;
  } catch (error) {
    console.error("Error sending generic email via Mailjet:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

/**
 * Send password reset email to user
 * @param {string} recipientEmail - Email address of the recipient
 * @param {string} recipientName - Name of the recipient
 * @param {string} resetLink - Password reset link to include in email
 * @returns {Promise<void>}
 */
export async function sendPasswordResetEmail(
  recipientEmail,
  recipientName,
  resetLink
) {
  try {
    const mailjet = getMailjetClient();
    const senderEmail =
      process.env.MAILJET_FROM_EMAIL ||
      process.env.SMTP_FROM ||
      "noreply@nitkkr.ac.in";
    const senderName = process.env.MAILJET_FROM_NAME || "NITKKR";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .header {
            background-color: #e74c3c;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            background-color: white;
            padding: 30px;
            border: 1px solid #ddd;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #e74c3c;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .button:hover {
            background-color: #c0392b;
          }
          .footer {
            background-color: #f0f0f0;
            padding: 15px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-radius: 0 0 5px 5px;
          }
          .warning {
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            color: #856404;
            padding: 12px;
            border-radius: 4px;
            margin: 15px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${recipientName}</strong>,</p>
            
            <p>We received a request to reset the password for your ICell NIT Kurukshetra account. Click the button below to create a new password:</p>
            
            <center>
              <a href="${resetLink}" class="button">Reset Password</a>
            </center>
            
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 3px;">
              ${resetLink}
            </p>
            
            <div class="warning">
              <strong>Note:</strong> This link will expire in 24 hours. If you did not request a password reset, please ignore this email and your password will remain unchanged.
            </div>
            
            <p>For security reasons, never share this link with anyone.</p>
            
            <p>Best regards,<br>ICell Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 NIT Kurukshetra. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      Password Reset Request
      
      Hi ${recipientName},
      
      We received a request to reset the password for your ICell NIT Kurukshetra account. Click the link below to create a new password:
      
      ${resetLink}
      
      This link will expire in 24 hours. If you did not request a password reset, please ignore this email and your password will remain unchanged.
      
      For security reasons, never share this link with anyone.
      
      Best regards,
      ICell Team
    `;

    const response = await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: senderEmail,
            Name: senderName,
          },
          To: [
            {
              Email: recipientEmail,
              Name: recipientName,
            },
          ],
          Subject: "Reset Your ICell NIT Kurukshetra Password",
          HTMLPart: htmlContent,
          TextPart: textContent,
        },
      ],
    });

    console.log("Password reset email sent successfully via Mailjet:", {
      messageId: response.body.Messages[0].MessageID,
      to: recipientEmail,
    });

    return response;
  } catch (error) {
    console.error("Error sending password reset email via Mailjet:", error);
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
}
