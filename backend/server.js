// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch'); // Ensure node-fetch is installed

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Reverse geocoding proxy endpoint
app.get('/api/reverse-geocode', async (req, res) => {
  const { lat, lon } = req.query;
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Reverse geocoding failed', details: err.message });
  }
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|mp4|mov|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/cityview360', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Squad Schema
const squadSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true }, // e.g., 'alpha', 'beta', 'gamma'
  description: String,
  assignedRegions: [{
    city: String,
    state: String,
    coordinates: {
      center: { lat: Number, lng: Number },
      bounds: {
        north: Number,
        south: Number,
        east: Number,
        west: Number
      }
    }
  }],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['citizen', 'official', 'supervisor', 'admin'], default: 'citizen' },
  phone: { type: String },
  address: { type: String },
  department: { type: String }, // For officials
  squad: { type: mongoose.Schema.Types.ObjectId, ref: 'Squad' }, // For officials
  assignedRegions: [String], // For officials - cities they handle
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Notification Schema
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['status_update', 'escalation', 'comment', 'system', 'reminder', 'resolution'],
    default: 'system' 
  },
  read: { type: Boolean, default: false },
  relatedComplaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' },
  actionUrl: String,
  createdAt: { type: Date, default: Date.now }
});

// Community Discussion Schema
const discussionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { 
    type: String, 
    enum: ['infrastructure', 'community', 'traffic', 'safety', 'general'],
    default: 'general' 
  },
  tags: [String],
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Community Event Schema
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['government', 'community', 'safety', 'education', 'other'],
    default: 'community' 
  },
  maxAttendees: { type: Number, default: 100 },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

// Complaint Schema
const complaintSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['sanitation', 'roads', 'water', 'electricity', 'parks', 'traffic', 'other'],
    required: true 
  },
  severity: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'in_progress', 'resolved', 'closed'],
    default: 'pending' 
  },
  progress: { 
    type: Number, 
    min: 0, 
    max: 100, 
    default: 0 
  },
  citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedSquad: { type: mongoose.Schema.Types.ObjectId, ref: 'Squad' },
  location: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    path: String
  }],
  resolutionMedia: [{
    filename: String,
    originalName: String,
    mimetype: String,
    path: String
  }],
  proofFiles: [{
    filename: String,
    originalName: String,
    mimetype: String,
    path: String
  }],
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  timeline: [{
    action: String,
    timestamp: { type: Date, default: Date.now },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comment: String
  }],
  aiSuggestions: {
    category: String,
    tags: [String],
    confidence: Number
  },
  escalationStatus: {
    level: { type: String, enum: ['green', 'yellow', 'red'], default: 'green' },
    escalatedAt: Date,
    notificationsSent: [String]
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Models
const Squad = mongoose.model('Squad', squadSchema);
const User = mongoose.model('User', userSchema);
const Complaint = mongoose.model('Complaint', complaintSchema);
const Notification = mongoose.model('Notification', notificationSchema);
const Discussion = mongoose.model('Discussion', discussionSchema);
const Event = mongoose.model('Event', eventSchema);

// Escalation Settings Schema
const escalationSettingsSchema = new mongoose.Schema({
  yellowThresholdDays: { type: Number, default: 45 },
  redThresholdDays: { type: Number, default: 60 },
  notifySMS: { type: Boolean, default: false },
  notifyEmail: { type: Boolean, default: true },
  autoEscalateTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now }
});
const EscalationSettings = mongoose.model('EscalationSettings', escalationSettingsSchema);

