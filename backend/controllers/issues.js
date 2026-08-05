const Issue = require('../models/issues');
const sendEmail = require('../utils/sendEmail');
const { asyncHandler } = require('../utils/asyncHandler'); 
const { uploadOnCloudinary } = require("../utils/cloudinary.js");
const mongoose = require('mongoose');

const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const createIssue = asyncHandler(async (req, res) => {
  let { title, description, phone, email, notifyByEmail, location } = req.body;

  // Allow missing title/description if file is present
  if ((!title || !description) && !req.file) {
    return res.status(400).json({ error: "Title and description are required unless an image is uploaded." });
  }
  
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  // Use defaults if missing but file exists
  if (!title && req.file) title = "Image Report";
  if (!description && req.file) description = "Issue reported via image upload.";

  let fileUrl = null;

  if (req.file) {
    try {
      const localFilePath = req.file?.path;
      const cloudinaryResponse = await uploadOnCloudinary(localFilePath);
      console.log('Cloudinary response:', cloudinaryResponse);

      if (cloudinaryResponse && cloudinaryResponse.secure_url) {
        fileUrl = cloudinaryResponse.secure_url;
      } else {
        console.warn('Cloudinary upload failed, saving file path locally');
        // Save local path if Cloudinary fails
        fileUrl = `/uploads/${req.file.filename}`;
      }
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      // Continue without image if upload fails
      fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
    }
  }

  // Handle location
  let locationData = { type: 'Point', coordinates: [0, 0] };
  
  if (location) {
    if (typeof location === 'string') {
      // Check if it looks like coordinates "lat, lon"
      const coords = location.split(',').map(n => parseFloat(n.trim()));
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        // GeoJSON expects [longitude, latitude]
        locationData = {
          type: 'Point',
          coordinates: [coords[1], coords[0]], // Swap for GeoJSON
          address: location // Store original string as address too just in case
        };
      } else {
        // Treat as address string
        locationData = {
          type: 'Point',
          coordinates: [0, 0],
          address: location
        };
      }
    } else if (typeof location === 'object') {
      locationData = location;
    }
  }

  // Build issue object with AI analysis
  const issueData = {
    title,
    description,
    phone,
    email,
    notifyByEmail: notifyByEmail === 'true',
    fileUrl,
    location: locationData,
  };

  // Attach authenticated user info for ownership queries.
  if (req.user?.id) {
    issueData.userId = req.user.id;
  }

  // Add AI classification if available
  if (req.aiClassification) {
    issueData.category = req.aiClassification.category;
    issueData.categoryConfidence = req.aiClassification.confidence;
    issueData.categoryScores = req.aiClassification.allCategories;
  } else {
    issueData.category = 'Others'; // Default category
    issueData.categoryConfidence = 0;
  }

  // Add AI embeddings if available
  if (req.aiEmbedding) {
    issueData.embeddings = req.aiEmbedding.vector;
  }

  // Add AI priority if available
  if (req.aiPriority) {
    issueData.priorityScore = req.aiPriority.priorityScore;
    issueData.priority = req.aiPriority.priorityLevel;
    issueData.priorityFactors = req.aiPriority.factors;
    issueData.priorityReasoning = req.aiPriority.reasoning;
    
    // Calculate SLA deadline
    const slaHours = req.aiPriority.slaDeadlineHours || 24;
    const slaDeadline = new Date();
    slaDeadline.setHours(slaDeadline.getHours() + slaHours);
    issueData.slaDeadline = slaDeadline;
    issueData.slaStatus = 'On-Track';
  }

  const issue = await Issue.create(issueData);

  // Send confirmation email
  if (notifyByEmail === 'true' && email) {
    const categoryText = issue.category || 'Other';
    const priorityText = issue.priority || 'Normal';
    
    await sendEmail(
      email,
      'Awaaz - Issue Submitted Successfully',
      `<h3>Your Issue Has Been Received</h3>
       <p><strong>Issue ID:</strong> ${issue._id}</p>
       <p><strong>Title:</strong> ${title}</p>
       <p><strong>Category:</strong> ${categoryText}</p>
       <p><strong>Priority:</strong> ${priorityText}</p>
       <p>Thank you for reporting this issue. We will analyze it and take appropriate action.</p>`
    );
  }

  return res.status(201).json({ 
    message: 'Issue submitted successfully', 
    issue,
    aiAnalysis: {
      category: issueData.category,
      categoryConfidence: issueData.categoryConfidence,
      priorityLevel: issueData.priority,
      priorityScore: issueData.priorityScore,
    }
  });
});

