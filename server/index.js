// Basic Express server setup for StartUp Connect API
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const path = require('path');
const multer = require('multer');
const app = express();
const PORT = process.env.PORT || 5000;

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Updated CORS configuration to properly handle cross-origin requests
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    const allowedOrigins = [
      'http://localhost:3000',
      'https://startup-bp55.onrender.com',
      // Add any other frontend origins that need access
    ];
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in development
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle preflight OPTIONS requests explicitly
app.options('*', cors());

app.use(express.json());

// MongoDB Atlas connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://romanvolkonidov:<db_password>@startup.8oukgfu.mongodb.net/?retryWrites=true&w=majority&appName=StartUp';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Mongoose models
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  // Add role field
  role: { type: String, enum: ['admin', 'user'], default: 'user' }
});
const User = mongoose.model('User', userSchema);

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  owner: { type: String, required: true },
  postedAt: { type: String, required: true },
  amount: { type: Number, required: true },
  returnPercent: { type: Number, required: true },
  paybackTime: { type: String, required: true },
  email: { type: String }, // new
  phone: { type: String }, // new
  whatsapp: { type: String }, // new
  instagram: { type: String }, // new
  facebook: { type: String }, // new
});
const Job = mongoose.model('Job', jobSchema);

const notificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  type: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: String, required: true }
});
const Notification = mongoose.model('Notification', notificationSchema);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secure-secret-here';

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendVerificationEmail(email, name, token) {
  // Ensure we have a valid frontend URL, with fallback options
  let frontendUrl = FRONTEND_URL;
  if (!frontendUrl || frontendUrl === 'undefined') {
    console.warn('FRONTEND_URL environment variable not set, using fallback URL');
    frontendUrl = 'https://startup-bp55.onrender.com'; // Fallback to production URL
  }
  
  // Encode the token to make sure it's URL-safe
  const encodedToken = encodeURIComponent(token);
  const verifyUrl = `${frontendUrl}/verify-email?token=${encodedToken}`;
  
  console.log(`Sending verification email to ${email} with URL: ${verifyUrl}`);
  
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER || 'noreply@startupconnect.com',
      to: email,
      subject: 'Verify your email for StartUp Connect',
      html: `<p>Hello ${name},</p><p>Thank you for registering at StartUp Connect.</p><p>Please verify your email by clicking <a href="${verifyUrl}">here</a>.</p><p>If the link doesn't work, copy and paste this URL into your browser: ${verifyUrl}</p><p>This link will expire in 24 hours.</p>`
    });
    console.log(`Verification email sent successfully to ${email}`);
  } catch (error) {
    console.error(`Error sending verification email to ${email}:`, error);
    throw error;
  }
}

// Middleware to verify JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Add 'verified' field and code fields to user schema
userSchema.add({ 
  verified: { type: Boolean, default: false },
  verificationCode: String,
  verificationCodeExpires: Date
});

// Helper to generate 6-digit code
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send code by email
async function sendVerificationCode(email, name, code) {
  let frontendUrl = FRONTEND_URL;
  if (!frontendUrl || frontendUrl === 'undefined') {
    frontendUrl = 'https://startup-bp55.onrender.com';
  }
  await transporter.sendMail({
    from: process.env.SMTP_USER || 'noreply@startupconnect.com',
    to: email,
    subject: 'Your StartUp Connect Verification Code',
    html: `<p>Hello ${name},</p><p>Your verification code is: <b>${code}</b></p><p>This code is valid for 2 minutes.</p>`
  });
}

// Signup or resend code
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name } = req.body;
  let user = await User.findOne({ email });
  const now = new Date();
  let code, expires;
  if (user) {
    if (!user.verified) {
      // If code exists and not expired, reuse
      if (user.verificationCode && user.verificationCodeExpires && user.verificationCodeExpires > now) {
        code = user.verificationCode;
        expires = user.verificationCodeExpires;
      } else {
        code = generateCode();
        expires = new Date(now.getTime() + 2 * 60 * 1000);
        user.verificationCode = code;
        user.verificationCodeExpires = expires;
        await user.save();
      }
      await sendVerificationCode(email, user.name || name || 'User', code);
      return res.status(200).json({ success: true, message: 'Verification code sent. Please check your email.' });
    }
    return res.status(409).json({ success: false, message: 'Email already exists and is verified.' });
  }
  // New user
  code = generateCode();
  expires = new Date(now.getTime() + 2 * 60 * 1000);
  const role = email === 'volkonidovroman@gmail.com' ? 'admin' : 'user';
  user = new User({ email, password, name, verificationCode: code, verificationCodeExpires: expires, role });
  await user.save();
  await sendVerificationCode(email, name, code);
  res.json({ success: true, message: 'Verification code sent. Please check your email.' });
});

