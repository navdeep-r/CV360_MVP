import React, { useState, useEffect, useContext, createContext } from 'react';
import { 
  User, 
  Shield, 
  Settings, 
  MapPin, 
  Upload, 
  Search, 
  Filter,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Users,
  FileText,
  Camera,
  ThumbsUp,
  MessageSquare,
  Eye,
  Home,
  PlusCircle,
  Bell,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Globe
} from 'lucide-react';
import CitizenDashboard from './components/Citizen/CitizenDashboard';
import ComplaintForm from './components/Citizen/ComplaintForm';
import ComplaintList from './components/Citizen/ComplaintList';
import ComplaintDetails from './components/Citizen/ComplaintDetails';
import Profile from './components/Citizen/Profile';
import ChatbotAssistant from './components/Citizen/ChatbotAssistant';
import NotificationToast from './components/Citizen/NotificationToast';
import NotificationCenter from './components/Citizen/NotificationCenter';
import AnalyticsDashboard from './components/Citizen/AnalyticsDashboard';
import CommunityHub from './components/Citizen/CommunityHub';
import OfficialDashboard from './components/Official/OfficialDashboard';
import AssignedComplaints from './components/Official/AssignedComplaints';
import AllComplaints from './components/Official/AllComplaints';
import SquadManagement from './components/Official/SquadManagement';
import TaskManagement from './components/Official/TaskManagement';
import AdminDashboard from './components/Admin/AdminDashboard';
import PublicInterface from './components/Public/PublicInterface';
import { ComplaintsProvider, useComplaintsContext } from './context/ComplaintsContext';

// Context for authentication
const AuthContext = createContext();

// API service
const API_BASE = 'http://localhost:5000/api';

