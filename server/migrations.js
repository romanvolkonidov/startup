// Database migration script to update existing MongoDB records
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB Atlas connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://romanvolkonidov:KXf39eGbFYVFEKL6@startup.8oukgfu.mongodb.net/startup?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected for migration'))
.catch(err => console.error('MongoDB connection error:', err));

// Define schemas matching the ones in index.js
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  verified: { type: Boolean, default: false },
  bio: { type: String, default: '' },
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  website: { type: String, default: '' },
  profilePicture: { type: String, default: '' },
  joined: { type: String, default: function() { return new Date().toISOString().slice(0, 10); } }
});
const User = mongoose.model('User', userSchema);

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Now optional for migration
  owner: { type: String, required: true },
  postedAt: { type: String, required: true },
  amount: { type: Number, required: true },
  returnPercent: { type: Number, required: true },
  paybackTime: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  whatsapp: { type: String },
  instagram: { type: String },
  facebook: { type: String },
  image: { type: String },
  video: { type: String },
  savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});
const Job = mongoose.model('Job', jobSchema);

// Migration functions
async function migrateUsers() {
  try {
    console.log('Starting user migration...');
    const users = await User.find({});
    let updatedCount = 0;

    for (const user of users) {
      // Add missing profile fields if they don't exist
      const updates = {};
      
      // Check if password needs to be hashed
      if (user.password && user.password.length < 60 && !user.password.startsWith('$2')) {
        console.log(`Hashing password for user: ${user.email}`);
        updates.password = await bcrypt.hash(user.password, 10);
      }
      
      // Add default values for missing fields
      if (!user.bio) updates.bio = '';
      if (!user.phone) updates.phone = '';
      if (!user.location) updates.location = '';
      if (!user.website) updates.website = '';
      if (!user.profilePicture) updates.profilePicture = '';
      if (!user.joined) updates.joined = new Date().toISOString().slice(0, 10);
      
      // Update user if there are changes
      if (Object.keys(updates).length > 0) {
        await User.updateOne({ _id: user._id }, { $set: updates });
        updatedCount++;
      }
    }
    
    console.log(`User migration completed. Updated ${updatedCount} users.`);
    return users;
  } catch (error) {
    console.error('Error migrating users:', error);
    throw error;
  }
}

async function migrateJobs(users) {
  try {
    console.log('Starting job migration...');
    const jobs = await Job.find({});
    let updatedCount = 0;
    let skippedCount = 0;
    
    // Find the first admin user to use as default owner for orphaned jobs
    let defaultAdmin = users.find(u => u.role === 'admin');
    if (!defaultAdmin) {
      defaultAdmin = users[0]; // Fallback to first user if no admin found
    }
    
    for (const job of jobs) {
      const updates = {};
      
      // Handle ownerId field
      if (!job.ownerId) {
        // Try to find a user with matching email
        const matchingUser = users.find(u => u.email === job.email);
        
        if (matchingUser) {
          updates.ownerId = matchingUser._id;
          console.log(`Assigning job "${job.title}" to owner: ${matchingUser.email}`);
        } else {
          // If no matching user found, assign to default admin
          updates.ownerId = defaultAdmin._id;
          console.log(`No matching user found for job "${job.title}". Assigning to default admin.`);
        }
      }
      
      // Initialize savedBy as empty array if it doesn't exist
      if (!job.savedBy) {
        updates.savedBy = [];
      }
      
      // Update job if there are changes
      if (Object.keys(updates).length > 0) {
        await Job.updateOne({ _id: job._id }, { $set: updates });
        updatedCount++;
      } else {
        skippedCount++;
      }
    }
    
    console.log(`Job migration completed. Updated ${updatedCount} jobs, skipped ${skippedCount} jobs.`);
  } catch (error) {
    console.error('Error migrating jobs:', error);
    throw error;
  }
}

// Main migration function
async function runMigration() {
  try {
    console.log('Starting database migration...');
    const users = await migrateUsers();
    await migrateJobs(users);
    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration();