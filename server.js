// SMART SUPPLY CHAINS - FULL WORKING PROTOTYPE
// Backend + Frontend (Node.js + Express + MongoDB/MockDB + Interactive Dashboard)

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ===== MOCK DATABASE FALLBACK =====
// Used when MongoDB is not connected, ensuring the prototype always works
let useMockDB = false;
let mockShipments = [];
let mockIdCounter = 1;

function generateMockId() {
  return `mock_${mockIdCounter++}`;
}

// Load mock data
function loadMockData() {
  mockShipments = [
    {
      _id: generateMockId(),
      shipmentId: 'SC101',
      source: 'Chennai',
      destination: 'Bangalore',
      status: 'In Transit',
      expectedDelivery: '2026-04-20',
      currentLocation: 'Vellore',
      riskLevel: 'Low',
      weatherCondition: 'Clear',
      trafficLevel: 'Medium',
      recommendedRoute: 'NH48',
      estimatedDelay: '1 Hour',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: generateMockId(),
      shipmentId: 'SC102',
      source: 'Mumbai',
      destination: 'Pune',
      status: 'Delayed',
      expectedDelivery: '2026-04-21',
      currentLocation: 'Lonavala',
      riskLevel: 'High',
      weatherCondition: 'Rain',
      trafficLevel: 'High',
      recommendedRoute: 'Express Highway Alternate',
      estimatedDelay: '4 Hours',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: generateMockId(),
      shipmentId: 'SC103',
      source: 'Delhi',
      destination: 'Jaipur',
      status: 'In Transit',
      expectedDelivery: '2026-04-19',
      currentLocation: 'Gurgaon',
      riskLevel: 'Medium',
      weatherCondition: 'Fog',
      trafficLevel: 'High',
      recommendedRoute: 'NH48 via Dharuhera',
      estimatedDelay: '2 Hours',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: generateMockId(),
      shipmentId: 'SC104',
      source: 'Hyderabad',
      destination: 'Vijayawada',
      status: 'On Time',
      expectedDelivery: '2026-04-18',
      currentLocation: 'Suryapet',
      riskLevel: 'Low',
      weatherCondition: 'Clear',
      trafficLevel: 'Low',
      recommendedRoute: 'NH65',
      estimatedDelay: '0 Hours',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: generateMockId(),
      shipmentId: 'SC105',
      source: 'Kolkata',
      destination: 'Bhubaneswar',
      status: 'In Transit',
      expectedDelivery: '2026-04-22',
      currentLocation: 'Kharagpur',
      riskLevel: 'Medium',
      weatherCondition: 'Rain',
      trafficLevel: 'Medium',
      recommendedRoute: 'NH16',
      estimatedDelay: '2 Hours',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
}

// ===== MONGODB CONNECTION =====
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_supply_chain';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB Connected Successfully');
  useMockDB = false;
})
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err.message);
  console.log('⚠️  Switching to MOCK DATABASE mode - prototype will still work!');
  useMockDB = true;
  loadMockData();
});

// Monitor MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected - switching to MOCK DATABASE mode');
  useMockDB = true;
  if (mockShipments.length === 0) loadMockData();
});

mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB reconnected - using REAL DATABASE mode');
  useMockDB = false;
});

// Shipment Schema (for MongoDB)
const shipmentSchema = new mongoose.Schema({
  shipmentId: { type: String, required: true, unique: true },
  source: { type: String, required: true },
  destination: { type: String, required: true },
  status: { type: String, default: 'In Transit' },
  expectedDelivery: { type: String },
  currentLocation: { type: String },
  riskLevel: { type: String, default: 'Low' },
  weatherCondition: { type: String, default: 'Clear' },
  trafficLevel: { type: String, default: 'Medium' },
  recommendedRoute: { type: String },
  estimatedDelay: { type: String, default: '0 Hours' }
}, { timestamps: true });

const Shipment = mongoose.model('Shipment', shipmentSchema);