const apiService = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  },

  async login(credentials) {
    return this.request('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async register(userData) {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async getComplaints(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/complaints${query ? `?${query}` : ''}`);
  },

  async getComplaint(id) {
    return this.request(`/complaints/${id}`);
  },

  async createComplaint(formData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/complaints`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  },

  async updateComplaint(id, data) {
    return this.request(`/complaints/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async upvoteComplaint(id) {
    return this.request(`/complaints/${id}/upvote`, {
      method: 'POST',
    });
  },

  async getDashboardStats() {
    return this.request('/dashboard/stats');
  },

  async getPublicStats() {
    return this.request('/public/stats');
  },

  async setupDemo() {
    return this.request('/demo/setup', {
      method: 'POST',
    });
  },
};

// Auth Provider Component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await apiService.login(credentials);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const register = async (userData) => {
    try {
      const response = await apiService.register(userData);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Login Component
const Login = ({ onShowPublic }) => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  // Demo user creation function
  const createDemoUser = async () => {
    try {
      const demoUser = {
        name: 'John',
        email: 'citizen123@gmail.com',
        password: 'citizen123',
        role: 'citizen'
      };
      
      await register(demoUser);
      alert('Demo user created successfully! You can now log in with citizen123@gmail.com / citizen123');
    } catch (error) {
      console.log('Registration error:', error.message);
      if (error.message.includes('already exists') || error.message.includes('400') || error.message.includes('Bad Request')) {
        // Try to login instead
        try {
          await login({ email: 'citizen123@gmail.com', password: 'citizen123' });
          alert('Demo user already exists! Logged in successfully.');
        } catch (loginError) {
          console.log('Login error:', loginError.message);
          alert('Demo user exists but login failed. Please try logging in manually with citizen123@gmail.com / citizen123');
        }
      } else {
        alert('Error creating demo user: ' + error.message);
      }
    }
  };

  // Demo setup function to create squads and team users
  const setupDemoTeams = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/demo/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to setup demo teams');
      }

      const result = await response.json();
      
      alert('Demo setup completed successfully! You can now log in with:\n\n' +
            'Citizen: citizen123@gmail.com / citizen123\n' +
            'Official: gov_officer1@gmail.com / gov123\n' +
            'Supervisor: gov_supervisor1@gmail.com / govsupervise123');
    } catch (error) {
      console.error('Demo setup error:', error);
      alert('Error setting up demo teams: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const credentials = {
      email: formData.get('email'),
      password: formData.get('password'),
    };

    if (!isLogin) {
      credentials.name = formData.get('name');
      credentials.role = formData.get('role');
    }

    try {
      if (isLogin) {
        await login(credentials);
      } else {
        await register(credentials);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Sign in to your account' : 'Create new account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
          <div className="mt-4 space-y-2">
            <button
              onClick={onShowPublic}
              className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100"
            >
              <Globe className="h-4 w-4 mr-2" />
              View Public Dashboard
            </button>
            <button
              type="button"
              onClick={createDemoUser}
              className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100"
            >
              Create Demo User
            </button>
            <button
              type="button"
              onClick={setupDemoTeams}
              className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100"
            >
              Setup Demo Teams
            </button>
          </div>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="sr-only">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Full name"
                />
              </div>
            )}
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${
                  isLogin ? 'rounded-t-md' : ''
                } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
            {!isLogin && (
              <div>
                <label htmlFor="role" className="sr-only">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                >
                  <option value="citizen">Citizen</option>
                  <option value="official">Official</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLogin ? 'Sign in' : 'Sign up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add this function before the App component
const renderAdminContent = () => {
  return <AdminDashboard />;
};

// Add CitizenNavbar component
const CitizenNavbar = ({ currentView, setCurrentView, onLogout, user }) => {
  const navItems = [
    { name: 'Dashboard', key: 'dashboard' },
    { name: 'Analytics', key: 'analytics' },
    { name: 'Community Hub', key: 'community' },
    { name: 'Submit Complaint', key: 'submit' },
    { name: 'My Complaints', key: 'my-complaints' },
    { name: 'Profile', key: 'profile' },
  ];
  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold text-indigo-700">CityView360</span>
          <span className="text-gray-400">|</span>
          <span className="font-medium text-gray-700">Citizen Portal</span>
        </div>
        <div className="flex gap-6">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => setCurrentView(item.key)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === item.key
                  ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="font-semibold text-gray-800">{user?.name || 'Citizen'}</div>
          </div>
          <button
            onClick={onLogout}
            className="ml-2 px-3 py-1 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

// Main App Component
const App = ({ onShowPublic }) => {
  const { user, loading, logout } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const { createComplaint, complaints, upvoteComplaint } = useComplaintsContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Login onShowPublic={onShowPublic} />;
  }

  if (user.role === 'admin' || user.role === 'supervisor') {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto py-8 px-4">
          {renderAdminContent()}
        </main>
      </div>
    );
  }

  // Navigation for citizen
  const citizenNav = [
    { name: 'Dashboard', key: 'dashboard' },
    { name: 'Analytics', key: 'analytics' },
    { name: 'Community Hub', key: 'community' },
    { name: 'Submit Complaint', key: 'submit' },
    { name: 'My Complaints', key: 'my-complaints' },
    { name: 'Profile', key: 'profile' },
  ];

  const renderCitizenContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <CitizenDashboard onNavigate={setCurrentView} />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'community':
        return <CommunityHub />;
      case 'submit':
        return <ComplaintForm 
          onClose={() => setCurrentView('dashboard')}
          onSuccess={() => {
            setToast({ message: 'Complaint submitted successfully!', type: 'success' });
            setCurrentView('dashboard'); // Navigate back to dashboard after submission
          }}
        />;
      case 'my-complaints':
        return <ComplaintList onView={setSelectedComplaint} onNavigate={setCurrentView} />;
      case 'profile':
        return <Profile onNavigate={setCurrentView} />;
      default:
        return <CitizenDashboard onNavigate={setCurrentView} />;
    }
  };

  const renderOfficialContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <OfficialDashboard onLogout={logout} />;
      case 'tasks':
        return <TaskManagement />;
      case 'assigned':
        return <AssignedComplaints />;
      case 'all-complaints':
        return <AllComplaints />;
      default:
        return <OfficialDashboard onLogout={logout} />;
    }
  };

  if (user.role === 'citizen') {
    return (
      <div className="min-h-screen bg-gray-50">
        <CitizenNavbar currentView={currentView} setCurrentView={setCurrentView} onLogout={logout} user={user} />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {selectedComplaint ? (
              <ComplaintDetails 
                complaint={selectedComplaint} 
                onUpvote={async (complaintId) => {
                  try {
                    await upvoteComplaint(complaintId);
                    setToast({ message: 'Upvoted successfully!', type: 'success' });
                  } catch (error) {
                    setToast({ message: 'Failed to upvote: ' + error.message, type: 'error' });
                  }
                }}
                onBack={() => setSelectedComplaint(null)}
                allComplaints={complaints}
                onViewComplaint={(complaint) => {
                  setSelectedComplaint(complaint);
                }}
              />
            ) : (
              renderCitizenContent()
            )}
          </div>
        </main>
        <ChatbotAssistant />
        <NotificationToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'info' })}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Remove the duplicate navigation buttons since they're now in the main nav */}
        <div className="px-4 py-6 sm:px-0">
          {selectedComplaint ? (
            <ComplaintDetails 
              complaint={selectedComplaint} 
              onUpvote={async (complaintId) => {
                try {
                  await upvoteComplaint(complaintId);
                  setToast({ message: 'Upvoted successfully!', type: 'success' });
                } catch (error) {
                  setToast({ message: 'Failed to upvote: ' + error.message, type: 'error' });
                }
              }}
              onBack={() => setSelectedComplaint(null)}
              allComplaints={complaints}
              onViewComplaint={(complaint) => {
                setSelectedComplaint(complaint);
              }}
            />
          ) : (
            user.role === 'citizen' ? renderCitizenContent() : 
            user.role === 'official' ? renderOfficialContent() : (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome, {user.name}!</h2>
                <p className="text-gray-600">Dashboard for {user.role} role is coming soon.</p>
              </div>
            )
          )}
        </div>
      </main>
      <ChatbotAssistant />
      <NotificationToast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'info' })}
      />
    </div>
  );
};

// Main App with Auth Provider and Complaints Provider
const CityView360 = () => {
  const [showPublic, setShowPublic] = useState(false);

  // If showing public interface, render it outside of providers
  if (showPublic) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-xl font-bold text-indigo-600">CityView 360 - Public Dashboard</h1>
              <button
                onClick={() => setShowPublic(false)}
                className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
        <PublicInterface />
      </div>
    );
  }

  return (
    <AuthProvider>
      <ComplaintsProvider>
        <App onShowPublic={() => setShowPublic(true)} />
      </ComplaintsProvider>
    </AuthProvider>
  );
};

export default CityView360; 