// Request verification code only (no user creation)
app.post('/api/auth/request-verification', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  if (user.verified) return res.json({ success: true, message: 'Email already verified.' });

  // Generate new verification code or reuse if not expired
  const now = new Date();
  let code, expires;
  if (user.verificationCode && user.verificationCodeExpires && user.verificationCodeExpires > now) {
    code = user.verificationCode;
    expires = user.verificationCodeExpires;
  } else {
    code = generateCode();
    expires = new Date(now.getTime() + 2 * 60 * 1000);
    user.verificationCode = code;
    user.verificationCodeExpires = expires;
    await user.save();
  }

  // Send code
  await sendVerificationCode(email, user.name, code);
  res.json({ success: true, message: 'Verification code sent. Please check your email.' });
});

// Verify code endpoint
app.post('/api/auth/verify-code', async (req, res) => {
  const { email, code } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  if (user.verified) return res.json({ success: true, message: 'Email already verified.' });
  if (!user.verificationCode || !user.verificationCodeExpires) {
    return res.status(400).json({ success: false, message: 'No verification code found. Please request a new code.' });
  }
  if (user.verificationCode !== code) {
    return res.status(400).json({ success: false, message: 'Invalid code.' });
  }
  if (user.verificationCodeExpires < new Date()) {
    return res.status(400).json({ success: false, message: 'Code expired. Please request a new code.' });
  }
  user.verified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;
  await user.save();
  res.json({ success: true, message: 'Email verified successfully.' });
});

// Get current user from JWT
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user) {
    res.json({ id: user._id, email: user.email, name: user.name, role: user.role });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// Example of a protected route
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// Jobs routes - REORGANIZED TO PREVENT ROUTE CONFLICTS
// 1. Get all jobs - specific route first
app.get('/api/jobs', async (req, res) => {
  const jobs = await Job.find();
  res.json(jobs);
});

// 2. Create a new job
app.post('/api/jobs', async (req, res) => {
  const { title, description, owner, amount, returnPercent, paybackTime, email, phone, whatsapp, instagram, facebook } = req.body;
  const newJob = new Job({
    title,
    description,
    owner,
    postedAt: new Date().toISOString().slice(0, 10),
    amount,
    returnPercent,
    paybackTime,
    email,
    phone,
    whatsapp,
    instagram,
    facebook,
  });
  await newJob.save();
  res.json({ success: true, job: newJob });
});

// 3. Get user's saved jobs - moved to user routes section to avoid conflicts
app.get('/api/user/saved-jobs', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const jobs = await Job.find({ savedBy: userId });
  res.json(jobs);
});

// 4. Get job by ID - parametric route last
app.get('/api/jobs/:id', async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (job) {
    res.json(job);
  } else {
    res.status(404).json({ message: 'Job not found' });
  }
});

// 5. Save/Unsave a job post for the current user
app.post('/api/jobs/:id/save', authenticateToken, async (req, res) => {
  const jobId = req.params.id;
  const userId = req.user.id;
  const job = await Job.findById(jobId);
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
  const alreadySaved = job.savedBy && job.savedBy.includes(userId);
  if (alreadySaved) {
    // Unsave
    job.savedBy = job.savedBy.filter(id => id.toString() !== userId);
  } else {
    // Save
    job.savedBy = [...(job.savedBy || []), userId];
  }
  await job.save();
  res.json({ success: true, saved: !alreadySaved, saveCount: job.savedBy.length });
});

// Notifications routes
app.get('/api/notifications', async (req, res) => {
  const notifications = await Notification.find();
  res.json(notifications);
});

app.post('/api/notifications', async (req, res) => {
  const { message, type, userId } = req.body;
  const newNotification = new Notification({ message, type, userId, date: new Date().toISOString().slice(0, 10) });
  await newNotification.save();
  res.json({ success: true, notification: newNotification });
});

// User routes
app.get('/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    res.json({ id: user._id, email: user.email, name: user.name });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

const UPLOADS_DIR = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(UPLOADS_DIR));
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, base + '-' + Date.now() + ext);
  }
});
const upload = multer({ storage });

// File upload endpoint for user profile picture
app.post('/api/upload/profile-picture', authenticateToken, upload.single('profilePicture'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  user.profilePicture = `/uploads/${req.file.filename}`;
  await user.save();
  res.json({ success: true, url: user.profilePicture });
});
// File upload endpoint for job image/video
app.post('/api/upload/job-media', authenticateToken, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), async (req, res) => {
  const files = req.files;
  const result = {};
  if (files && files.image && files.image[0]) result.image = `/uploads/${files.image[0].filename}`;
  if (files && files.video && files.video[0]) result.video = `/uploads/${files.video[0].filename}`;
  res.json({ success: true, ...result });
});
// Delete job media endpoint
app.delete('/api/upload/job-media', authenticateToken, async (req, res) => {
  const file = req.query.file;
  if (!file) return res.status(400).json({ success: false, message: 'No file specified' });
  const filePath = path.join(UPLOADS_DIR, path.basename(file));
  try {
    require('fs').unlinkSync(filePath);
    res.json({ success: true, message: 'File deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete file' });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
