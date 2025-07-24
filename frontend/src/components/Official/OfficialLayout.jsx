import React from 'react';

const tabs = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'live', label: 'Live Complaints' },
  { key: 'complaints', label: 'Complaints' },
  { key: 'insights', label: 'Insights' },
  { key: 'notifications', label: 'Notifications' },
];

const OfficialLayout = ({ currentTab, setCurrentTab, user, region, onLogout, children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav Bar */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Left: Logo/Title */}
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold text-indigo-700">CityView360</span>
            <span className="text-gray-400">|</span>
            <span className="font-medium text-gray-700">Official Portal</span>
          </div>
          {/* Center: Tabs */}
          <div className="flex gap-6">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setCurrentTab(tab.key)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentTab === tab.key
                    ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {/* Right: Profile & Region */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-semibold text-gray-800">{user?.name || 'Official'}</div>
              <div className="text-xs text-gray-500">{region || 'Region'}</div>
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
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4">
        {children}
      </main>
    </div>
  );
};

export default OfficialLayout; 