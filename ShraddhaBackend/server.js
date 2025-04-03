const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const adminRoutes = require('./routes/admin');
const Admin = require('./models/Admin');

const leagueRoutes = require('./routes/league');




const createDefaultAdmin = async () => {
  const existing = await Admin.findOne({ email: 'admin@example.com' });
  if (!existing) {
    const hashed = await bcrypt.hash('Admin@123', 10);
    await Admin.create({ email: 'admin@example.com', password: hashed, role: 'admin' });
    console.log('Default admin created');
  }
};

const app = express();
connectDB();



app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/league', leagueRoutes);



app.use('/api/users', require('./routes/authRoutes'));
const applicationRoutes = require('./routes/applicationRoutes');
app.use('/api/applicationsByDate', applicationRoutes); // ✅ This is correct
app.use('/api/admin', adminRoutes);




const otpRoutes = require('./routes/otpRoutes');
app.use('/api', otpRoutes);


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

app.get('/', (req, res) => {
  res.send('API is working');
});


const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



