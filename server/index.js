// Basic Express server setup for StartUp Connect API
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const admin = require('firebase-admin');
const app = express();
const PORT = process.env.PORT || 5000;

// Firebase Admin SDK Initialization
try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Firebase Admin SDK initialization error:', error);
}

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Updated CORS configuration to properly handle cross-origin requests
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    const allowedOrigins = [
      'https://startup-bp55.onrender.com',
      'https://startup-lthu.vercel.app'
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
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://romanvolkonidov:KXf39eGbFYVFEKL6@startup.8oukgfu.mongodb.net/?retryWrites=true&w=majority&appName=StartUp';

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
  verificationCodeExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

// Helper to generate 6-digit code
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Signup or resend coe
app.post('/api/auth/signup', async (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  const password = req.body.password;
  const name = req.body.name;
  let user = await User.findOne({ email });
  if (user) {
    return res.status(409).json({ success: false, message: 'Email already exists.' });
  }
  const role = email === 'volkonidovroman@gmail.com' ? 'admin' : 'user';
  user = new User({ email, password, name, verified: true, role });
  await user.save();
  res.json({ success: true, message: 'Account created and verified.' });
});

// Request verification code only (no user creation)
app.post('/api/auth/request-verification', async (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  if (user.verified) return res.json({ success: true, message: 'Email already verified.' });

  const now = new Date();
  let code, expires;
  if (user.verificationCode && user.verificationCodeExpires && user.verificationCodeExpires > now) {
    code = null; // Always generate a new code for security
  } else {
    code = generateCode();
    expires = new Date(now.getTime() + 2 * 60 * 1000);
    user.verificationCode = await bcrypt.hash(code, 10);
    user.verificationCodeExpires = expires;
    await user.save();
  }
  if (!code) code = generateCode(); // fallback
  await sendVerificationCode(email, user.name, code);
  res.json({ success: true, message: 'Verification code sent. Please check your email.' });
});

// Verify code endpoint
app.post('/api/auth/verify-code', async (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  const code = req.body.code;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  if (user.verified) return res.json({ success: true, message: 'Email already verified.' });
  if (!user.verificationCode || !user.verificationCodeExpires) {
    return res.status(400).json({ success: false, message: 'No verification code found. Please request a new code.' });
  }
  if (user.verificationCodeExpires < new Date()) {
    return res.status(400).json({ success: false, message: 'Code expired. Please request a new code.' });
  }
  const isMatch = await bcrypt.compare(code, user.verificationCode);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Invalid code.' });
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

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }
  // Check if user is verified (if you want to enforce email verification)
  if (user.verified === false) {
    return res.status(403).json({ success: false, message: 'Please verify your email before logging in.' });
  }
  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }
  // Generate JWT
  const token = jwt.sign({ id: user._id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
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

// 2. Create a new job (authenticated only)
app.post('/api/jobs', authenticateToken, async (req, res) => {
  const { title, description, owner, amount, returnPercent, paybackTime, email, phone, whatsapp, instagram, facebook, image, video } = req.body;
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
    image,
    video
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

// Get job contact info (protected)
app.get('/api/jobs/:id/contacts', authenticateToken, async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }
  // Only return contact fields
  res.json({
    email: job.email,
    phone: job.phone,
    whatsapp: job.whatsapp,
    instagram: job.instagram,
    facebook: job.facebook,
  });
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

// Forgot password endpoint
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    // For security, always respond with success
    return res.json({ success: true, message: 'If this email exists, a reset link will be sent.' });
  }
  // Generate reset token and expiration
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpires = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = resetTokenExpires;
  await user.save();
  // Send reset email
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(normalizedEmail)}`;
  await transporter.sendMail({
    from: process.env.SMTP_USER || 'noreply@startupconnect.com',
    to: normalizedEmail,
    subject: 'Reset your password for StartUp Connect',
    html: `<p>Hello,</p><p>You requested a password reset. Click <a href="${resetUrl}">here</a> to reset your password. This link is valid for 15 minutes.</p>`
  });
  res.json({ success: true, message: 'If this email exists, a reset link will be sent.' });
});

// Reset password endpoint
app.post('/api/auth/reset-password', async (req, res) => {
  const { email, token, newPassword } = req.body;
  const normalizedEmail = email.trim().toLowerCase();
  const decodedToken = decodeURIComponent(token);
  console.log('Reset password request:', { normalizedEmail, token, decodedToken });

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    console.log('No user found for email:', normalizedEmail);
    return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
  }
  // Log the user's reset token and expiration for debugging
  console.log('User from DB:', {
    resetPasswordToken: user.resetPasswordToken,
    resetPasswordExpires: user.resetPasswordExpires,
    now: new Date()
  });
  if (!user.resetPasswordToken || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
    console.log('No valid reset token or token expired for user:', normalizedEmail);
    return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
  }
  if (user.resetPasswordToken !== decodedToken) {
    console.log('Token mismatch:', { expected: user.resetPasswordToken, received: decodedToken });
    return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
  }
  // Hash the new password before saving
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  res.json({ success: true, message: 'Password has been reset. You can now log in.' });
});

// Firebase authentication endpoint
app.post('/api/auth/firebase-login', async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'No ID token provided' });
    }
    
    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name: firebaseName, picture } = decodedToken;
    
    console.log('Firebase login attempt:', { uid, email });
    
    // Try to find user by email
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user if not found
      const displayName = firebaseName || email.split('@')[0];
      // Generate a random password since they'll be using Firebase auth
      const randomPassword = crypto.randomBytes(20).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      // Set special role for admin email
      const role = email === 'volkonidovroman@gmail.com' ? 'admin' : 'user';
      
      user = new User({
        email,
        password: hashedPassword,
        name: displayName,
        verified: true, // Firebase handles email verification
        role
      });
      
      await user.save();
      console.log('New user created from Firebase auth:', email);
    }
    
    // Generate JWT token for your app
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Firebase authentication error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid authentication token'
    });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