// ===== AUTHENTICATION =====
let mockUsers = [];
let mockUserIdCounter = 1;
function generateMockUserId() { return `user_${mockUserIdCounter++}`; }

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }
}, { timestamps: true });
const User = mongoose.model('User', userSchema);

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}
function generateToken(userId) {
  return crypto.randomBytes(32).toString('hex') + ':' + userId;
}

const mockTokens = new Map(); // token -> userId

function isMockMode() {
  return useMockDB || mongoose.connection.readyState !== 1;
}

async function findUserByEmail(email) {
  if (isMockMode()) {
    return mockUsers.find(u => u.email === email) || null;
  }
  return await User.findOne({ email });
}
async function createUser(data) {
  if (isMockMode()) {
    const newUser = { _id: generateMockUserId(), ...data, createdAt: new Date().toISOString() };
    mockUsers.push(newUser);
    return newUser;
  }
  const user = new User(data);
  await user.save();
  return user;
}
async function getUserById(id) {
  if (isMockMode()) {
    return mockUsers.find(u => u._id === id) || null;
  }
  return await User.findById(id).select('-passwordHash');
}

// ===== HELPER FUNCTIONS =====
async function getAllShipments() {
  if (useMockDB) {
    return [...mockShipments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  return await Shipment.find().sort({ createdAt: -1 });
}

async function getShipmentById(id) {
  if (useMockDB) {
    return mockShipments.find(s => s._id === id) || null;
  }
  return await Shipment.findById(id);
}

async function createShipment(data) {
  if (useMockDB) {
    const newShipment = {
      _id: generateMockId(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockShipments.push(newShipment);
    return newShipment;
  }
  const shipment = new Shipment(data);
  await shipment.save();
  return shipment;
}

async function updateShipment(id, data) {
  if (useMockDB) {
    const index = mockShipments.findIndex(s => s._id === id);
    if (index === -1) return null;
    mockShipments[index] = { ...mockShipments[index], ...data, updatedAt: new Date().toISOString() };
    return mockShipments[index];
  }
  return await Shipment.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

async function deleteShipment(id) {
  if (useMockDB) {
    const index = mockShipments.findIndex(s => s._id === id);
    if (index === -1) return null;
    const deleted = mockShipments[index];
    mockShipments.splice(index, 1);
    return deleted;
  }
  return await Shipment.findByIdAndDelete(id);
}

async function deleteAllShipments() {
  if (useMockDB) {
    mockShipments = [];
    return { deletedCount: 5 };
  }
  return await Shipment.deleteMany({});
}

async function insertSampleData(data) {
  if (useMockDB) {
    mockShipments = [];
    mockIdCounter = 1;
    data.forEach(item => {
      mockShipments.push({
        _id: generateMockId(),
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });
    return { insertedCount: data.length };
  }
  await Shipment.deleteMany({});
  return await Shipment.insertMany(data);
}

async function countShipments(query = {}) {
  if (useMockDB) {
    return mockShipments.filter(s => {
      for (let key in query) {
        if (s[key] !== query[key]) return false;
      }
      return true;
    }).length;
  }
  return await Shipment.countDocuments(query);
}

// ===== API ROUTES =====

// API Status Route
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    service: 'Smart Supply Chain API',
    version: '1.0.0',
    database: useMockDB ? 'mock (in-memory)' : (mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'),
    mode: useMockDB ? 'DEMO MODE - Data will not persist' : 'PRODUCTION MODE',
    timestamp: new Date().toISOString()
  });
});

// Get All Shipments
app.get('/api/shipments', async (req, res) => {
  try {
    const shipments = await getAllShipments();
    res.json({
      success: true,
      count: shipments.length,
      data: shipments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get Single Shipment
app.get('/api/shipments/:id', async (req, res) => {
  try {
    const shipment = await getShipmentById(req.params.id);
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }
    res.json({
      success: true,
      data: shipment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Add New Shipment
app.post('/api/shipments', async (req, res) => {
  try {
    const shipment = await createShipment(req.body);
    res.status(201).json({
      success: true,
      message: 'Shipment Added Successfully',
      data: shipment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Update Shipment
app.put('/api/shipments/:id', async (req, res) => {
  try {
    const updatedShipment = await updateShipment(req.params.id, req.body);

    if (!updatedShipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    res.json({
      success: true,
      message: 'Shipment Updated Successfully',
      data: updatedShipment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Delete Shipment
app.delete('/api/shipments/:id', async (req, res) => {
  try {
    const shipment = await deleteShipment(req.params.id);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    res.json({
      success: true,
      message: 'Shipment Deleted Successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// AI-Based Risk Prediction Logic
app.get('/api/predict-risk/:traffic/:weather', (req, res) => {
  const traffic = req.params.traffic.toLowerCase();
  const weather = req.params.weather.toLowerCase();

  let risk = 'Low';
  let recommendation = 'Continue with planned route';
  let estimatedDelay = '0 Hours';

  const riskFactors = [];

  if (traffic === 'high') {
    risk = 'High';
    riskFactors.push('High traffic congestion detected');
    estimatedDelay = '3-4 Hours';
  } else if (traffic === 'medium') {
    risk = 'Medium';
    riskFactors.push('Moderate traffic conditions');
    estimatedDelay = '1-2 Hours';
  }

  if (weather === 'storm' || weather === 'heavy-rain') {
    risk = 'High';
    riskFactors.push('Severe weather conditions');
    estimatedDelay = '4-6 Hours';
    recommendation = 'Use alternate route immediately - Severe weather alert';
  } else if (weather === 'rain') {
    risk = risk === 'High' ? 'High' : 'Medium';
    riskFactors.push('Rainy conditions');
    estimatedDelay = '2-3 Hours';
    recommendation = risk === 'High'
      ? 'Use alternate route immediately'
      : 'Proceed with caution';
  } else if (weather === 'fog') {
    risk = risk === 'High' ? 'High' : 'Medium';
    riskFactors.push('Low visibility due to fog');
    estimatedDelay = '2-3 Hours';
  }

  res.json({
    success: true,
    traffic,
    weather,
    predictedRisk: risk,
    riskFactors,
    estimatedDelay,
    recommendation
  });
});

// Advanced Route Optimization
app.post('/api/optimize-route', (req, res) => {
  const { source, destination, currentTraffic, weatherCondition } = req.body;

  const routes = generateRouteOptions(source, destination, currentTraffic, weatherCondition);

  res.json({
    success: true,
    source,
    destination,
    recommendedRoute: routes[0],
    alternativeRoutes: routes.slice(1)
  });
});

function generateRouteOptions(source, destination, traffic, weather) {
  const routes = [
    {
      routeName: 'Primary Route (NH48)',
      distance: '340 km',
      estimatedTime: '6.5 hours',
      riskLevel: traffic === 'high' || weather === 'rain' ? 'High' : 'Low',
      description: 'Main highway route'
    },
    {
      routeName: 'Alternate Route (State Highway)',
      distance: '380 km',
      estimatedTime: '7.5 hours',
      riskLevel: 'Medium',
      description: 'Scenic route with less traffic'
    },
    {
      routeName: 'Express Highway',
      distance: '320 km',
      estimatedTime: '5.5 hours',
      riskLevel: 'Low',
      description: 'Fastest route with toll charges'
    }
  ];

  return routes.sort((a, b) => {
    const riskOrder = { 'Low': 0, 'Medium': 1, 'High': 2 };
    return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
  });
}

// Sample Dummy Data Insert Route
app.get('/api/sample-data', async (req, res) => {
  try {
    const sampleData = [
      {
        shipmentId: 'SC101',
        source: 'Chennai',
        destination: 'Bangalore',
        status: 'In Transit',
        expectedDelivery: '2026-04-20',
        currentLocation: 'Vellore',
        riskLevel: 'Low',
        weatherCondition: 'Clear',
        trafficLevel: 'Medium',
        recommendedRoute: 'NH48',
        estimatedDelay: '1 Hour'
      },
      {
        shipmentId: 'SC102',
        source: 'Mumbai',
        destination: 'Pune',
        status: 'Delayed',
        expectedDelivery: '2026-04-21',
        currentLocation: 'Lonavala',
        riskLevel: 'High',
        weatherCondition: 'Rain',
        trafficLevel: 'High',
        recommendedRoute: 'Express Highway Alternate',
        estimatedDelay: '4 Hours'
      },
      {
        shipmentId: 'SC103',
        source: 'Delhi',
        destination: 'Jaipur',
        status: 'In Transit',
        expectedDelivery: '2026-04-19',
        currentLocation: 'Gurgaon',
        riskLevel: 'Medium',
        weatherCondition: 'Fog',
        trafficLevel: 'High',
        recommendedRoute: 'NH48 via Dharuhera',
        estimatedDelay: '2 Hours'
      },
      {
        shipmentId: 'SC104',
        source: 'Hyderabad',
        destination: 'Vijayawada',
        status: 'On Time',
        expectedDelivery: '2026-04-18',
        currentLocation: 'Suryapet',
        riskLevel: 'Low',
        weatherCondition: 'Clear',
        trafficLevel: 'Low',
        recommendedRoute: 'NH65',
        estimatedDelay: '0 Hours'
      },
      {
        shipmentId: 'SC105',
        source: 'Kolkata',
        destination: 'Bhubaneswar',
        status: 'In Transit',
        expectedDelivery: '2026-04-22',
        currentLocation: 'Kharagpur',
        riskLevel: 'Medium',
        weatherCondition: 'Rain',
        trafficLevel: 'Medium',
        recommendedRoute: 'NH16',
        estimatedDelay: '2 Hours'
      }
    ];

    await deleteAllShipments();
    await insertSampleData(sampleData);

    res.json({
      success: true,
      message: 'Sample Data Inserted Successfully',
      count: sampleData.length,
      mode: useMockDB ? 'mock' : 'database'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Analytics Dashboard Data
app.get('/api/analytics', async (req, res) => {
  try {
    const totalShipments = await countShipments();
    const inTransit = await countShipments({ status: 'In Transit' });
    const delayed = await countShipments({ status: 'Delayed' });
    const onTime = await countShipments({ status: 'On Time' });
    const highRisk = await countShipments({ riskLevel: 'High' });
    const mediumRisk = await countShipments({ riskLevel: 'Medium' });
    const lowRisk = await countShipments({ riskLevel: 'Low' });

    res.json({
      success: true,
      data: {
        totalShipments,
        inTransit,
        delayed,
        onTime,
        riskSummary: {
          high: highRisk,
          medium: mediumRisk,
          low: lowRisk
        },
        performance: {
          onTimePercentage: totalShipments > 0 ? ((onTime / totalShipments) * 100).toFixed(1) : 0,
          delayedPercentage: totalShipments > 0 ? ((delayed / totalShipments) * 100).toFixed(1) : 0,
          inTransitPercentage: totalShipments > 0 ? ((inTransit / totalShipments) * 100).toFixed(1) : 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ===== AUTH ROUTES =====
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    const user = await createUser({ name, email, passwordHash: hashPassword(password) });
    const token = generateToken(user._id);
    mockTokens.set(token, user._id);
    res.status(201).json({ success: true, message: 'Account created', token, user: { name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const user = await findUserByEmail(email);
    if (!user || user.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const token = generateToken(user._id);
    mockTokens.set(token, user._id);
    res.json({ success: true, message: 'Login successful', token, user: { name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    const userId = mockTokens.get(token);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    const user = await getUserById(userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user: { name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Smart Supply Chain Server Running on Port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`\n📋 Available Endpoints:`);
  console.log(`   GET    /api/status        - API Status`);
  console.log(`   GET    /api/shipments     - List all shipments`);
  console.log(`   POST   /api/shipments     - Create new shipment`);
  console.log(`   PUT    /api/shipments/:id - Update shipment`);
  console.log(`   DELETE /api/shipments/:id - Delete shipment`);
  console.log(`   GET    /api/analytics     - Dashboard analytics`);
  console.log(`   GET    /api/predict-risk/:traffic/:weather - Risk prediction`);
  console.log(`   GET    /api/sample-data   - Load sample data\n`);
});

