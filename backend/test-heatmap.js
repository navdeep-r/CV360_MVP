const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/cityview360', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define schemas (same as in server.js)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['citizen', 'official', 'supervisor', 'admin'], default: 'citizen' },
  phone: { type: String },
  address: { type: String },
  department: { type: String },
  squad: { type: mongoose.Schema.Types.ObjectId, ref: 'Squad' },
  assignedRegions: [String],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

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
    zone: String,
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

// Create models
const User = mongoose.model('User', userSchema);
const Complaint = mongoose.model('Complaint', complaintSchema);

// Sample complaints with different escalation levels and locations (India)
const sampleComplaints = [
  {
    title: 'Critical Pothole on Marine Drive',
    description: 'Large pothole causing traffic issues and vehicle damage on Marine Drive',
    category: 'roads',
    severity: 'critical',
    status: 'pending',
    location: {
      address: 'Marine Drive, Mumbai',
      zone: 'downtown',
      coordinates: { lat: 19.0760, lng: 72.8777 }
    },
    escalationStatus: {
      level: 'red',
      escalatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) // 8 days ago
    },
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) // 8 days ago
  },
  {
    title: 'Garbage Collection Delayed in Bandra',
    description: 'Garbage not collected for 3 days in Bandra residential area',
    category: 'sanitation',
    severity: 'high',
    status: 'in_progress',
    location: {
      address: 'Bandra West, Mumbai',
      zone: 'residential',
      coordinates: { lat: 19.2183, lng: 72.9781 }
    },
    escalationStatus: {
      level: 'yellow',
      escalatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
  },
  {
    title: 'Street Light Out in Andheri',
    description: 'Street light not working in Andheri commercial district',
    category: 'electricity',
    severity: 'medium',
    status: 'pending',
    location: {
      address: 'Andheri West, Mumbai',
      zone: 'commercial',
      coordinates: { lat: 19.0170, lng: 72.8476 }
    },
    escalationStatus: {
      level: 'green',
      escalatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  },
  {
    title: 'Water Leak in BKC Industrial Zone',
    description: 'Major water leak from underground pipe in BKC',
    category: 'water',
    severity: 'high',
    status: 'pending',
    location: {
      address: 'Bandra Kurla Complex, Mumbai',
      zone: 'industrial',
      coordinates: { lat: 19.0760, lng: 72.8777 }
    },
    escalationStatus: {
      level: 'red',
      escalatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
    },
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
  },
  {
    title: 'Park Maintenance Needed in Juhu',
    description: 'Playground equipment needs repair in Juhu Beach Park',
    category: 'parks',
    severity: 'low',
    status: 'in_progress',
    location: {
      address: 'Juhu Beach, Mumbai',
      zone: 'suburban',
      coordinates: { lat: 19.2183, lng: 72.9781 }
    },
    escalationStatus: {
      level: 'green',
      escalatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
  },
  {
    title: 'Traffic Signal Malfunction at CST',
    description: 'Traffic signal not working properly at CST intersection',
    category: 'traffic',
    severity: 'high',
    status: 'pending',
    location: {
      address: 'Chhatrapati Shivaji Terminus, Mumbai',
      zone: 'downtown',
      coordinates: { lat: 19.0896, lng: 72.8656 }
    },
    escalationStatus: {
      level: 'yellow',
      escalatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
    },
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
  },
  {
    title: 'Sewage Overflow in Dadar',
    description: 'Sewage overflow in Dadar residential area',
    category: 'sanitation',
    severity: 'critical',
    status: 'pending',
    location: {
      address: 'Dadar West, Mumbai',
      zone: 'residential',
      coordinates: { lat: 19.0170, lng: 72.8476 }
    },
    escalationStatus: {
      level: 'red',
      escalatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000) // 9 days ago
    },
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000) // 9 days ago
  },
  {
    title: 'Power Outage in Worli',
    description: 'Power outage affecting commercial buildings in Worli',
    category: 'electricity',
    severity: 'critical',
    status: 'in_progress',
    location: {
      address: 'Worli, Mumbai',
      zone: 'commercial',
      coordinates: { lat: 19.0170, lng: 72.8476 }
    },
    escalationStatus: {
      level: 'red',
      escalatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
  }
];

async function createTestComplaints() {
  try {
    // First, get or create a test user
    let testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      testUser = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'citizen'
      });
      await testUser.save();
    }

    // Clear existing test complaints
    await Complaint.deleteMany({ citizenId: testUser._id });

    // Create new test complaints
    const complaints = sampleComplaints.map(complaint => ({
      ...complaint,
      citizenId: testUser._id,
      progress: Math.floor(Math.random() * 100),
      upvotes: [],
      timeline: [
        {
          action: 'Complaint submitted',
          timestamp: complaint.createdAt,
          performedBy: testUser._id,
          comment: 'Initial complaint submission'
        }
      ]
    }));

    const createdComplaints = await Complaint.insertMany(complaints);
    console.log(`✅ Created ${createdComplaints.length} test complaints with escalation levels`);
    
    // Log the complaints by zone and escalation
    const zoneStats = {};
    createdComplaints.forEach(complaint => {
      const zone = complaint.location.zone;
      const escalation = complaint.escalationStatus.level;
      
      if (!zoneStats[zone]) {
        zoneStats[zone] = { red: 0, yellow: 0, green: 0, total: 0 };
      }
      
      zoneStats[zone][escalation]++;
      zoneStats[zone].total++;
    });

    console.log('\n📊 Complaint Distribution by Zone and Escalation:');
    Object.entries(zoneStats).forEach(([zone, stats]) => {
      console.log(`${zone}: ${stats.total} total (${stats.red} red, ${stats.yellow} yellow, ${stats.green} green)`);
    });

  } catch (error) {
    console.error('❌ Error creating test complaints:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestComplaints(); 