const getAllIssues = asyncHandler(async (req, res) => {
  const { status, category, priority, search, sort = 'newest' } = req.query;
  const { page, limit, skip } = parsePagination(req.query);

  const filter = {};

  if (status && status !== 'all') {
    filter.status = status;
  }

  if (category && category !== 'all') {
    filter.category = category;
  }

  if (priority && priority !== 'all') {
    filter.priority = priority;
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    priority: { priorityScore: -1, createdAt: -1 },
  };

  const sortQuery = sortMap[sort] || sortMap.newest;

  const [issues, total] = await Promise.all([
    Issue.find(filter).sort(sortQuery).skip(skip).limit(limit),
    Issue.countDocuments(filter),
  ]);

  return res.json({
    data: issues,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: skip + issues.length < total,
      hasPrevPage: page > 1,
    },
  });
});

const getMyIssues = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { status } = req.query;

  const userEmail = req.user?.email;
  if (!userEmail) {
    return res.status(401).json({ error: 'User email is missing in token payload' });
  }

  const filter = { email: userEmail };
  if (status && status !== 'all') {
    filter.status = status;
  }

  const [issues, total] = await Promise.all([
    Issue.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Issue.countDocuments(filter),
  ]);

  return res.json({
    data: issues,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: skip + issues.length < total,
      hasPrevPage: page > 1,
    },
  });
});

const updateIssueStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { newStatus } = req.body;

  const issue = await Issue.findById(id);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });

  issue.status = newStatus;
  await issue.save();

  if (issue.notifyByEmail && issue.email) {
    await sendEmail(
      issue.email,
      'Awaaz - Issue Status Update',
      `<p>Your issue <strong>${issue.title}</strong> is now <strong>${newStatus}</strong>.</p>`
    );
  }

  return res.json({ message: 'Status updated successfully.' });
});

const getIssueById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Optional: Validate MongoDB ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid issue ID format' });
  }

  const issue = await Issue.findById(id);

  if (!issue) {
    return res.status(404).json({ error: 'Issue not found' });
  }

  return res.json(issue);
});

const deleteIssue = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate MongoDB ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid issue ID format" });
  }

  const issue = await Issue.findByIdAndDelete(id);

  if (!issue) {
    return res.status(404).json({ error: "Issue not found" });
  }

  return res.json({ message: "Issue deleted successfully", issue });
});

const updateIssue = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid issue ID format" });
  }

  const { title, description, phone, email, notifyByEmail } = req.body;

  let fileUrl;
  if (req.file) {
    const localFilePath = req.file?.path;
    const cloudinaryResponse = await uploadOnCloudinary(localFilePath);

    if (cloudinaryResponse) {
      fileUrl = cloudinaryResponse.secure_url;
    } else {
      return res.status(500).json({ error: "Failed to upload file to Cloudinary" });
    }
  }

  const updatedIssue = await Issue.findByIdAndUpdate(
    id,
    {
      ...(title && { title }),
      ...(description && { description }),
      ...(phone && { phone }),
      ...(email && { email }),
      ...(notifyByEmail !== undefined && { notifyByEmail: notifyByEmail === 'true' }),
      ...(fileUrl && { fileUrl })
    },
    { new: true }
  );

  if (!updatedIssue) {
    return res.status(404).json({ error: "Issue not found" });
  }

  // 🔔 Send email if notifyByEmail is true and email exists
  if (updatedIssue.notifyByEmail && updatedIssue.email) {
    await sendEmail(
      updatedIssue.email,
      "Awaaz - Issue Updated",
      `<p>Your issue <strong>${updatedIssue.title}</strong> has been updated successfully.</p>
       <p>You can check the latest details in the system.</p>`
    );
  }

  return res.json({ message: "Issue updated successfully", issue: updatedIssue });
});

module.exports = {
  createIssue,
  getAllIssues,
  getMyIssues,
  updateIssueStatus,
  getIssueById,
  deleteIssue,
  updateIssue,
};