// System Configuration Schema
const systemConfigSchema = new mongoose.Schema({
  categories: [{ type: String }],
  severityLevels: [{ type: String }],
  languages: [{ code: String, name: String, active: Boolean }],
  defaultLanguage: { type: String, default: 'en' },
  updatedAt: { type: Date, default: Date.now }
});
const SystemConfig = mongoose.model('SystemConfig', systemConfigSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Authorization middleware
const authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// AI Category Suggestion (Mock implementation)
const suggestCategory = (title, description) => {
  const keywords = {
    sanitation: ['garbage', 'waste', 'trash', 'dump', 'clean', 'dirty'],
    roads: ['road', 'street', 'pothole', 'repair', 'construction', 'traffic'],
    water: ['water', 'leak', 'pipe', 'supply', 'drainage', 'flood'],
    electricity: ['power', 'electricity', 'light', 'outage', 'pole', 'wire'],
    parks: ['park', 'garden', 'playground', 'maintenance', 'tree'],
    traffic: ['traffic', 'signal', 'parking', 'congestion', 'vehicle']
  };

  const text = (title + ' ' + description).toLowerCase();
  let bestMatch = 'other';
  let highestScore = 0;

  for (const [category, words] of Object.entries(keywords)) {
    const score = words.reduce((acc, word) => {
      return acc + (text.includes(word) ? 1 : 0);
    }, 0);

    if (score > highestScore) {
      highestScore = score;
      bestMatch = category;
    }
  }

  return {
    category: bestMatch,
    tags: keywords[bestMatch] || [],
    confidence: Math.min(highestScore * 0.2, 1)
  };
};

// Function to determine squad based on location
const determineSquad = async (location) => {
  try {
    if (!location || !location.coordinates) {
      return null;
    }

    const { lat, lng } = location.coordinates;
    
    // Get all active squads
    const squads = await Squad.find({ isActive: true }).populate('members');
    
    for (const squad of squads) {
      for (const region of squad.assignedRegions) {
        const bounds = region.coordinates.bounds;
        
        // Check if coordinates fall within the squad's assigned region
        if (lat >= bounds.south && lat <= bounds.north && 
            lng >= bounds.west && lng <= bounds.east) {
          return squad;
        }
      }
    }
    
    return null; // No squad assigned for this location
  } catch (error) {
    console.error('Error determining squad:', error);
    return null;
  }
};

// Escalation check function
const checkEscalation = (complaint) => {
  const now = new Date();
  const createdAt = new Date(complaint.createdAt);
  const daysDiff = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

  let escalationLevel = 'green';
  if (daysDiff >= 60) {
    escalationLevel = 'red';
  } else if (daysDiff >= 45) {
    escalationLevel = 'yellow';
  }

  return escalationLevel;
};

// ROUTES

// Authentication Routes
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, address, department } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'citizen',
      phone,
      address,
      department
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Find user and populate squad
    const user = await User.findOne({ email }).populate('squad', 'name code assignedRegions');
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    // Generate token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        squad: user.squad?._id,
        assignedRegions: user.assignedRegions
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        squad: user.squad,
        assignedRegions: user.assignedRegions,
        department: user.department
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Complaint Routes
app.post('/api/complaints', authenticateToken, upload.array('attachments', 5), async (req, res) => {
  try {
    const { title, description, category, severity, location } = req.body;
    
    // AI category suggestion
    const aiSuggestion = suggestCategory(title, description);
    
    // Process attachments
    const attachments = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      path: file.path
    })) : [];

    // Parse location if provided
    let parsedLocation = null;
    if (location) {
      try {
        parsedLocation = JSON.parse(location);
      } catch (e) {
        parsedLocation = { address: location };
      }
    }

    // Determine squad based on city in address
    let assignedSquad = null;
    if (parsedLocation && parsedLocation.address) {
      const address = parsedLocation.address.toLowerCase();
      if (address.includes('chennai')) {
        assignedSquad = await Squad.findOne({ code: 'alpha' });
      } else if (address.includes('mumbai')) {
        assignedSquad = await Squad.findOne({ code: 'beta' });
      }
    }

    const complaint = new Complaint({
      title,
      description,
      category: category || aiSuggestion.category,
      severity: severity || 'medium',
      citizenId: req.user.userId,
      location: parsedLocation,
      assignedSquad: assignedSquad ? assignedSquad._id : null,
      attachments,
      aiSuggestions: aiSuggestion,
      timeline: [{
        action: 'Complaint submitted',
        performedBy: req.user.userId,
        comment: 'Initial complaint submission'
      }]
    });

    await complaint.save();

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint: complaint,
      aiSuggestion
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/complaints', authenticateToken, async (req, res) => {
  try {
    const { status, category, severity, assignedTo, page = 1, limit = 10 } = req.query;
    let query = {};
    if (req.user.role === 'citizen') {
      query.citizenId = req.user.userId;
    } else if (req.user.role === 'official') {
      // Show complaints from their assigned squad OR directly assigned to them
      const user = await User.findById(req.user.userId).populate('squad');
      if (user.squad) {
        query.$or = [
          { assignedTo: req.user.userId },
          { assignedSquad: user.squad._id }
        ];
      } else {
        query.assignedTo = req.user.userId;
      }
    } else if (req.user.role === 'supervisor') {
      const user = await User.findById(req.user.userId).populate('squad');
      if (user.squad) {
        query.assignedSquad = user.squad._id;
      }
    }
    // Apply filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (severity) query.severity = severity;
    if (assignedTo && req.user.role === 'admin') query.assignedTo = assignedTo;
    const complaints = await Complaint.find(query)
      .populate('citizenId', 'name email')
      .populate('assignedTo', 'name email')
      .populate('assignedSquad', 'name code')
      .populate('timeline.performedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Update escalation status
    for (let complaint of complaints) {
      const escalationLevel = checkEscalation(complaint);
      if (complaint.escalationStatus.level !== escalationLevel) {
        complaint.escalationStatus.level = escalationLevel;
        if (escalationLevel !== 'green') {
          complaint.escalationStatus.escalatedAt = new Date();
        }
        await complaint.save();
      }
    }

    const total = await Complaint.countDocuments(query);

    res.json({
      complaints,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/complaints/:id', authenticateToken, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('citizenId', 'name email phone')
      .populate('assignedTo', 'name email')
      .populate('timeline.performedBy', 'name');

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    // Check authorization
    if (req.user.role === 'citizen' && complaint.citizenId._id.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/complaints/:id', authenticateToken, upload.array('resolutionMedia', 5), async (req, res) => {
  try {
    const { status, comment, assignedTo } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    // Check authorization
    if (req.user.role === 'citizen' && complaint.citizenId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update fields
    if (status) complaint.status = status;
    if (assignedTo && req.user.role === 'admin') complaint.assignedTo = assignedTo;

    // Add resolution media
    if (req.files && req.files.length > 0) {
      const resolutionMedia = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        path: file.path
      }));
      complaint.resolutionMedia.push(...resolutionMedia);
    }

    // Add timeline entry
    complaint.timeline.push({
      action: status ? `Status changed to ${status}` : 'Complaint updated',
      performedBy: req.user.userId,
      comment
    });

    complaint.updatedAt = new Date();
    await complaint.save();

    res.json({
      message: 'Complaint updated successfully',
      complaint
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/complaints/:id/upvote', authenticateToken, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const userId = req.user.userId;
    const hasUpvoted = complaint.upvotes.includes(userId);

    if (hasUpvoted) {
      complaint.upvotes.pull(userId);
    } else {
      complaint.upvotes.push(userId);
    }

    await complaint.save();

    res.json({
      message: hasUpvoted ? 'Upvote removed' : 'Upvote added',
      upvotes: complaint.upvotes.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Progress Update Route
app.put('/api/complaints/:id/progress', authenticateToken, upload.array('proofFiles', 5), async (req, res) => {
  // Top-level debug log
  console.log("Progress update route hit", req.method, req.url, req.body, req.files);
  try {
    const { progress, notes } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    // Check authorization - only assigned official, any official in assigned squad, or admin can update progress
    if (req.user.role === 'citizen') {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (req.user.role === 'official') {
      const user = await User.findById(req.user.userId);
      if (
        complaint.assignedTo?.toString() !== req.user.userId &&
        (!complaint.assignedSquad || !user.squad || complaint.assignedSquad.toString() !== user.squad.toString())
      ) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Update progress
    complaint.progress = Math.min(100, Math.max(0, parseInt(progress) || 0));
    // Update status based on progress
    if (complaint.progress >= 100) {
      complaint.status = 'resolved';
    } else if (complaint.progress > 0 && complaint.status === 'pending') {
      complaint.status = 'in_progress';
    }

    // Add proof files
    if (req.files && req.files.length > 0) {
      const proofFiles = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        path: file.path
      }));
      complaint.proofFiles = complaint.proofFiles || [];
      complaint.proofFiles.push(...proofFiles);
    }

    // Add timeline entry
    complaint.timeline.push({
      action: `Progress updated to ${complaint.progress}%`,
      performedBy: req.user.userId,
      comment: notes || `Progress updated to ${complaint.progress}%`
    });

    // If resolved, create notification for citizen
    if (complaint.status === 'resolved' && complaint.progress >= 100) {
      const notification = new Notification({
        userId: complaint.citizenId,
        title: 'Complaint Resolved',
        message: `Your complaint "${complaint.title}" has been resolved!`,
        type: 'resolution',
        relatedComplaint: complaint._id
      });
      await notification.save();
    }

    complaint.updatedAt = new Date();
    await complaint.save();

    // Debug log before sending response
    console.log("Returning progress update response", complaint._id, complaint.progress, complaint.status);
    // Always return a JSON response
    return res.json({
      message: 'Progress updated successfully',
      complaint
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard and Analytics Routes
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    // Build query based on user role
    let query = {};
    if (req.user.role === 'citizen') {
      query.citizenId = req.user.userId;
    } else if (req.user.role === 'official') {
      query.assignedTo = req.user.userId;
    }

    const stats = await Promise.all([
      Complaint.countDocuments({ ...query, status: 'pending' }),
      Complaint.countDocuments({ ...query, status: 'in_progress' }),
      Complaint.countDocuments({ ...query, status: 'resolved' }),
      Complaint.countDocuments({ ...query, status: 'closed' }),
      Complaint.countDocuments({ ...query, escalationStatus: { $ne: 'green' } })
    ]);

    const categoryStats = await Complaint.aggregate([
      { $match: query },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const severityStats = await Complaint.aggregate([
      { $match: query },
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);

    res.json({
      overview: {
        pending: stats[0],
        inProgress: stats[1],
        resolved: stats[2],
        closed: stats[3],
        escalated: stats[4]
      },
      categories: categoryStats,
      severity: severityStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/dashboard/trends', authenticateToken, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Build query based on user role
    let userQuery = {};
    if (req.user.role === 'citizen') {
      userQuery.citizenId = req.user.userId;
    } else if (req.user.role === 'official') {
      userQuery.assignedTo = req.user.userId;
    }

    const trends = await Complaint.aggregate([
      {
        $match: {
          ...userQuery,
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    res.json(trends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Public Dashboard (No authentication required)
app.get('/api/public/stats', async (req, res) => {
  try {
    const stats = await Promise.all([
      Complaint.countDocuments({ status: 'resolved' }),
      Complaint.countDocuments({ status: { $ne: 'resolved' } }),
      Complaint.find({}).sort({ 'upvotes': -1 }).limit(10)
        .populate('citizenId', 'name')
        .select('title category upvotes createdAt')
    ]);

    res.json({
      resolved: stats[0],
      pending: stats[1],
      topUpvoted: stats[2]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Notification Routes
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/notifications/read-all', authenticateToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.userId, read: false },
      { read: true }
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Community Routes
app.get('/api/community/discussions', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    const discussions = await Discussion.find(query)
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.json(discussions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/community/discussions', authenticateToken, async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    
    const discussion = new Discussion({
      title,
      content,
      category,
      tags,
      author: req.user.userId
    });
    
    await discussion.save();
    
    const populatedDiscussion = await Discussion.findById(discussion._id)
      .populate('author', 'name');
    
    res.status(201).json(populatedDiscussion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/community/discussions/:id/upvote', authenticateToken, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }
    
    const userId = req.user.userId;
    const hasUpvoted = discussion.upvotes.includes(userId);
    
    if (hasUpvoted) {
      discussion.upvotes.pull(userId);
    } else {
      discussion.upvotes.push(userId);
    }
    
    await discussion.save();
    
    res.json({
      message: hasUpvoted ? 'Upvote removed' : 'Upvote added',
      upvotes: discussion.upvotes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Events Routes
app.get('/api/community/events', async (req, res) => {
  try {
    const events = await Event.find({})
      .populate('organizer', 'name')
      .sort({ date: 1 })
      .limit(20);
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/community/events', authenticateToken, async (req, res) => {
  try {
    const { title, description, date, location, category, maxAttendees } = req.body;
    
    const event = new Event({
      title,
      description,
      date,
      location,
      category,
      maxAttendees,
      organizer: req.user.userId
    });
    
    await event.save();
    
    const populatedEvent = await Event.findById(event._id)
      .populate('organizer', 'name');
    
    res.status(201).json(populatedEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/community/events/:id/join', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const userId = req.user.userId;
    const hasJoined = event.attendees.includes(userId);
    
    if (hasJoined) {
      event.attendees.pull(userId);
    } else {
      if (event.attendees.length >= event.maxAttendees) {
        return res.status(400).json({ error: 'Event is full' });
      }
      event.attendees.push(userId);
    }
    
    await event.save();
    
    res.json({
      message: hasJoined ? 'Left event' : 'Joined event',
      attendees: event.attendees
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/community/events', async (req, res) => {
  try {
    const events = await Event.find({ date: { $gte: new Date() } })
      .populate('organizer', 'name')
      .sort({ date: 1 })
      .limit(10);
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/community/events/:id/join', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    if (event.attendees.length >= event.maxAttendees) {
      return res.status(400).json({ error: 'Event is full' });
    }
    
    const userId = req.user.userId;
    const isAttending = event.attendees.includes(userId);
    
    if (isAttending) {
      event.attendees.pull(userId);
    } else {
      event.attendees.push(userId);
    }
    
    await event.save();
    
    res.json({
      message: isAttending ? 'Removed from event' : 'Joined event',
      attendees: event.attendees.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Profile Routes
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update allowed fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    
    await user.save();
    
    // Return user without password
    const userResponse = await User.findById(user._id).select('-password');
    
    res.json({ 
      message: 'Profile updated successfully',
      user: userResponse 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Demo user creation
app.post('/api/demo/setup', async (req, res) => {
  try {
    // Create demo users
    const demoUsers = [
      {
        name: 'John Citizen',
        email: 'citizen123@gmail.com',
        password: await bcrypt.hash('citizen123', 10),
        role: 'citizen',
        phone: '+1234567890',
        address: '123 Main St'
      },
      {
        name: 'Gov Officer',
        email: 'gov_officer1@gmail.com',
        password: await bcrypt.hash('gov123', 10),
        role: 'official',
        department: 'Public Works'
      },
      {
        name: 'Gov Supervisor',
        email: 'gov_supervisor1@gmail.com',
        password: await bcrypt.hash('govsupervise123', 10),
        role: 'supervisor',
        department: 'Administration'
      }
    ];

    // Create users only if they don't exist
    for (const userData of demoUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        await User.create(userData);
      }
    }

    // Create demo complaints
    const citizen = await User.findOne({ email: 'citizen123@gmail.com' });
    const official = await User.findOne({ email: 'gov_officer1@gmail.com' });

    const demoComplaints = [
      {
        title: 'Pothole on Marine Drive',
        description: 'Large pothole causing traffic issues on Marine Drive',
        category: 'roads',
        severity: 'high',
        citizenId: citizen._id,
        assignedTo: official._id,
        status: 'in_progress',
        location: { 
          address: 'Marine Drive, Mumbai', 
          zone: 'downtown',
          coordinates: { lat: 19.0760, lng: 72.8777 } 
        }
      },
      {
        title: 'Garbage not collected in Bandra',
        description: 'Waste bins overflowing for 3 days in Bandra',
        category: 'sanitation',
        severity: 'medium',
        citizenId: citizen._id,
        status: 'pending',
        location: { 
          address: 'Bandra West, Mumbai', 
          zone: 'residential',
          coordinates: { lat: 19.2183, lng: 72.9781 } 
        }
      }
    ];

    // Create complaints only if they don't exist
    for (const complaintData of demoComplaints) {
      const existingComplaint = await Complaint.findOne({ 
        title: complaintData.title,
        citizenId: complaintData.citizenId 
      });
      if (!existingComplaint) {
        await Complaint.create(complaintData);
      }
    }

    // Create demo notifications
    const demoNotifications = [
      {
        userId: citizen._id,
        title: 'Complaint Status Update',
        message: 'Your complaint "Pothole on Marine Drive" has been assigned to a government official.',
        type: 'status_update',
        relatedComplaint: demoComplaints[0]._id
      },
      {
        userId: citizen._id,
        title: 'Welcome to CityView360',
        message: 'Thank you for joining our civic engagement platform!',
        type: 'system'
      }
    ];

    // Create notifications only if they don't exist
    for (const notificationData of demoNotifications) {
      const existingNotification = await Notification.findOne({ 
        title: notificationData.title,
        userId: notificationData.userId 
      });
      if (!existingNotification) {
        await Notification.create(notificationData);
      }
    }

    // Create demo community discussions
    const demoDiscussions = [
      {
        title: 'Street Light Issues in Downtown Area',
        content: 'Has anyone noticed the street lights on Main Street not working properly? It\'s been like this for weeks and it\'s getting dangerous for pedestrians.',
        category: 'infrastructure',
        tags: ['street-lights', 'safety', 'downtown'],
        author: citizen._id
      },
      {
        title: 'Community Garden Initiative - Looking for Volunteers',
        content: 'We\'re planning to start a community garden in the vacant lot on Oak Street. Looking for volunteers and ideas!',
        category: 'community',
        tags: ['garden', 'volunteers', 'community'],
        author: citizen._id
      }
    ];

    await Discussion.deleteMany({});
    await Discussion.insertMany(demoDiscussions);

    // Create demo events
    const demoEvents = [
      {
        title: 'City Council Meeting',
        description: 'Monthly city council meeting to discuss upcoming infrastructure projects',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        location: 'City Hall, Main Auditorium',
        category: 'government',
        maxAttendees: 100,
        organizer: citizen._id
      },
      {
        title: 'Neighborhood Cleanup Day',
        description: 'Join us for a community cleanup event in the downtown area',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        location: 'Downtown Plaza',
        category: 'community',
        maxAttendees: 50,
        organizer: citizen._id
      }
    ];

    await Event.deleteMany({});
    await Event.insertMany(demoEvents);

    res.json({ message: 'Demo setup completed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin/Supervisor Dashboard Route
app.get('/api/admin/dashboard', authenticateToken, authorize(['admin', 'supervisor']), async (req, res) => {
  try {
    // Example: Return counts of users, complaints, and officials
    const userCount = await User.countDocuments();
    const complaintCount = await Complaint.countDocuments();
    const officialCount = await User.countDocuments({ role: 'official' });
    const supervisorCount = await User.countDocuments({ role: 'supervisor' });
    res.json({
      users: userCount,
      complaints: complaintCount,
      officials: officialCount,
      supervisors: supervisorCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get escalation settings
app.get('/api/admin/escalation-settings', authenticateToken, authorize(['admin', 'supervisor']), async (req, res) => {
  try {
    let settings = await EscalationSettings.findOne();
    if (!settings) {
      settings = await EscalationSettings.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Update escalation settings
app.post('/api/admin/escalation-settings', authenticateToken, authorize(['admin', 'supervisor']), async (req, res) => {
  try {
    let settings = await EscalationSettings.findOne();
    if (!settings) {
      settings = new EscalationSettings();
    }
    const { yellowThresholdDays, redThresholdDays, notifySMS, notifyEmail, autoEscalateTo } = req.body;
    if (yellowThresholdDays !== undefined) settings.yellowThresholdDays = yellowThresholdDays;
    if (redThresholdDays !== undefined) settings.redThresholdDays = redThresholdDays;
    if (notifySMS !== undefined) settings.notifySMS = notifySMS;
    if (notifyEmail !== undefined) settings.notifyEmail = notifyEmail;
    if (autoEscalateTo !== undefined) settings.autoEscalateTo = autoEscalateTo;
    settings.updatedAt = new Date();
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get system configuration
app.get('/api/admin/config', authenticateToken, authorize(['admin', 'supervisor']), async (req, res) => {
  try {
    let config = await SystemConfig.findOne();
    if (!config) {
      config = await SystemConfig.create({
        categories: ['sanitation', 'roads', 'water', 'electricity', 'parks', 'traffic', 'other'],
        severityLevels: ['low', 'medium', 'high', 'critical'],
        languages: [{ code: 'en', name: 'English', active: true }]
      });
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Update categories
app.post('/api/admin/config/categories', authenticateToken, authorize(['admin', 'supervisor']), async (req, res) => {
  try {
    const { categories } = req.body;
    let config = await SystemConfig.findOne();
    if (!config) config = new SystemConfig();
    config.categories = categories;
    config.updatedAt = new Date();
    await config.save();
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Update severity levels
app.post('/api/admin/config/severity', authenticateToken, authorize(['admin', 'supervisor']), async (req, res) => {
  try {
    const { severityLevels } = req.body;
    let config = await SystemConfig.findOne();
    if (!config) config = new SystemConfig();
    config.severityLevels = severityLevels;
    config.updatedAt = new Date();
    await config.save();
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Update languages
app.post('/api/admin/config/languages', authenticateToken, authorize(['admin', 'supervisor']), async (req, res) => {
  try {
    const { languages, defaultLanguage } = req.body;
    let config = await SystemConfig.findOne();
    if (!config) config = new SystemConfig();
    if (languages) config.languages = languages;
    if (defaultLanguage) config.defaultLanguage = defaultLanguage;
    config.updatedAt = new Date();
    await config.save();
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List all users
app.get('/api/admin/users', authenticateToken, authorize(['admin', 'supervisor']), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Add a new user
app.post('/api/admin/users', authenticateToken, authorize(['admin', 'supervisor']), async (req, res) => {
  try {
    const { name, email, password, role, phone, address, department } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role, phone, address, department });
    await user.save();
    res.status(201).json({ message: 'User created', user: { ...user.toObject(), password: undefined } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Update a user (role, zone, etc.)
app.put('/api/admin/users/:id', authenticateToken, authorize(['admin', 'supervisor']), async (req, res) => {
  try {
    const { name, phone, address, department, role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (department) user.department = department;
    if (role) user.role = role;
    await user.save();
    res.json({ message: 'User updated', user: { ...user.toObject(), password: undefined } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Delete a user
app.delete('/api/admin/users/:id', authenticateToken, authorize(['admin', 'supervisor']), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Performance Analytics Endpoint
app.get('/api/admin/analytics', authenticateToken, authorize(['admin', 'supervisor']), async (req, res) => {
  try {
    // Department-wise resolution times
    const deptResolution = await Complaint.aggregate([
      { $match: { status: 'resolved', assignedTo: { $ne: null } } },
      { $lookup: { from: 'users', localField: 'assignedTo', foreignField: '_id', as: 'official' } },
      { $unwind: '$official' },
      { $group: {
        _id: '$official.department',
        avgResolutionDays: { $avg: { $divide: [{ $subtract: ['$updatedAt', '$createdAt'] }, 1000 * 60 * 60 * 24] } },
        count: { $sum: 1 }
      } },
      { $sort: { avgResolutionDays: 1 } }
    ]);
    // Category-wise complaint volume
    const categoryVolume = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    // Top performing officials by avg resolution time
    const topOfficials = await Complaint.aggregate([
      { $match: { status: 'resolved', assignedTo: { $ne: null } } },
      { $group: {
        _id: '$assignedTo',
        avgResolutionDays: { $avg: { $divide: [{ $subtract: ['$updatedAt', '$createdAt'] }, 1000 * 60 * 60 * 24] } },
        resolvedCount: { $sum: 1 }
      } },
      { $sort: { avgResolutionDays: 1 } },
      { $limit: 10 }
    ]);
    // Populate official names
    const officialIds = topOfficials.map(o => o._id);
    const officials = await User.find({ _id: { $in: officialIds } }).select('name email');
    const topOfficialsWithNames = topOfficials.map(o => ({
      ...o,
      official: officials.find(u => u._id.toString() === o._id.toString())
    }));
    res.json({ deptResolution, categoryVolume, topOfficials: topOfficialsWithNames });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Squad Progress Tracking Endpoint
app.get('/api/admin/squad-progress', authenticateToken, authorize(['admin', 'supervisor']), async (req, res) => {
  try {
    // Get all officials grouped by department
    const officials = await User.find({ role: 'official' }).select('name email department');
    const departments = [...new Set(officials.map(o => o.department).filter(Boolean))];
    
    const squadProgress = await Promise.all(departments.map(async (dept) => {
      const deptOfficials = officials.filter(o => o.department === dept);
      const officialIds = deptOfficials.map(o => o._id);
      
      // Get all complaints assigned to this department's officials
      const complaints = await Complaint.find({ assignedTo: { $in: officialIds } });
      
      // Calculate metrics
      const totalComplaints = complaints.length;
      const resolvedComplaints = complaints.filter(c => c.status === 'resolved').length;
      const inProgressComplaints = complaints.filter(c => c.status === 'in_progress').length;
      const pendingComplaints = complaints.filter(c => c.status === 'pending').length;
      
      // Calculate average resolution time for resolved complaints
      const resolvedComplaintsData = complaints.filter(c => c.status === 'resolved');
      const avgResolutionDays = resolvedComplaintsData.length > 0 
        ? resolvedComplaintsData.reduce((sum, c) => {
            const resolutionTime = (c.updatedAt - c.createdAt) / (1000 * 60 * 60 * 24);
            return sum + resolutionTime;
          }, 0) / resolvedComplaintsData.length
        : 0;
      
      // Calculate average progress for in-progress complaints
      const inProgressData = complaints.filter(c => c.status === 'in_progress');
      const avgProgress = inProgressData.length > 0 
        ? inProgressData.reduce((sum, c) => sum + c.progress, 0) / inProgressData.length
        : 0;
      
      // Workload distribution per official
      const workloadDistribution = deptOfficials.map(official => {
        const officialComplaints = complaints.filter(c => c.assignedTo.toString() === official._id.toString());
        const officialResolved = officialComplaints.filter(c => c.status === 'resolved').length;
        const officialInProgress = officialComplaints.filter(c => c.status === 'in_progress').length;
        const officialPending = officialComplaints.filter(c => c.status === 'pending').length;
        
        return {
          officialId: official._id,
          officialName: official.name,
          officialEmail: official.email,
          totalAssigned: officialComplaints.length,
          resolved: officialResolved,
          inProgress: officialInProgress,
          pending: officialPending,
          avgProgress: officialInProgress > 0 
            ? officialComplaints.filter(c => c.status === 'in_progress').reduce((sum, c) => sum + c.progress, 0) / officialInProgress
            : 0
        };
      });
      
      // Recent activity (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentActivity = complaints.filter(c => c.updatedAt >= sevenDaysAgo).length;
      
      // Escalation status breakdown
      const escalationBreakdown = {
        green: complaints.filter(c => c.escalationStatus?.level === 'green').length,
        yellow: complaints.filter(c => c.escalationStatus?.level === 'yellow').length,
        red: complaints.filter(c => c.escalationStatus?.level === 'red').length
      };
      
      return {
        department: dept,
        totalOfficials: deptOfficials.length,
        officials: deptOfficials.map(o => ({ id: o._id, name: o.name, email: o.email })),
        metrics: {
          totalComplaints,
          resolvedComplaints,
          inProgressComplaints,
          pendingComplaints,
          resolutionRate: totalComplaints > 0 ? (resolvedComplaints / totalComplaints * 100).toFixed(1) : 0,
          avgResolutionDays: avgResolutionDays.toFixed(1),
          avgProgress: avgProgress.toFixed(1),
          recentActivity
        },
        workloadDistribution,
        escalationBreakdown
      };
    }));
    
    res.json(squadProgress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Individual Squad Details Endpoint
app.get('/api/admin/squad-progress/:department', authenticateToken, authorize(['admin', 'supervisor']), async (req, res) => {
  try {
    const { department } = req.params;
    
    // Get officials in this department
    const officials = await User.find({ role: 'official', department }).select('name email');
    const officialIds = officials.map(o => o._id);
    
    // Get complaints for this department
    const complaints = await Complaint.find({ assignedTo: { $in: officialIds } })
      .populate('assignedTo', 'name email')
      .populate('citizenId', 'name')
      .sort({ createdAt: -1 });
    
    // Get detailed metrics for each official
    const officialMetrics = await Promise.all(officials.map(async (official) => {
      const officialComplaints = complaints.filter(c => c.assignedTo._id.toString() === official._id.toString());
      
      // Resolution time analysis
      const resolvedComplaints = officialComplaints.filter(c => c.status === 'resolved');
      const resolutionTimes = resolvedComplaints.map(c => {
        return (c.updatedAt - c.createdAt) / (1000 * 60 * 60 * 24);
      });
      
      // Assignment analysis
      const assignmentAnalysis = officialComplaints.map(c => {
        const assignmentEntry = c.timeline?.find(t => 
          t.action.includes('assigned') || t.action.includes('Assigned')
        );
        const assignmentDate = assignmentEntry ? new Date(assignmentEntry.timestamp) : null;
        const daysSinceAssignment = assignmentDate ? 
          Math.ceil((new Date() - assignmentDate) / (1000 * 60 * 60 * 24)) : null;
        
        // Check if work has started
        const workEntries = c.timeline?.filter(t => 
          !t.action.includes('submitted') && !t.action.includes('Submitted')
        );
        const hasWorkStarted = workEntries && workEntries.length > 0;
        
        return {
          complaintId: c._id,
          title: c.title,
          status: c.status,
          progress: c.progress,
          assignmentDate,
          daysSinceAssignment,
          hasWorkStarted,
          isOverdue: daysSinceAssignment && daysSinceAssignment > 7
        };
      });
      
      // Category breakdown
      const categoryBreakdown = {};
      officialComplaints.forEach(c => {
        categoryBreakdown[c.category] = (categoryBreakdown[c.category] || 0) + 1;
      });
      
      // Timeline of recent activities
      const recentActivities = officialComplaints
        .filter(c => c.timeline && c.timeline.length > 0)
        .flatMap(c => c.timeline.map(t => ({
          complaintId: c._id,
          complaintTitle: c.title,
          action: t.action,
          timestamp: t.timestamp,
          comment: t.comment
        })))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10);
      
      // Overdue complaints
      const overdueComplaints = assignmentAnalysis.filter(a => a.isOverdue);
      const noWorkStarted = assignmentAnalysis.filter(a => !a.hasWorkStarted && a.status === 'pending');
      
      return {
        officialId: official._id,
        officialName: official.name,
        officialEmail: official.email,
        totalAssigned: officialComplaints.length,
        resolved: resolvedComplaints.length,
        inProgress: officialComplaints.filter(c => c.status === 'in_progress').length,
        pending: officialComplaints.filter(c => c.status === 'pending').length,
        avgResolutionDays: resolutionTimes.length > 0 
          ? (resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length).toFixed(1)
          : 0,
        categoryBreakdown,
        recentActivities,
        currentWorkload: officialComplaints.filter(c => ['pending', 'in_progress'].includes(c.status)).length,
        assignmentAnalysis,
        overdueComplaints: overdueComplaints.length,
        noWorkStarted: noWorkStarted.length
      };
    }));
    
    // Department summary
    const totalComplaints = complaints.length;
    const resolvedComplaints = complaints.filter(c => c.status === 'resolved').length;
    const avgResolutionDays = resolvedComplaints > 0 
      ? complaints.filter(c => c.status === 'resolved')
          .reduce((sum, c) => sum + ((c.updatedAt - c.createdAt) / (1000 * 60 * 60 * 24)), 0) / resolvedComplaints
      : 0;
    
    // Overall assignment analysis
    const overallAssignmentAnalysis = complaints.map(c => {
      const assignmentEntry = c.timeline?.find(t => 
        t.action.includes('assigned') || t.action.includes('Assigned')
      );
      const assignmentDate = assignmentEntry ? new Date(assignmentEntry.timestamp) : null;
      const daysSinceAssignment = assignmentDate ? 
        Math.ceil((new Date() - assignmentDate) / (1000 * 60 * 60 * 24)) : null;
      
      const workEntries = c.timeline?.filter(t => 
        !t.action.includes('submitted') && !t.action.includes('Submitted')
      );
      const hasWorkStarted = workEntries && workEntries.length > 0;
      
      return {
        ...c.toObject(),
        assignmentDate,
        daysSinceAssignment,
        hasWorkStarted,
        isOverdue: daysSinceAssignment && daysSinceAssignment > 7
      };
    });
    
    const totalOverdue = overallAssignmentAnalysis.filter(a => a.isOverdue).length;
    const totalNoWork = overallAssignmentAnalysis.filter(a => !a.hasWorkStarted && a.status === 'pending').length;
    
    res.json({
      department,
      summary: {
        totalOfficials: officials.length,
        totalComplaints,
        resolvedComplaints,
        resolutionRate: totalComplaints > 0 ? (resolvedComplaints / totalComplaints * 100).toFixed(1) : 0,
        avgResolutionDays: avgResolutionDays.toFixed(1),
        totalOverdue,
        totalNoWork
      },
      officialMetrics,
      recentComplaints: overallAssignmentAnalysis.slice(0, 10)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Public Interface Endpoints (No authentication required)

// Get all public complaints
app.get('/api/public/complaints', async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('citizenId', 'name')
      .populate('assignedTo', 'name department')
      .select('-proofFiles -resolutionMedia') // Exclude sensitive files
      .sort({ createdAt: -1 });
    
    // Remove sensitive information for public view
    const publicComplaints = complaints.map(complaint => ({
      _id: complaint._id,
      title: complaint.title,
      description: complaint.description,
      category: complaint.category,
      severity: complaint.severity,
      status: complaint.status,
      progress: complaint.progress,
      location: complaint.location,
      upvotes: complaint.upvotes ? complaint.upvotes.length : 0,
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt,
      timeline: complaint.timeline,
      citizenName: complaint.citizenId?.name || 'Anonymous',
      assignedTo: complaint.assignedTo ? {
        name: complaint.assignedTo.name,
        department: complaint.assignedTo.department
      } : null
    }));
    
    res.json(publicComplaints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Public upvote endpoint (anonymous)
app.post('/api/public/complaints/:id/upvote', async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    
    // For anonymous upvotes, we'll use a simple counter
    // In a real implementation, you might want to track IP addresses or use session tokens
    if (!complaint.upvotes) {
      complaint.upvotes = [];
    }
    
    // Add a placeholder ID for anonymous upvote (in real app, use IP or session)
    const anonymousId = new mongoose.Types.ObjectId();
    complaint.upvotes.push(anonymousId);
    await complaint.save();
    
    res.json({ message: 'Upvoted successfully', upvotes: complaint.upvotes.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get public complaint statistics
app.get('/api/public/stats', async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const resolvedComplaints = await Complaint.countDocuments({ status: 'resolved' });
    const inProgressComplaints = await Complaint.countDocuments({ status: 'in_progress' });
    const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });
    
    // Category breakdown
    const categoryStats = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentActivity = await Complaint.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    
    res.json({
      total: totalComplaints,
      resolved: resolvedComplaints,
      inProgress: inProgressComplaints,
      pending: pendingComplaints,
      resolutionRate: totalComplaints > 0 ? (resolvedComplaints / totalComplaints * 100).toFixed(1) : 0,
      categoryStats,
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Squad Management Endpoints
app.post('/api/squads', authenticateToken, authorize(['admin', 'supervisor']), async (req, res) => {
  try {
    const { name, code, description, assignedRegions } = req.body;
    
    // Check if squad with same code exists
    const existingSquad = await Squad.findOne({ code });
    if (existingSquad) {
      return res.status(400).json({ error: 'Squad with this code already exists' });
    }
    
    const squad = new Squad({
      name,
      code,
      description,
      assignedRegions
    });
    
    await squad.save();
    
    res.status(201).json({
      message: 'Squad created successfully',
      squad
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/squads', authenticateToken, async (req, res) => {
  try {
    const squads = await Squad.find({ isActive: true })
      .populate('members', 'name email role')
      .populate('supervisor', 'name email');
    
    res.json(squads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/squads/:id', authenticateToken, async (req, res) => {
  try {
    const squad = await Squad.findById(req.params.id)
      .populate('members', 'name email role phone')
      .populate('supervisor', 'name email');
    
    if (!squad) {
      return res.status(404).json({ error: 'Squad not found' });
    }
    
    res.json(squad);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/squads/:id', authenticateToken, authorize(['admin', 'supervisor']), async (req, res) => {
  try {
    const { name, description, assignedRegions, members, supervisor } = req.body;
    
    const squad = await Squad.findById(req.params.id);
    if (!squad) {
      return res.status(404).json({ error: 'Squad not found' });
    }
    
    if (name) squad.name = name;
    if (description) squad.description = description;
    if (assignedRegions) squad.assignedRegions = assignedRegions;
    if (members) squad.members = members;
    if (supervisor) squad.supervisor = supervisor;
    
    await squad.save();
    
    res.json({
      message: 'Squad updated successfully',
      squad
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Demo setup endpoint to create squads and team users
app.post('/api/demo/setup', async (req, res) => {
  try {
    // Create squads with assigned regions
    const squads = [
      {
        name: 'Squad Alpha',
        code: 'alpha',
        description: 'Handles complaints from Downtown Mumbai, Industrial Mumbai, and Chennai',
        assignedRegions: [
          {
            name: 'Downtown Mumbai',
            city: 'Mumbai',
            state: 'Maharashtra',
            coordinates: {
              center: { lat: 19.0760, lng: 72.8777 },
              bounds: {
                north: 19.1000,
                south: 19.0500,
                east: 72.9000,
                west: 72.8500
              }
            }
          },
          {
            name: 'Industrial Mumbai',
            city: 'Mumbai',
            state: 'Maharashtra',
            coordinates: {
              center: { lat: 19.0000, lng: 72.8500 },
              bounds: {
                north: 19.0500,
                south: 18.9500,
                east: 72.9000,
                west: 72.8000
              }
            }
          },
          {
            name: 'Chennai Central',
            city: 'Chennai',
            state: 'Tamil Nadu',
            coordinates: {
              center: { lat: 13.0827, lng: 80.2707 },
              bounds: {
                north: 13.2000,
                south: 12.9000,
                east: 80.4000,
                west: 80.1000
              }
            }
          },
          {
            name: 'Chennai Suburban',
            city: 'Chennai',
            state: 'Tamil Nadu',
            coordinates: {
              center: { lat: 13.0000, lng: 80.2000 },
              bounds: {
                north: 13.1000,
                south: 12.9000,
                east: 80.3000,
                west: 80.1000
              }
            }
          }
        ]
      },
      {
        name: 'Squad Beta',
        code: 'beta',
        description: 'Handles complaints from Suburban and Coastal Mumbai',
        assignedRegions: [
          {
            name: 'Suburban Mumbai',
            city: 'Mumbai',
            state: 'Maharashtra',
            coordinates: {
              center: { lat: 19.1500, lng: 72.8500 },
              bounds: {
                north: 19.2000,
                south: 19.1000,
                east: 72.9000,
                west: 72.8000
              }
            }
          },
          {
            name: 'Coastal Mumbai',
            city: 'Mumbai',
            state: 'Maharashtra',
            coordinates: {
              center: { lat: 19.0500, lng: 72.9500 },
              bounds: {
                north: 19.1000,
                south: 19.0000,
                east: 73.0000,
                west: 72.9000
              }
            }
          }
        ]
      },
      {
        name: 'Squad Gamma',
        code: 'gamma',
        description: 'Handles complaints from Northern and Western Mumbai',
        assignedRegions: [
          {
            name: 'Northern Mumbai',
            city: 'Mumbai',
            state: 'Maharashtra',
            coordinates: {
              center: { lat: 19.2000, lng: 72.8000 },
              bounds: {
                north: 19.2500,
                south: 19.1500,
                east: 72.8500,
                west: 72.7500
              }
            }
          },
          {
            name: 'Western Mumbai',
            city: 'Mumbai',
            state: 'Maharashtra',
            coordinates: {
              center: { lat: 19.1000, lng: 72.7500 },
              bounds: {
                north: 19.1500,
                south: 19.0500,
                east: 72.8000,
                west: 72.7000
              }
            }
          }
        ]
      }
    ];
    
    // Create squads
    const createdSquads = [];
    for (const squadData of squads) {
      let squad = await Squad.findOne({ code: squadData.code });
      if (!squad) {
        squad = new Squad(squadData);
        await squad.save();
      }
      createdSquads.push(squad);
    }
    
    // Create team users
    const teamUsers = [
      {
        name: 'Official Alpha 1',
        email: 'official1_alpha@gmail.com',
        password: 'alpha123',
        role: 'official',
        department: 'Infrastructure',
        assignedRegions: ['Downtown Mumbai', 'Industrial Mumbai', 'Chennai Central', 'Chennai Suburban']
      },
      {
        name: 'Official Alpha 2',
        email: 'official2_alpha@gmail.com',
        password: 'alpha123',
        role: 'official',
        department: 'Sanitation',
        assignedRegions: ['Downtown Mumbai', 'Industrial Mumbai', 'Chennai Central', 'Chennai Suburban']
      },
      {
        name: 'Supervisor Alpha',
        email: 'supervisor_alpha@gmail.com',
        password: 'alpha123',
        role: 'supervisor',
        department: 'Operations',
        assignedRegions: ['Downtown Mumbai', 'Industrial Mumbai', 'Chennai Central', 'Chennai Suburban']
      },
      {
        name: 'Official Beta 1',
        email: 'official1_beta@gmail.com',
        password: 'beta123',
        role: 'official',
        department: 'Infrastructure',
        assignedRegions: ['Suburban Mumbai', 'Coastal Mumbai']
      },
      {
        name: 'Official Beta 2',
        email: 'official2_beta@gmail.com',
        password: 'beta123',
        role: 'official',
        department: 'Sanitation',
        assignedRegions: ['Suburban Mumbai', 'Coastal Mumbai']
      },
      {
        name: 'Supervisor Beta',
        email: 'supervisor_beta@gmail.com',
        password: 'beta123',
        role: 'supervisor',
        department: 'Operations',
        assignedRegions: ['Suburban Mumbai', 'Coastal Mumbai']
      },
      {
        name: 'Official Gamma 1',
        email: 'official1_gamma@gmail.com',
        password: 'gamma123',
        role: 'official',
        department: 'Infrastructure',
        assignedRegions: ['Northern Mumbai', 'Western Mumbai']
      },
      {
        name: 'Official Gamma 2',
        email: 'official2_gamma@gmail.com',
        password: 'gamma123',
        role: 'official',
        department: 'Sanitation',
        assignedRegions: ['Northern Mumbai', 'Western Mumbai']
      },
      {
        name: 'Supervisor Gamma',
        email: 'supervisor_gamma@gmail.com',
        password: 'gamma123',
        role: 'supervisor',
        department: 'Operations',
        assignedRegions: ['Northern Mumbai', 'Western Mumbai']
      }
    ];
    
    // Create users and assign to squads
    const createdUsers = [];
    for (const userData of teamUsers) {
      let user = await User.findOne({ email: userData.email });
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      if (!user) {
        user = new User({
          ...userData,
          password: hashedPassword
        });
      } else {
        user.password = hashedPassword;
        user.role = userData.role;
        user.department = userData.department;
        user.assignedRegions = userData.assignedRegions;
      }
      // Assign squad based on email pattern
      if (userData.email.includes('alpha')) {
        user.squad = createdSquads.find(s => s.code === 'alpha')._id;
      } else if (userData.email.includes('beta')) {
        user.squad = createdSquads.find(s => s.code === 'beta')._id;
      } else if (userData.email.includes('gamma')) {
        user.squad = createdSquads.find(s => s.code === 'gamma')._id;
      }
      await user.save();
      createdUsers.push(user);
    }
    
    // Assign users to their respective squads
    const alphaSquad = createdSquads.find(s => s.code === 'alpha');
    const betaSquad = createdSquads.find(s => s.code === 'beta');
    const gammaSquad = createdSquads.find(s => s.code === 'gamma');
    
    if (alphaSquad) {
      const alphaUsers = createdUsers.filter(u => u.email.includes('alpha'));
      alphaSquad.members = alphaUsers.filter(u => u.role === 'official').map(u => u._id);
      alphaSquad.supervisor = alphaUsers.find(u => u.role === 'supervisor')._id;
      await alphaSquad.save();
    }
    
    if (betaSquad) {
      const betaUsers = createdUsers.filter(u => u.email.includes('beta'));
      betaSquad.members = betaUsers.filter(u => u.role === 'official').map(u => u._id);
      betaSquad.supervisor = betaUsers.find(u => u.role === 'supervisor')._id;
      await betaSquad.save();
    }
    
    if (gammaSquad) {
      const gammaUsers = createdUsers.filter(u => u.email.includes('gamma'));
      gammaSquad.members = gammaUsers.filter(u => u.role === 'official').map(u => u._id);
      gammaSquad.supervisor = gammaUsers.find(u => u.role === 'supervisor')._id;
      await gammaSquad.save();
    }
    
    // Create sample complaints including Chennai complaints for Alpha squad
    const alphaSquadForComplaints = createdSquads.find(s => s.code === 'alpha');
    const alphaOfficial = createdUsers.find(u => u.email === 'official1_alpha@gmail.com');
    
    if (alphaSquadForComplaints && alphaOfficial) {
      const sampleComplaints = [
        // Mumbai complaints (existing)
        {
          title: 'Critical Pothole on Marine Drive',
          description: 'Large pothole causing traffic disruption and vehicle damage',
          category: 'Infrastructure',
          severity: 'critical',
          status: 'pending',
          escalationLevel: 'red',
          location: {
            address: 'Marine Drive, Mumbai',
            coordinates: { lat: 19.0760, lng: 72.8777 }
          },
          citizenId: alphaOfficial._id,
          assignedSquad: alphaSquadForComplaints._id,
          timeline: [{
            action: 'Complaint submitted',
            performedBy: alphaOfficial._id,
            comment: 'Initial complaint submission'
          }]
        },
        {
          title: 'Water Leak in BKC Industrial Zone',
          description: 'Major water pipeline leak affecting industrial operations',
          category: 'Water Supply',
          severity: 'critical',
          status: 'in_progress',
          escalationLevel: 'red',
          location: {
            address: 'BKC Industrial Zone, Mumbai',
            coordinates: { lat: 19.0000, lng: 72.8500 }
          },
          citizenId: alphaOfficial._id,
          assignedSquad: alphaSquadForComplaints._id,
          timeline: [{
            action: 'Complaint submitted',
            performedBy: alphaOfficial._id,
            comment: 'Initial complaint submission'
          }]
        },
        // Chennai complaints (new)
        {
          title: 'Traffic Signal Malfunction at Anna Nagar',
          description: 'Traffic signal not working properly causing traffic chaos',
          category: 'Traffic',
          severity: 'high',
          status: 'pending',
          escalationLevel: 'yellow',
          location: {
            address: 'Anna Nagar, Chennai',
            coordinates: { lat: 13.0827, lng: 80.2707 }
          },
          citizenId: alphaOfficial._id,
          assignedSquad: alphaSquadForComplaints._id,
          timeline: [{
            action: 'Complaint submitted',
            performedBy: alphaOfficial._id,
            comment: 'Initial complaint submission'
          }]
        },
        {
          title: 'Garbage Collection Issue in T Nagar',
          description: 'Garbage not being collected regularly in T Nagar area',
          category: 'Sanitation',
          severity: 'medium',
          status: 'pending',
          escalationLevel: 'green',
          location: {
            address: 'T Nagar, Chennai',
            coordinates: { lat: 13.0000, lng: 80.2000 }
          },
          citizenId: alphaOfficial._id,
          assignedSquad: alphaSquadForComplaints._id,
          timeline: [{
            action: 'Complaint submitted',
            performedBy: alphaOfficial._id,
            comment: 'Initial complaint submission'
          }]
        },
        {
          title: 'Street Light Outage in Mylapore',
          description: 'Multiple street lights not working in Mylapore area',
          category: 'Infrastructure',
          severity: 'high',
          status: 'in_progress',
          escalationLevel: 'yellow',
          location: {
            address: 'Mylapore, Chennai',
            coordinates: { lat: 13.0500, lng: 80.2500 }
          },
          citizenId: alphaOfficial._id,
          assignedSquad: alphaSquadForComplaints._id,
          timeline: [{
            action: 'Complaint submitted',
            performedBy: alphaOfficial._id,
            comment: 'Initial complaint submission'
          }]
        }
      ];

      // Create complaints if they don't exist
      for (const complaintData of sampleComplaints) {
        const existingComplaint = await Complaint.findOne({ 
          title: complaintData.title,
          'location.address': complaintData.location.address
        });
        
        if (!existingComplaint) {
          const complaint = new Complaint(complaintData);
          await complaint.save();
        }
      }
    }

    console.log('Demo setup completed:', {
      squads: createdSquads.length,
      users: createdUsers.length,
      userEmails: createdUsers.map(u => u.email)
    });
    
    res.json({
      message: 'Demo setup completed successfully',
      squads: createdSquads.length,
      users: createdUsers.length,
      userEmails: createdUsers.map(u => u.email),
      credentials: {
        alpha: { email: 'official1_alpha@gmail.com', password: 'alpha123' },
        beta: { email: 'official1_beta@gmail.com', password: 'beta123' },
        gamma: { email: 'official1_gamma@gmail.com', password: 'gamma123' }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DEMO: Automated setup endpoint for squad, user, and complaint assignment
app.post('/api/demo/full-setup', async (req, res) => {
  try {
    // 1. Create squad if not exists
    let squad = await Squad.findOne({ code: 'alpha' });
    if (!squad) {
      squad = await Squad.create({
        name: 'Alpha Squad',
        code: 'alpha',
        description: 'Default squad for testing',
        assignedRegions: [],
        members: [],
        isActive: true,
        createdAt: new Date()
      });
    }

    // 2. Find first official user
    const user = await User.findOne({ role: 'official' });
    if (!user) {
      return res.status(400).json({ error: 'No official user found. Please register an official first.' });
    }
    // Assign user to squad
    user.squad = squad._id;
    await user.save();

    // 3. Find first complaint
    const complaint = await Complaint.findOne();
    if (!complaint) {
      return res.status(400).json({ error: 'No complaint found. Please create a complaint first.' });
    }
    // Assign complaint to user and squad
    complaint.assignedTo = user._id;
    complaint.assignedSquad = squad._id;
    await complaint.save();

    res.json({
      message: 'Automated setup complete!',
      squadId: squad._id,
      userId: user._id,
      complaintId: complaint._id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
  }
  res.status(500).json({ error: error.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; 