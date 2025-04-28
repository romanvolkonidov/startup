require('dotenv').config();

const mongoose = require('mongoose');

// Get email from command line arguments
const email = process.argv[2];
if (!email) {
  console.error('Please provide an email address as an argument.');
  console.error('Example: node deleteUser.js user@example.com');
  process.exit(1);
}

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI;

// User schema (must match your actual schema)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  verified: { type: Boolean, default: false },
});

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  // Define User model
  const User = mongoose.model('User', userSchema);
  
  try {
    // Find and delete user by email
    const normalizedEmail = email.trim().toLowerCase();
    const result = await User.deleteOne({ email: normalizedEmail });
    
    if (result.deletedCount > 0) {
      console.log(`✅ Successfully deleted user with email: ${normalizedEmail}`);
    } else {
      console.log(`❌ No user found with email: ${normalizedEmail}`);
    }
  } catch (error) {
    console.error('Error deleting user:', error);
  }
  
  // Close connection
  await mongoose.connection.close();
  console.log('Disconnected from MongoDB');
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});