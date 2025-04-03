const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../utils/sendEmail');
const { forgotPassword } = require('../controllers/adminController');
router.post('/forgot-password', forgotPassword);
const { sendOtp, verifyOtp } = require('../controllers/otpController');

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

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
  
  // Reset password route
  router.post('/reset-password', async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      
      // Find admin by token and check expiration
      const admin = await Admin.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });
  
      if (!admin) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }
  
      // Update password and clear token
      admin.password = newPassword;
      admin.resetPasswordToken = undefined;
      admin.resetPasswordExpires = undefined;
      await admin.save();
  
      res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error resetting password' });
    }
  });

const {
  validateMasterLink,
  loginAdmin,
  resetAdmin
} = require('../controllers/adminController');

router.get('/validate-master-link/:token', validateMasterLink);
router.post('/login', loginAdmin);
router.post('/reset', resetAdmin);

module.exports = router;
