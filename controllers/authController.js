// controllers/authController.js
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const emailjs = require("@emailjs/nodejs");


emailjs.init({
  publicKey: process.env.EMAILJS_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_PRIVATE_KEY,
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};


exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.status(200).json({
        id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    let user;
  
    try {
      user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Generate password reset token
      const resetToken = user.generatePasswordResetToken();
      await user.save();
  

      const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
  
      const templateParams = {
        to_name: user.name || 'User', 
        from_name: 'Password Reset',
        message: `Click the link below to reset your password: ${resetUrl}`,
        to_email: user.email,
        reset_link: resetUrl,
        reply_to: process.env.SUPPORT_EMAIL || user.email
      };
  
      try {

        console.log('EmailJS Configuration:', {
          serviceId: process.env.EMAILJS_SERVICE_ID,
          templateId: process.env.EMAILJS_TEMPLATE_ID,
          publicKey: process.env.EMAILJS_PUBLIC_KEY?.substring(0, 5) + '...',
          privateKey: 'configured:' + !!process.env.EMAILJS_PRIVATE_KEY
        });

        const emailResponse = await emailjs.send(
          process.env.EMAILJS_SERVICE_ID,
          process.env.EMAILJS_TEMPLATE_ID,
          templateParams
        ).catch(error => {
          console.error('EmailJS send error:', error);
          throw new Error(error.text || 'Failed to send email');
        });
  
        console.log("Email sent successfully:", emailResponse);
  
        res.status(200).json({
          message: "Password reset email sent successfully",
          success: true
        });
  
      } catch (emailError) {
        console.error('Email sending failed:', {
          error: emailError,
          message: emailError.message,
          text: emailError.text,
          name: emailError.name
        });
        throw new Error(`Failed to send email: ${emailError.message || 'Unknown error'}`);
      }
  
    } catch (error) {
      console.error("Full error details:", error);
  
      if (user) {
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        await user.save().catch(saveError => 
          console.error('Error resetting user token:', saveError)
        );
      }
  
      res.status(500).json({
        message: "Error sending reset email",
        error: error.message || 'Unknown error occurred',
        details: {
          name: error.name,
          code: error.code,
          status: error.status
        }
      });
    }
  };
  
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiration: { $gt: Date.now() }, 
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
