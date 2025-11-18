const Feedback = require("../models/Feedback");

// Get customer's own feedback/tickets
exports.getMyFeedback = async (req, res) => {
  try {
    const userEmail = req.user.email;
    console.log("🔍 Fetching tickets for user email:", userEmail);
    
    const feedback = await Feedback.find({ email: userEmail })
      .sort({ createdAt: -1 })
      .select("-__v");
    
    console.log(`✅ Found ${feedback.length} tickets for ${userEmail}`);
    
    res.json({
      success: true,
      feedback,
      count: feedback.length,
    });
  } catch (error) {
    console.error("❌ Error fetching customer feedback:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching your tickets",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get all feedback
exports.getAllFeedback = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    
    const feedback = await Feedback.find(query).sort({ createdAt: -1 });
    res.json({
      success: true,
      feedback,
      count: feedback.length,
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching feedback",
    });
  }
};

// Get feedback by ID
exports.getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    res.json({
      success: true,
      feedback,
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching feedback",
    });
  }
};

// Update feedback status
exports.updateFeedbackStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const validStatuses = ["new", "read", "replied", "resolved"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    feedback.status = status;
    await feedback.save();

    res.json({
      success: true,
      message: "Feedback status updated successfully",
      feedback,
    });
  } catch (error) {
    console.error("Error updating feedback status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating feedback status",
    });
  }
};

// Reply to feedback
exports.replyToFeedback = async (req, res) => {
  try {
    const { message } = req.body;
    const adminName = req.user.name || "Admin";

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Reply message is required",
      });
    }

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    // Save admin reply
    feedback.adminReply = {
      message: message.trim(),
      repliedAt: new Date(),
      repliedBy: adminName,
    };
    feedback.status = "replied";
    await feedback.save();

    // Send email to customer
    try {
      const nodemailer = require("nodemailer");
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        secure: true,
        tls: { rejectUnauthorized: false },
      });

      const mailOptions = {
        from: `"Food App Support" <${process.env.EMAIL_USER}>`,
        to: feedback.email,
        replyTo: process.env.EMAIL_USER,
        subject: `✅ Your Ticket Received a Response - Please View`,
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
                padding: 40px 30px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 700;
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
              .message-box {
                background: #f8f9ff;
                padding: 25px;
                border-radius: 12px;
                border-left: 5px solid #667eea;
                margin: 25px 0;
              }
              .message-box p {
                color: #2d3748;
                font-size: 15px;
                line-height: 1.8;
                margin: 0;
                white-space: pre-wrap;
              }
              .original-inquiry {
                background: #f9f9f9;
                padding: 20px;
                border-radius: 10px;
                margin: 25px 0;
                border: 1px solid #e0e0e0;
              }
              .original-inquiry h3 {
                color: #667eea;
                font-size: 16px;
                margin-bottom: 10px;
              }
              .original-inquiry p {
                color: #666;
                font-size: 14px;
                margin: 5px 0;
              }
              .footer {
                background: #f8f9fa;
                padding: 30px 35px;
                text-align: center;
                color: #6c757d;
                font-size: 13px;
                border-top: 1px solid #e0e0e0;
              }
            </style>
          </head>
          <body>
            <div class="email-wrapper">
              <div class="container">
                <div class="header">
                  <h1>📧 Response to Your Inquiry</h1>
                </div>
                <div class="content">
                  <div class="greeting">Hello ${feedback.name},</div>
                  <p style="color: #555; font-size: 16px; margin-bottom: 20px; font-weight: 600;">
                    ✅ Your ticket has received a response! Please view the response below:
                  </p>
                  
                  <div class="message-box">
                    <p>${message.trim()}</p>
                  </div>

                  <div class="original-inquiry">
                    <h3>Your Original Inquiry:</h3>
                    <p><strong>Type:</strong> ${feedback.inquiryType}</p>
                    <p><strong>Message:</strong> ${feedback.message}</p>
                  </div>

                  <p style="color: #555; font-size: 15px; margin-top: 25px;">
                    If you have any further questions, please don't hesitate to contact us again.
                  </p>
                  <p style="color: #555; font-size: 15px; margin-top: 10px;">
                    Best regards,<br>
                    <strong>Food App Support Team</strong>
                  </p>
                </div>
                <div class="footer">
                  <p>This is an automated response to your inquiry submitted on ${new Date(feedback.createdAt).toLocaleDateString()}</p>
                  <p style="margin-top: 10px;">© ${new Date().getFullYear()} Food App. All rights reserved.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Reply email sent to ${feedback.email}`);
    } catch (emailError) {
      console.error("Error sending reply email:", emailError);
      // Don't fail the reply if email fails
    }

    res.json({
      success: true,
      message: "Reply sent successfully",
      feedback,
    });
  } catch (error) {
    console.error("Error replying to feedback:", error);
    res.status(500).json({
      success: false,
      message: "Error sending reply",
    });
  }
};

// Delete feedback
exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    await Feedback.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Feedback deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting feedback",
    });
  }
};

