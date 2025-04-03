const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const ResetToken = require('../models/ResetToken');




exports.validateMasterLink = (req, res) => {
  const { token } = req.params;
  if (token === process.env.MASTER_LINK_TOKEN) {
    return res.status(200).json({ valid: true });
  }
  return res.status(401).json({ error: 'Invalid master link' });
};

exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      message: 'Login successful',
      token,
      role: admin.role
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.resetAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Remove existing admin
    await Admin.deleteMany({});

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({
      email,
      password: hashedPassword,
      role: 'admin' // Default role
    });

    await newAdmin.save();
    res.json({ message: 'Admin credentials reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reset admin credentials' });
  }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
  
    try {
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(404).json({ error: 'Admin email not found' });
      }
  
      const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' });
      const resetLink = `${process.env.CLIENT_URL}/admin-reset/${token}`;
  
      const html = `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your admin login credentials:</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
        <p>This link expires in 15 minutes.</p>
      `;
  
      await sendEmail(email, 'Reset Your Admin Password', html);
  
      res.status(200).json({ message: 'Reset link sent to email' });
    } catch (error) {
      console.error('❌ Forgot password backend error:', error);
      res.status(500).json({ error: 'Error processing password reset' });
    }
  };
