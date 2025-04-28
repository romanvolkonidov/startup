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

const FRONTEND_URL = process.env.FRONTEND_URL;

app.use(cors({
  origin: true, // Reflects the request origin
  credentials: true,
}));
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
  // Use FRONTEND_URL from environment variables
  const verifyUrl = `${FRONTEND_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Verify your email for StartUp Connect',
    html: `<p>Hello ${name},</p><p>Thank you for registering at StartUp Connect.</p><p>Please verify your email by clicking <a href="${verifyUrl}">here</a>.</p>`
  });
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

// Add 'verified' field to user schema
userSchema.add({ verified: { type: Boolean, default: false }, verificationToken: String });
// Update user schema for profile picture
userSchema.add({ profilePicture: { type: String } });
// Update job schema for image and video
jobSchema.add({ image: { type: String }, video: { type: String } });
// Add savedBy field for saved posts
jobSchema.add({ savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] });

// File upload setup
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

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (user) {
    if (!user.verified) {
      return res.status(403).json({ success: false, message: 'Please verify your email before logging in.' });
    }
    // Include role in JWT and response
    const token = jwt.sign({ id: user._id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name } = req.body;
  if (await User.findOne({ email })) {
    return res.status(409).json({ success: false, message: 'Email already exists' });
  }
  const verificationToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1d' });
  // Assign admin role if email matches
  const role = email === 'volkonidovroman@gmail.com' ? 'admin' : 'user';
  const newUser = new User({ email, password, name, verificationToken, role });
  await newUser.save();
  await sendVerificationEmail(email, name, verificationToken);
  res.json({ success: true, message: 'Verification email sent. Please check your inbox.' });
});

// Email verification endpoint
app.get('/api/auth/verify-email', async (req, res) => {
  const { token } = req.query;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ email: decoded.email, verificationToken: token });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
    user.verified = true;
    user.verificationToken = undefined;
    await user.save();
    res.json({ success: true, message: 'Email verified successfully.' });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid or expired token.' });
  }
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

// Jobs routes
app.get('/api/jobs', async (req, res) => {
  const jobs = await Job.find();
  res.json(jobs);
});

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

app.get('/api/jobs/:id', async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (job) {
    res.json(job);
  } else {
    res.status(404).json({ message: 'Job not found' });
  }
});

// Save/Unsave a job post for the current user
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

// Get all jobs saved by the current user
app.get('/api/jobs/saved', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const jobs = await Job.find({ savedBy: userId });
  res.json(jobs);
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
