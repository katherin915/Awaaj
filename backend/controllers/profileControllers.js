const User = require('../models/userModel.js');
const xss = require('xss');
const { asyncHandler } = require('../utils/asyncHandler.js');
const { uploadOnCloudinary } = require('../utils/cloudinary.js');

// Get current user profile
const getUserProfile = asyncHandler(async (req, res) => {
  try {
    if (!req.user) {
      console.log('getUserProfile: No req.user found');
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    console.log('getUserProfile: Fetching user with ID:', req.user._id);
    const user = await User.findById(req.user._id);
    
    if (!user) {
      console.log('getUserProfile: User not found in database');
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('getUserProfile: User found:', user.email);
    
    // Calculate profile completeness
    let isComplete = false;
    try {
      isComplete = user.isProfileComplete ? user.isProfileComplete() : (user.name && user.email && user.location);
    } catch (e) {
      console.warn('Error calling isProfileComplete:', e);
      isComplete = !!(user.name && user.email && user.location);
    }

    const response = {
      id: user._id,
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'user',
      location: user.location || '',
      phone: user.phone || '',
      profilePictureUrl: user.profilePictureUrl || null,
      isProfileComplete: isComplete
    };

    console.log('getUserProfile: Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('getUserProfile: Error occurred:', error);
    res.status(500).json({ error: 'Server error while fetching profile', details: error.message });
  }
});

// Update user profile
const updateUserProfile = asyncHandler(async (req, res) => {
  const { name, email, location, profilePictureUrl } = req.body;

  // Validate required fields
  if (!name || !email || !location) {
    return res.status(400).json({ 
      error: 'Name, email, and location are required' 
    });
  }

  // Sanitize inputs
  const sanitizedName = xss(name);
  const sanitizedEmail = xss(email);
  const sanitizedLocation = xss(location);

  // Check if email is already taken by another user
  const existingUser = await User.findOne({ 
    email: sanitizedEmail, 
    _id: { $ne: req.user._id } 
  });
  
  if (existingUser) {
    return res.status(409).json({ error: 'Email already taken by another user' });
  }

  // Find and update user
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { 
      name: sanitizedName, 
      email: sanitizedEmail, 
      location: sanitizedLocation,
      ...(profilePictureUrl ? { profilePictureUrl: xss(profilePictureUrl) } : {})
    },
    { new: true, runValidators: true }
  );

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    location: user.location,
    profilePictureUrl: user.profilePictureUrl || null,
    isProfileComplete: user.isProfileComplete(),
    message: 'Profile updated successfully'
  });
});

module.exports = {
  getUserProfile,
  updateUserProfile,
  // Upload and set user's profile picture
  uploadProfilePicture: asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const localFilePath = req.file.path;
    const cloudinaryResponse = await uploadOnCloudinary(localFilePath);

    if (!cloudinaryResponse) {
      return res.status(500).json({ error: 'Failed to upload image' });
    }

    const imageUrl = cloudinaryResponse.secure_url;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePictureUrl: imageUrl },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ profilePictureUrl: imageUrl });
  })
};
