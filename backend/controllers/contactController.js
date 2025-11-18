const nodemailer = require("nodemailer");

// Create transporter (reusable)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Ensure HTML emails are sent properly
    secure: true,
    tls: {
      rejectUnauthorized: false,
    },
  });
};

// Send confirmation email to customer
const sendCustomerConfirmation = async (fname, lname, email, inquiryType) => {
  try {
    const transporter = createTransporter();

    const confirmationMailOptions = {
      from: `"Food App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Thank You for Contacting Us - ${inquiryType}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 40px 20px;
            }
            .email-wrapper {
              max-width: 600px;
              margin: 0 auto;
            }
            .container {
              background: #ffffff;
              border-radius: 16px;
              box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 50px 30px;
              text-align: center;
              position: relative;
            }
            .header::after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              height: 4px;
              background: rgba(255, 255, 255, 0.3);
            }
            .success-icon {
              width: 80px;
              height: 80px;
              background: rgba(255, 255, 255, 0.2);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 20px;
              font-size: 40px;
            }
            .header h1 {
              margin: 0;
              font-size: 32px;
              font-weight: 700;
              letter-spacing: -0.5px;
            }
            .header-subtitle {
              margin-top: 15px;
              font-size: 16px;
              opacity: 0.95;
              font-weight: 400;
            }
            .content {
              padding: 40px 35px;
              background: #ffffff;
            }
            .greeting {
              font-size: 18px;
              color: #1a1a1a;
              margin-bottom: 20px;
              font-weight: 600;
            }
            .message {
              font-size: 16px;
              color: #555;
              line-height: 1.8;
              margin-bottom: 30px;
            }
            .info-box {
              background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
              padding: 25px;
              border-radius: 12px;
              border-left: 5px solid #667eea;
              margin: 25px 0;
            }
            .info-box p {
              margin: 8px 0;
              color: #2d3748;
              font-size: 15px;
            }
            .info-box strong {
              color: #667eea;
              font-weight: 700;
            }
            .next-steps {
              background: #f8f9fa;
              padding: 25px;
              border-radius: 12px;
              margin: 30px 0;
            }
            .next-steps h3 {
              color: #667eea;
              font-size: 18px;
              margin-bottom: 15px;
              font-weight: 700;
            }
            .next-steps ul {
              margin-left: 20px;
              color: #555;
            }
            .next-steps li {
              margin: 10px 0;
              line-height: 1.6;
            }
            .footer {
              background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
              padding: 30px 35px;
              text-align: center;
              color: #6c757d;
              font-size: 13px;
              border-top: 1px solid #e0e0e0;
            }
            .footer p {
              margin: 8px 0;
            }
            .contact-info {
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #e0e0e0;
            }
            .contact-info p {
              margin: 5px 0;
              color: #667eea;
              font-weight: 600;
            }
            @media only screen and (max-width: 600px) {
              .content {
                padding: 30px 25px;
              }
              .header {
                padding: 40px 20px;
              }
              .header h1 {
                font-size: 26px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="container">
              <div class="header">
                <div class="success-icon">✓</div>
                <h1>Thank You, ${fname}!</h1>
                <p class="header-subtitle">Your ticket has been received</p>
              </div>
              
              <div class="content">
                <p class="greeting">Hello ${fname} ${lname},</p>
                
                <p class="message">
                  Thank you for reaching out to us! We have successfully received your contact form submission and our team will get back to you as soon as possible.
                </p>
                
                <div class="info-box">
                  <p><strong>Inquiry Type:</strong> ${inquiryType}</p>
                  <p><strong>Status:</strong> Received ✓</p>
                  <p><strong>Response Time:</strong> We typically respond within 24 hours</p>
                </div>
                
                <div class="next-steps">
                  <h3>What happens next?</h3>
                  <ul>
                    <li>Our team will review your inquiry</li>
                    <li>We'll respond to you via email at <strong>${email}</strong></li>
                    <li>You can expect a response within 24 hours</li>
                  </ul>
                </div>
                
                <p class="message">
                  If you have any urgent questions or concerns, please feel free to contact us directly. We're here to help!
                </p>
              </div>
              
              <div class="footer">
                <p><strong>This is an automated confirmation email</strong></p>
                <p>📅 Received on ${new Date().toLocaleString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}</p>
                
                <div class="contact-info">
                  <p>Need immediate assistance?</p>
                  <p>Email: kanukulacharan@gmail.com</p>
                  <p>Phone: +1 (555) 123-4567</p>
                </div>
                
                <p style="margin-top: 20px; font-size: 12px; color: #999;">
                  © ${new Date().getFullYear()} Food App. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Thank You, ${fname}!

Your ticket has been received.

Hello ${fname} ${lname},

Thank you for reaching out to us! We have successfully received your contact form submission and our team will get back to you as soon as possible.

Inquiry Type: ${inquiryType}
Status: Received ✓
Response Time: We typically respond within 24 hours

What happens next?
- Our team will review your inquiry
- We'll respond to you via email at ${email}
- You can expect a response within 24 hours

If you have any urgent questions or concerns, please feel free to contact us directly.

---
Received on ${new Date().toLocaleString()}

Need immediate assistance?
Email: kanukulacharan@gmail.com
Phone: +1 (555) 123-4567

© ${new Date().getFullYear()} Food App. All rights reserved.
      `,
    };

    await transporter.sendMail(confirmationMailOptions);
    console.log(`✅ Confirmation email sent to customer: ${email}`);
  } catch (error) {
    console.error("Error sending customer confirmation email:", error);
    throw error;
  }
};

