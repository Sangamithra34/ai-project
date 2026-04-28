# 🚛 Smart Supply Chains - AI-Powered Resilient Logistics

A full-stack prototype for AI-driven dynamic supply chain optimization with predictive analytics, risk management, and real-time route optimization.

## ✨ Features

- **Shipment Management**: Full CRUD operations for shipments
- **AI Risk Prediction**: Predict risk levels based on traffic and weather
- **Route Optimization**: Intelligent route recommendations based on conditions
- **Real-time Dashboard**: Interactive web interface with analytics
- **Mock Database Mode**: Works without MongoDB for instant prototyping
- **MongoDB Support**: Full database persistence when connected

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (optional - mock mode works without it)

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Server

```bash
npm start
```

The server will start on port 5000. Open your browser to:
```
http://localhost:5000
```

## 📊 Dashboard

The interactive dashboard provides:
- **Analytics Cards**: Total shipments, status breakdown, risk summary
- **Shipment Table**: View all shipments with status and risk badges
- **Add Shipment**: Create new shipments with full details
- **Risk Prediction**: AI-powered risk analysis based on traffic/weather
- **Route Optimization**: Get intelligent route recommendations

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/status` | API status and database mode |
| GET | `/api/shipments` | List all shipments |
| GET | `/api/shipments/:id` | Get single shipment |
| POST | `/api/shipments` | Create new shipment |
| PUT | `/api/shipments/:id` | Update shipment |
| DELETE | `/api/shipments/:id` | Delete shipment |
| GET | `/api/analytics` | Dashboard analytics |
| GET | `/api/predict-risk/:traffic/:weather` | AI risk prediction |
| POST | `/api/optimize-route` | Route optimization |
| GET | `/api/sample-data` | Load sample data |

## 🗄️ Database Options

### Option 1: Mock Database (Default - No Setup Required)
The application automatically uses an in-memory mock database when MongoDB is not available. Perfect for prototyping and demonstrations. **Note:** Data will not persist between server restarts.

### Option 2: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service
3. The app connects automatically to `mongodb://127.0.0.1:27017/smart_supply_chain`

### Option 3: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Update `.env` file:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart_supply_chain
PORT=5000
```

## 🧪 Testing the API

### Get API Status
```bash
curl http://localhost:5000/api/status
```

### Get All Shipments
```bash
curl http://localhost:5000/api/shipments
```

### Add New Shipment
```bash
curl -X POST http://localhost:5000/api/shipments \
  -H "Content-Type: application/json" \
  -d '{
    "shipmentId": "SC106",
    "source": "Chennai",
    "destination": "Coimbatore",
    "status": "In Transit",
    "riskLevel": "Low",
    "weatherCondition": "Clear",
    "trafficLevel": "Medium"
  }'
```

### Predict Risk
```bash
curl http://localhost:5000/api/predict-risk/high/rain
```

### Load Sample Data
```bash
curl http://localhost:5000/api/sample-data
```

## 📁 Project Structure

```
smart-supply-chain/
├── server.js          # Main server file (backend + API)
├── public/
│   └── index.html     # Interactive dashboard (frontend)
├── package.json       # Dependencies and scripts
├── .env               # Environment variables (optional)
└── README.md          # This file
```

## 🛠️ Development

### Run in Development Mode (with auto-restart)
```bash
npm run dev
```

### Environment Variables
Create a `.env` file to customize:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/smart_supply_chain
```

## 📝 Sample Data

The application comes with 5 pre-loaded sample shipments:
- **SC101**: Chennai → Bangalore (In Transit, Low Risk)
- **SC102**: Mumbai → Pune (Delayed, High Risk)
- **SC103**: Delhi → Jaipur (In Transit, Medium Risk)
- **SC104**: Hyderabad → Vijayawada (On Time, Low Risk)
- **SC105**: Kolkata → Bhubaneswar (In Transit, Medium Risk)

## 🤖 AI Risk Prediction

The risk prediction algorithm considers:
- **Traffic Levels**: Low, Medium, High
- **Weather Conditions**: Clear, Rain, Fog, Storm, Heavy Rain
- **Risk Outputs**: Low, Medium, High
- **Recommendations**: Route suggestions based on risk level

## 🎨 Dashboard Features

- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: Data refreshes automatically
- **Status Badges**: Color-coded status indicators
- **Risk Indicators**: Visual risk level badges
- **Interactive Forms**: Add and edit shipments
- **Analytics Cards**: Summary statistics at a glance

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 🤝 Contributing

This is a prototype project. Feel free to fork and extend with:
- Real-time tracking integration
- Machine learning models for risk prediction
- Third-party weather/traffic APIs
- Authentication and user management
- Multi-warehouse support

