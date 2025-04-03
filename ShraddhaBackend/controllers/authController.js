const crypto = require('crypto');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const ResetToken = require('../models/ResetToken');

const nodemailer = require('nodemailer');

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found with this email.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 15; // 15 minutes
    await user.save();

    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset your password',
      html: `
        <h3>Password Reset</h3>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link expires in 15 minutes.</p>
      `
    };

    xports.sendOtpToEmail = async (req, res) => {
      const { email } = req.body;
    
      try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });
    
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
        user.otpCode = otp;
        user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 mins
        await user.save();
    
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });
    
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Your OTP Code',
          html: `<h3>Your OTP is: ${otp}</h3><p>It expires in 5 minutes.</p>`
        };
    
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: 'OTP sent to your email.' });
    
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to send OTP' });
      }
    };
    
    exports.verifyOtpCode = async (req, res) => {
      const { email, otp } = req.body;
      const user = await User.findOne({ email });
    
      if (!user || user.otpCode !== otp || user.otpExpires < Date.now()) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }
    
      return res.status(200).json({ message: 'OTP verified' });
    };
    
    exports.resetPasswordWithOtp = async (req, res) => {
      const { email, otp, newPassword } = req.body;
      const user = await User.findOne({ email });
    
      if (!user || user.otpCode !== otp || user.otpExpires < Date.now()) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }
    
      user.password = newPassword; // Ideally hash it before saving!
      user.otpCode = undefined;
      user.otpExpires = undefined;
      await user.save();
    
      return res.status(200).json({ message: 'Password has been reset.' });
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Reset link sent!' });

  } catch (err) {
    console.error('Forgot Password Error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.signup = async (req, res) => {
  const { email, password, mobile } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({ email, password: hashedPassword, mobile });
    await user.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No user found with this email' });

    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
    const html = `
      <h3>Password Reset</h3>
      <p>Click below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link is valid for 1 hour.</p>
    `;

    await sendEmail(user.email, 'Reset Your Password', html);
    res.status(200).json({ message: 'Reset link sent to your email' });
  } catch (err) {
    console.error('Forgot Password Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset Password Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

