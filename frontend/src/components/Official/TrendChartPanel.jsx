import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock
} from 'lucide-react';

const TrendChartPanel = ({ complaints }) => {
  // Calculate category frequency
  const getCategoryFrequency = () => {
    const categoryCount = complaints.reduce((acc, complaint) => {
      acc[complaint.category] = (acc[complaint.category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 categories
  };

  // Calculate status distribution
  const getStatusDistribution = () => {
    const statusCount = complaints.reduce((acc, complaint) => {
      acc[complaint.status] = (acc[complaint.status] || 0) + 1;
      return acc;
    }, {});

    return [
      { status: 'pending', count: statusCount.pending || 0, color: 'bg-yellow-500', icon: Clock },
      { status: 'in_progress', count: statusCount.in_progress || 0, color: 'bg-blue-500', icon: AlertTriangle },
      { status: 'resolved', count: statusCount.resolved || 0, color: 'bg-green-500', icon: CheckCircle }
    ];
  };

  // Calculate daily resolution trends (last 7 days)
  const getDailyResolutionTrends = () => {
    const today = new Date();
    const last7Days = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      last7Days.push(date.toISOString().split('T')[0]);
    }

    const resolvedComplaints = complaints.filter(complaint => 
      complaint.status === 'resolved' && complaint.updatedAt
    );

    return last7Days.map(date => {
      const count = resolvedComplaints.filter(complaint => {
        const resolvedDate = new Date(complaint.updatedAt).toISOString().split('T')[0];
        return resolvedDate === date;
      }).length;

      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count
      };
    });
  };

  // Check for recurring issues
  const getRecurringIssues = () => {
    const issuePatterns = complaints.reduce((acc, complaint) => {
      const key = `${complaint.category}-${complaint.location?.zone || 'unknown'}`;
      if (!acc[key]) {
        acc[key] = {
          category: complaint.category,
          zone: complaint.location?.zone || 'Unknown',
          count: 0,
          unresolved: 0
        };
      }
      acc[key].count++;
      if (complaint.status !== 'resolved') {
        acc[key].unresolved++;
      }
      return acc;
    }, {});

    return Object.values(issuePatterns)
      .filter(pattern => pattern.count >= 3 && pattern.unresolved > 0)
      .sort((a, b) => b.unresolved - a.unresolved)
      .slice(0, 3);
  };

  const categoryFrequency = getCategoryFrequency();
  const statusDistribution = getStatusDistribution();
  const dailyTrends = getDailyResolutionTrends();
  const recurringIssues = getRecurringIssues();

  return (
    <div className="space-y-6">
      {/* Category Frequency Chart */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <BarChart3 className="h-4 w-4 mr-2 text-indigo-600" />
          Top Categories
        </h4>
        <div className="space-y-2">
          {categoryFrequency.map(({ category, count }) => (
            <div key={category} className="flex items-center justify-between">
              <span className="text-xs text-gray-600 capitalize">{category}</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${(count / complaints.length) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium text-gray-900 w-8 text-right">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Distribution */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Status Distribution</h4>
        <div className="space-y-2">
          {statusDistribution.map(({ status, count, color, icon: Icon }) => (
            <div key={status} className="flex items-center justify-between">
              <div className="flex items-center">
                <Icon className="h-3 w-3 mr-2 text-gray-400" />
                <span className="text-xs text-gray-600 capitalize">
                  {status.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${color} h-2 rounded-full`}
                    style={{ width: `${(count / complaints.length) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium text-gray-900 w-8 text-right">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Resolution Trends */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
          Daily Resolutions (7 days)
        </h4>
        <div className="flex items-end justify-between h-16">
          {dailyTrends.map(({ date, count }, index) => (
            <div key={index} className="flex flex-col items-center">
              <div 
                className="bg-green-500 rounded-t w-4 transition-all duration-300"
                style={{ height: `${Math.max(count * 8, 4)}px` }}
              ></div>
              <span className="text-xs text-gray-500 mt-1">{date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recurring Issues Alerts */}
      {recurringIssues.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
            Recurring Issues
          </h4>
          <div className="space-y-2">
            {recurringIssues.map((issue, index) => (
              <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-xs">
                <div className="font-medium text-red-800">
                  {issue.category} in {issue.zone}
                </div>
                <div className="text-red-600">
                  {issue.unresolved} of {issue.count} issues unresolved
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="text-center">
            <div className="text-lg font-bold text-indigo-600">{complaints.length}</div>
            <div className="text-gray-500">Total Complaints</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {complaints.filter(c => c.status === 'resolved').length}
            </div>
            <div className="text-gray-500">Resolved</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendChartPanel; 