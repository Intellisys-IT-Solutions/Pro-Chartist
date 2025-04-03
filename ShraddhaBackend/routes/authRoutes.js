const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../utils/sendEmail');
const { signup, login } = require('../controllers/authController');
const { forgotPassword, resetPassword } = require('../controllers/authController');
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
module.exports = router;

const { sendOtp, verifyOtp } = require('../controllers/otpController');

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

const authController = require('../controllers/authController');

router.post('/forgot-password', authController.forgotPassword);


const User = require('../models/User'); // Your User model
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const JWT_SECRET = process.env.JWT_SECRET || 'yoursecret';

// POST /api/users/forgot-password
// Forgot password route
router.post('/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      
      // Find admin by email
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(404).json({ message: 'No admin found with this email' });
      }
  
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpires = Date.now() + 3600000; // 1 hour from now
  
      // Save token to admin document
      admin.resetPasswordToken = resetToken;
      admin.resetPasswordExpires = resetTokenExpires;
      await admin.save();
  
      // Send email
      await sendPasswordResetEmail(admin.email, resetToken);
  
      res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error processing password reset' });
    }
  });