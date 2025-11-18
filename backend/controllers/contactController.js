const nodemailer = require("nodemailer");

// Create transporter (reusable)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send contact form email
exports.sendContactEmail = async (req, res) => {
  try {
    const { fname, lname, email, phone, inquiryType, message } = req.body;
    const recipientEmail = process.env.CONTACT_EMAIL || process.env.EMAIL_USER;

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `New Contact Form Submission from ${fname} ${lname}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${fname} ${lname}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Inquiry Type:</strong> ${inquiryType}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
      text: `Name: ${fname} ${lname}\nEmail: ${email}\nPhone: ${phone}\nInquiry Type: ${inquiryType}\nMessage: ${message}`,
    };

    await transporter.sendMail(mailOptions);

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
    const recipientEmail = process.env.CONTACT_EMAIL || process.env.EMAIL_USER;

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `New Franchise Application from ${name}`,
      html: `
        <h2>New Franchise Application</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Investment Budget:</strong> ${investmentBudget}</p>
        <p><strong>Experience:</strong> ${experience}</p>
        <p><strong>Message:</strong></p>
        <p>${message ? message.replace(/\n/g, "<br>") : "N/A"}</p>
      `,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nLocation: ${location}\nInvestment Budget: ${investmentBudget}\nExperience: ${experience}\nMessage: ${message || "N/A"}`,
    };

    await transporter.sendMail(mailOptions);

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
  console.log(`[sendWelcomeEmail] Called with: userName=${userName}, userEmail=${userEmail}`);
  
  // Only send email if email service is configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("⚠️  Email service not configured. Skipping welcome email.");
    console.log(`   EMAIL_USER: ${process.env.EMAIL_USER || 'NOT SET'}`);
    console.log(`   EMAIL_PASS: ${process.env.EMAIL_PASS ? 'SET' : 'NOT SET'}`);
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
    console.error(`❌ Error sending welcome email to ${userEmail}:`, error.message);
    console.error(`   Error code:`, error.code);
    console.error(`   Error response:`, error.response);
    // Don't throw error - registration should succeed even if email fails
    return { success: false, message: error.message };
  }
};