// Send contact form email
exports.sendContactEmail = async (req, res) => {
  try {
    const { fname, lname, email, phone, inquiryType, message } = req.body;
    // All contact form submissions go to kanukulacharan@gmail.com
    const recipientEmail = "kanukulacharan@gmail.com";

    const transporter = createTransporter();

    const mailOptions = {
      from: `"Food App Contact Form" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      replyTo: email, // Allow replying directly to the sender
      subject: `New Contact Form Submission: ${inquiryType} - ${fname} ${lname}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 40px 20px;
            }
            .email-wrapper {
              max-width: 650px;
              margin: 0 auto;
            }
            .container {
              background: #ffffff;
              border-radius: 16px;
              box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
              position: relative;
            }
            .header::after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              height: 4px;
              background: rgba(255, 255, 255, 0.3);
            }
            .header-icon {
              font-size: 48px;
              margin-bottom: 15px;
              display: block;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
              letter-spacing: -0.5px;
            }
            .header-subtitle {
              margin-top: 10px;
              font-size: 14px;
              opacity: 0.9;
              font-weight: 400;
            }
            .content {
              padding: 40px 35px;
              background: #ffffff;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 25px;
              margin-bottom: 30px;
            }
            .info-section {
              margin-bottom: 28px;
            }
            .info-section.full-width {
              grid-column: 1 / -1;
            }
            .info-label {
              font-weight: 700;
              color: #667eea;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              margin-bottom: 10px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .info-label::before {
              content: '';
              width: 4px;
              height: 16px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 2px;
            }
            .info-value {
              font-size: 17px;
              color: #1a1a1a;
              margin: 0;
              font-weight: 500;
              line-height: 1.5;
            }
            .info-value a {
              color: #667eea;
              text-decoration: none;
              font-weight: 600;
              transition: color 0.3s;
            }
            .info-value a:hover {
              color: #764ba2;
              text-decoration: underline;
            }
            .inquiry-badge {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 10px 20px;
              border-radius: 25px;
              font-size: 14px;
              font-weight: 600;
              box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
              margin-top: 5px;
            }
            .message-section {
              margin-top: 30px;
              margin-bottom: 30px;
            }
            .message-label {
              font-weight: 700;
              color: #667eea;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              margin-bottom: 15px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .message-label::before {
              content: '';
              width: 4px;
              height: 16px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 2px;
            }
            .message-box {
              background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
              padding: 25px 30px;
              border-radius: 12px;
              border-left: 5px solid #667eea;
              box-shadow: 0 4px 15px rgba(102, 126, 234, 0.1);
              position: relative;
            }
            .message-box::before {
              content: '"';
              position: absolute;
              top: 15px;
              left: 20px;
              font-size: 60px;
              color: #667eea;
              opacity: 0.2;
              font-family: Georgia, serif;
              line-height: 1;
            }
            .message-box p {
              margin: 0;
              white-space: pre-wrap;
              color: #2d3748;
              font-size: 16px;
              line-height: 1.8;
              font-weight: 400;
              position: relative;
              z-index: 1;
              padding-left: 20px;
            }
            .action-section {
              text-align: center;
              margin-top: 35px;
              padding-top: 30px;
              border-top: 2px solid #f0f0f0;
            }
            .reply-button {
              display: inline-block;
              padding: 16px 40px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              border-radius: 50px;
              font-weight: 700;
              font-size: 16px;
              box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
              transition: all 0.3s;
            }
            .reply-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
            }
            .footer {
              background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
              padding: 25px 35px;
              text-align: center;
              color: #6c757d;
              font-size: 13px;
              border-top: 1px solid #e0e0e0;
            }
            .footer p {
              margin: 5px 0;
            }
            .timestamp {
              color: #667eea;
              font-weight: 600;
              margin-top: 10px;
            }
            @media only screen and (max-width: 600px) {
              .info-grid {
                grid-template-columns: 1fr;
                gap: 20px;
              }
              .content {
                padding: 30px 25px;
              }
              .header {
                padding: 30px 20px;
              }
              .header h1 {
                font-size: 24px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="container">
              <div class="header">
                <span class="header-icon">📧</span>
                <h1>New Contact Form Submission</h1>
                <p class="header-subtitle">You have received a new inquiry from your website</p>
              </div>
              
              <div class="content">
                <div class="info-grid">
                  <div class="info-section">
                    <div class="info-label">Full Name</div>
                    <p class="info-value">${fname} ${lname}</p>
                  </div>
                  
                  <div class="info-section">
                    <div class="info-label">Inquiry Type</div>
                    <div class="inquiry-badge">${inquiryType}</div>
                  </div>
                  
                  <div class="info-section">
                    <div class="info-label">Email Address</div>
                    <p class="info-value">
                      <a href="mailto:${email}">${email}</a>
                    </p>
                  </div>
                  
                  <div class="info-section">
                    <div class="info-label">Phone Number</div>
                    <p class="info-value">
                      <a href="tel:${phone}">${phone}</a>
                    </p>
                  </div>
                </div>
                
                <div class="message-section">
                  <div class="message-label">Customer Message</div>
                  <div class="message-box">
                    <p>${message.replace(/\n/g, "<br>")}</p>
                  </div>
                </div>
                
                <div class="action-section">
                  <a href="mailto:${email}?subject=Re: ${inquiryType}" class="reply-button">✉️ Reply to ${fname}</a>
                </div>
              </div>
              
              <div class="footer">
                <p><strong>This email was sent from your website's contact form</strong></p>
                <p class="timestamp">📅 Submitted on ${new Date().toLocaleString(
                  "en-US",
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
New Contact Form Submission

Name: ${fname} ${lname}
Email: ${email}
Phone: ${phone}
Inquiry Type: ${inquiryType}

Message:
${message}

---
Submitted on ${new Date().toLocaleString()}
Reply to: ${email}
      `,
    };

    // Send email with HTML content
    const info = await transporter.sendMail(mailOptions);
    console.log(
      `✅ Contact form email sent to ${recipientEmail} from ${email}`
    );
    console.log(`📧 Email Message ID: ${info.messageId}`);
    console.log(`📧 Email accepted: ${info.accepted}`);

    // Send confirmation email to customer
    try {
      await sendCustomerConfirmation(fname, lname, email, inquiryType);
    } catch (confirmationError) {
      console.error("Error sending confirmation email:", confirmationError);
      // Don't fail the request if confirmation email fails
    }

    res.status(200).json({
      success: true,
      message: "Email sent successfully!",
    });
  } catch (error) {
    console.error("Error sending contact email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send email. Please try again later.",
    });
  }
};

// Send franchise application email
exports.sendFranchiseApplication = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      location,
      investmentBudget,
      experience,
      message,
    } = req.body;
    // All franchise applications go to kanukulacharan@gmail.com
    const recipientEmail = "kanukulacharan@gmail.com";

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      replyTo: email, // Allow replying directly to the applicant
      subject: `New Franchise Application from ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f5f5f5;
            }
            .container {
              background: white;
              border-radius: 12px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            }
            .content {
              padding: 30px;
            }
            .info-section {
              margin-bottom: 20px;
              padding-bottom: 20px;
              border-bottom: 1px solid #e8e8e8;
            }
            .info-section:last-child {
              border-bottom: none;
              margin-bottom: 0;
              padding-bottom: 0;
            }
            .info-label {
              font-weight: 700;
              color: #667eea;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 8px;
            }
            .info-value {
              font-size: 16px;
              color: #333;
              margin: 0;
            }
            .message-box {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #667eea;
              margin-top: 10px;
            }
            .message-box p {
              margin: 0;
              white-space: pre-wrap;
              color: #555;
            }
            .footer {
              background: #f8f9fa;
              padding: 20px 30px;
              text-align: center;
              color: #666;
              font-size: 12px;
              border-top: 1px solid #e8e8e8;
            }
            .reply-button {
              display: inline-block;
              margin-top: 20px;
              padding: 12px 24px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏢 New Franchise Application</h1>
            </div>
            <div class="content">
              <div class="info-section">
                <div class="info-label">Applicant Name</div>
                <p class="info-value">${name}</p>
              </div>
              
              <div class="info-section">
                <div class="info-label">Email Address</div>
                <p class="info-value"><a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a></p>
              </div>
              
              <div class="info-section">
                <div class="info-label">Phone Number</div>
                <p class="info-value"><a href="tel:${phone}" style="color: #667eea; text-decoration: none;">${phone}</a></p>
              </div>
              
              <div class="info-section">
                <div class="info-label">Location</div>
                <p class="info-value">${location}</p>
              </div>
              
              <div class="info-section">
                <div class="info-label">Investment Budget</div>
                <p class="info-value" style="font-size: 18px; font-weight: 600; color: #667eea;">${investmentBudget}</p>
              </div>
              
              <div class="info-section">
                <div class="info-label">Experience</div>
                <p class="info-value">${experience}</p>
              </div>
              
              ${
                message
                  ? `
              <div class="info-section">
                <div class="info-label">Additional Message</div>
                <div class="message-box">
                  <p>${message.replace(/\n/g, "<br>")}</p>
                </div>
              </div>
              `
                  : ""
              }
              
              <div style="text-align: center;">
                <a href="mailto:${email}?subject=Re: Franchise Application" class="reply-button">Reply to ${name}</a>
              </div>
            </div>
            <div class="footer">
              <p>This email was sent from your website's franchise application form.</p>
              <p>Submitted on ${new Date().toLocaleString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
New Franchise Application

Name: ${name}
Email: ${email}
Phone: ${phone}
Location: ${location}
Investment Budget: ${investmentBudget}
Experience: ${experience}
${message ? `Message: ${message}` : ""}

---
Submitted on ${new Date().toLocaleString()}
Reply to: ${email}
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(
      `✅ Franchise application email sent to ${recipientEmail} from ${email}`
    );

    res.status(200).json({
      success: true,
      message: "Franchise application submitted successfully!",
    });
  } catch (error) {
    console.error("Error sending franchise application:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send application. Please try again later.",
    });
  }
};

// Send welcome email to new user (non-blocking)
exports.sendWelcomeEmail = async (userName, userEmail) => {
  console.log(
    `[sendWelcomeEmail] Called with: userName=${userName}, userEmail=${userEmail}`
  );

  // Only send email if email service is configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("⚠️  Email service not configured. Skipping welcome email.");
    console.log(`   EMAIL_USER: ${process.env.EMAIL_USER || "NOT SET"}`);
    console.log(`   EMAIL_PASS: ${process.env.EMAIL_PASS ? "SET" : "NOT SET"}`);
    return { success: false, message: "Email service not configured" };
  }

  try {
    console.log(`[sendWelcomeEmail] Creating transporter...`);
    const transporter = createTransporter();
    console.log(`[sendWelcomeEmail] Transporter created successfully`);
    const appName = process.env.APP_NAME || "Food App";
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    const mailOptions = {
      from: `"${appName}" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Welcome to ${appName}! 🎉`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: #ff6b35;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Welcome to ${appName}! 🎉</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>Thank you for joining us! We're thrilled to have you as part of our community.</p>
            
            <p>Your account has been successfully created. You can now:</p>
            <ul>
              <li>🍽️ Browse our delicious menu</li>
              <li>🛒 Add items to your cart</li>
              <li>📦 Place orders and track them</li>
              <li>⭐ Enjoy exclusive offers and discounts</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${frontendUrl}/menu" class="button">Start Ordering Now</a>
            </div>
            
            <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
            
            <p>Happy ordering!</p>
            <p><strong>The ${appName} Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome to ${appName}!

Hello ${userName}!

Thank you for joining us! We're thrilled to have you as part of our community.

Your account has been successfully created. You can now:
- Browse our delicious menu
- Add items to your cart
- Place orders and track them
- Enjoy exclusive offers and discounts

Visit ${frontendUrl}/menu to start ordering!

If you have any questions or need assistance, feel free to reach out to our support team.

Happy ordering!
The ${appName} Team

---
This is an automated email. Please do not reply to this message.
© ${new Date().getFullYear()} ${appName}. All rights reserved.
      `,
    };

    console.log(`[sendWelcomeEmail] Sending email to ${userEmail}...`);
    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent successfully to ${userEmail}`);
    return { success: true, message: "Welcome email sent successfully" };
  } catch (error) {
    console.error(
      `❌ Error sending welcome email to ${userEmail}:`,
      error.message
    );
    console.error(`   Error code:`, error.code);
    console.error(`   Error response:`, error.response);
    // Don't throw error - registration should succeed even if email fails
    return { success: false, message: error.message };
  }
};
