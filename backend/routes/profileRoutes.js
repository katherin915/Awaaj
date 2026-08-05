const express = require('express');
const router = express.Router();
const { 
  getUserProfile, 
  updateUserProfile, 
  uploadProfilePicture
} = require('../controllers/profileControllers.js');
const upload = require('../middlewares/upload');
const { protect } = require('../middlewares/authMiddleware');

// Get current user profile
router.get('/me', protect, getUserProfile);

// Update user profile
router.put('/me', protect, updateUserProfile);

// Upload optional profile picture
router.post('/me/profile-picture', protect, upload.single('image'), uploadProfilePicture);

module.exports = router;
