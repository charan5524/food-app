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

