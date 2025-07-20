# CityView360 - Civic Engagement Platform

A comprehensive civic engagement platform that enables citizens to report issues, track complaints, and engage with their community through modern web technologies.

## 🚀 Features

### Core Features
- **Complaint Management**: Submit, track, and manage civic complaints
- **Multi-role Support**: Citizen, Government Official, and Admin roles
- **File Upload**: Support for images, videos, and documents
- **Real-time Updates**: Live status tracking and notifications
- **AI-Powered Suggestions**: Intelligent category and tag suggestions

### Advanced Features (Newly Implemented)

#### 1. **Real-time Notification System**
- **Smart Notifications**: Status updates, escalations, and system alerts
- **Notification Center**: Centralized notification management with read/unread status
- **Push Notifications**: Real-time updates for complaint status changes
- **Notification Types**: Status updates, escalations, comments, system alerts, reminders

#### 2. **Advanced Analytics Dashboard**
- **Performance Metrics**: Resolution times, engagement scores, category breakdowns
- **Interactive Charts**: Monthly trends, status distributions, category analytics
- **Time-based Filtering**: 7-day, 30-day, and 90-day views
- **Engagement Scoring**: Citizen participation and contribution tracking
- **Real-time Statistics**: Live updates of complaint metrics

#### 3. **Community Engagement Hub**
- **Discussion Forums**: Community discussions on civic issues
- **Event Management**: Community events and participation tracking
- **Community Leaders**: Recognition system for active contributors
- **Search & Filter**: Advanced search and category filtering
- **Upvoting System**: Community-driven content ranking

#### 4. **Enhanced AI Chatbot Assistant**
- **Intelligent Responses**: Context-aware AI-powered assistance
- **Interactive Suggestions**: Quick action buttons for common tasks
- **Multi-modal Support**: Text, voice, and visual interactions
- **Real-time Processing**: Live response generation
- **Civic Knowledge Base**: City information and service guidance

#### 5. **Escalation Management**
- **Automated Escalation**: Time-based complaint escalation system
- **Priority Levels**: Green, Yellow, Red escalation status
- **Notification Alerts**: Automated escalation notifications
- **Performance Tracking**: Escalation metrics and response times

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Beautiful and consistent icon library
- **Custom Hooks**: Reusable state management and API integration

### Backend
- **Node.js**: Server-side JavaScript runtime
- **Express.js**: Fast, unopinionated web framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **JWT Authentication**: Secure token-based authentication
- **Multer**: File upload handling
- **bcryptjs**: Password hashing and security

### Key Libraries
- **React Router**: Client-side routing
- **Axios/Fetch**: HTTP client for API communication
- **Date-fns**: Date manipulation utilities
- **React Hook Form**: Form state management

## 📁 Project Structure

```
CV360/
├── backend/
│   ├── server.js              # Main server file
│   ├── package.json           # Backend dependencies
│   └── uploads/               # File upload directory
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Citizen/
│   │   │       ├── AnalyticsDashboard.jsx    # Analytics dashboard
│   │   │       ├── ChatbotAssistant.jsx      # AI chatbot
│   │   │       ├── CitizenDashboard.jsx      # Main dashboard
│   │   │       ├── CommunityHub.jsx          # Community features
│   │   │       ├── ComplaintCard.jsx         # Complaint display
│   │   │       ├── ComplaintDetails.jsx      # Detailed view
│   │   │       ├── ComplaintForm.jsx         # Submission form
│   │   │       ├── ComplaintList.jsx         # List view
│   │   │       ├── NotificationCenter.jsx    # Notification system
│   │   │       ├── NotificationToast.jsx     # Toast notifications
│   │   │       ├── Profile.jsx               # User profile
│   │   │       ├── Timeline.jsx              # Activity timeline
│   │   │       └── UpvoteButton.jsx          # Voting component
│   │   ├── hooks/
│   │   │   ├── useComplaints.js              # Complaint management
│   │   │   ├── useCommunity.js               # Community features
│   │   │   ├── useNotifications.js           # Notification system
│   │   │   └── useProfile.js                 # Profile management
│   │   ├── utils/
│   │   │   ├── api.js                        # API utilities
│   │   │   └── formatDate.js                 # Date formatting
│   │   ├── App.jsx                           # Main application
│   │   ├── main.jsx                          # Entry point
│   │   └── index.css                         # Global styles
│   ├── package.json                          # Frontend dependencies
│   └── tailwind.config.js                    # Tailwind configuration
└── README.md                                 # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CV360
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up MongoDB**
   - Ensure MongoDB is running on `localhost:27017`
   - The application will automatically create the `cityview360` database

5. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```
   The server will run on `http://localhost:5000`

6. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   The application will run on `http://localhost:5173`

### Demo Setup

The application includes demo data for testing:

1. **Access the demo setup endpoint**
   ```bash
   curl -X POST http://localhost:5000/api/demo/setup
   ```

2. **Demo User Credentials**
   - **Citizen**: `citizen123@gmail.com` / `citizen123`
   - **Government Official**: `gov_officer1@gmail.com` / `gov123`
   - **Admin**: `gov_supervisor1@gmail.com` / `govsupervise123`

## 🔧 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

### Complaints
- `GET /api/complaints` - Get complaints (with filters)
- `POST /api/complaints` - Create new complaint
- `GET /api/complaints/:id` - Get specific complaint
- `PUT /api/complaints/:id` - Update complaint
- `POST /api/complaints/:id/upvote` - Upvote complaint

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read

### Community
- `GET /api/community/discussions` - Get community discussions
- `POST /api/community/discussions` - Create new discussion
- `POST /api/community/discussions/:id/upvote` - Upvote discussion
- `GET /api/community/events` - Get community events
- `POST /api/community/events/:id/join` - Join/leave event

### Analytics
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/trends` - Get trend data
- `GET /api/public/stats` - Get public statistics

## 🎨 Key Features in Detail

### Notification System
The notification system provides real-time updates for:
- **Status Changes**: When complaint status is updated
- **Escalations**: When complaints are escalated due to time delays
- **Comments**: When officials add comments to complaints
- **System Alerts**: Important announcements and updates
- **Reminders**: Follow-up reminders for pending complaints

### Analytics Dashboard
Comprehensive analytics including:
- **Performance Metrics**: Resolution times, response rates
- **Engagement Tracking**: Citizen participation and contribution scores
- **Category Analysis**: Breakdown by complaint categories
- **Time-based Trends**: Monthly and quarterly performance trends
- **Interactive Visualizations**: Charts and graphs for data insights

### Community Hub
A social platform for civic engagement:
- **Discussion Forums**: Community-driven discussions on local issues
- **Event Management**: Community events and participation tracking
- **Leaderboards**: Recognition for active community members
- **Content Moderation**: Community guidelines and moderation tools
- **Search & Discovery**: Advanced search and filtering capabilities

### AI Chatbot Assistant
Intelligent assistance powered by AI:
- **Context Awareness**: Understands user intent and context
- **Quick Actions**: One-click actions for common tasks
- **Knowledge Base**: Access to city information and services
- **Multi-modal Support**: Text, voice, and visual interactions
- **Learning Capabilities**: Improves responses over time

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Role-based Access Control**: Different permissions for different user roles
- **File Upload Security**: File type and size validation
- **Input Validation**: Server-side validation for all inputs
- **CORS Configuration**: Proper cross-origin resource sharing setup

## 📱 Responsive Design

The application is fully responsive and works on:
- **Desktop**: Full-featured experience with all capabilities
- **Tablet**: Optimized layout for medium screens
- **Mobile**: Touch-friendly interface for smartphones
- **Progressive Web App**: Can be installed as a PWA

## 🚀 Deployment

### Environment Variables
Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cityview360
JWT_SECRET=your-secret-key-here
NODE_ENV=production
```

### Production Build
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation for common solutions

## 🔮 Future Enhancements

- **Mobile App**: Native iOS and Android applications
- **Advanced AI**: Machine learning for complaint categorization and routing
- **GIS Integration**: Geographic information system for location-based services
- **Multi-language Support**: Internationalization for diverse communities
- **Advanced Analytics**: Predictive analytics and trend forecasting
- **Integration APIs**: Third-party service integrations
- **Blockchain**: Transparent and immutable complaint tracking
- **Voice Interface**: Voice-activated complaint submission and tracking

---

**CityView360** - Empowering citizens through technology for better civic engagement and community development. 