const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, default: null },
  username: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['citizen', 'officer', 'admin', 'user'], // 'user' kept for backward compatibility
    default: 'citizen' 
  },
  location: { type: String, default: null },
  profilePictureUrl: { type: String, default: null },
  clerkUserId: { type: String, unique: true, sparse: true }, // For Clerk integration
  
  // Gamification
  points: { type: Number, default: 0 },
  badges: [{ type: String }], // e.g., 'Cleanliness Champ', 'Road Warrior'
  rank: { type: Number, default: 0 },

  // Officer specific
  assignedZone: { type: String, default: null },
  department: { type: String, default: null },

}, { timestamps: true });

// Method to check if profile is complete
userSchema.methods.isProfileComplete = function() {
  return this.name && this.email && this.location;
};

// Static method to find user by Clerk ID
userSchema.statics.findByClerkId = function(clerkUserId) {
  return this.findOne({ clerkUserId });
};

module.exports = mongoose.model('User', userSchema);



