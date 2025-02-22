const userService = require('../services/userService');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../services/emailService');
const { sendSMS } = require('../services/twilioService');
const { catchAsync } = require('../utils/catchAsync.js');
const ApiResponse = require('../utils/ApiResponse.js');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Register User
const register = catchAsync(async (req, res) => {
  const user = await userService.register(req.body);
  const token = generateToken(user._id);
  
  res.status(201).json(
    ApiResponse.created({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber
      }
    })
  );
});

// Login User
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userService.findByEmail(email, true);
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  let user;
  try {
    user = await userService.findByEmail(req.body.email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Send email
    const resetUrl = `${req.protocol}://${req.get('host')}/api/users/reset-password/${resetToken}`;
    const message = `Reset your password by clicking: ${resetUrl}`;

    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      html: message
    });

    // Send SMS if phone number exists
    if (user.phoneNumber) {
      await sendSMS(
        user.phoneNumber,
        'Your password reset token has been sent to your email.'
      );
    }

    res.status(200).json({
      success: true,
      message: 'Reset token sent to email'
    });
  } catch (error) {
    if (user) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await userService.findByResetToken(resetPasswordToken);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update User Profile
const updateProfile = async (req, res) => {
  try {
    const updates = {
      name: req.body.name,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber
    };

    const user = await userService.updateById(req.user.id, updates);

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await userService.find(
      {}, // filter
      {
        select: 'name email',
        page: req.query.page,
        limit: req.query.limit,
        sort: { createdAt: -1 }
      }
    );

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getUserStats = async (req, res) => {
  try {
    const stats = await userService.getUserStats();
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  updateProfile,
  getUsers,
  getUserStats
}; 