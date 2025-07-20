import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Clock, AlertTriangle, CheckCircle, Eye, Calendar, AlertCircle } from 'lucide-react';

const SquadProgress = () => {
  const [squads, setSquads] = useState([]);
  const [selectedSquad, setSelectedSquad] = useState(null);
  const [squadDetails, setSquadDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSquadProgress();
  }, []);

  const fetchSquadProgress = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/squad-progress', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSquads(data);
      } else {
        setError('Failed to fetch squad progress');
      }
    } catch (error) {
      setError('Error fetching squad progress');
    } finally {
      setLoading(false);
    }
  };

  const fetchSquadDetails = async (department) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/squad-progress/${encodeURIComponent(department)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSquadDetails(data);
        setSelectedSquad(department);
      }
    } catch (error) {
      setError('Error fetching squad details');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'text-green-600';
      case 'in_progress': return 'text-blue-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getEscalationColor = (level) => {
    switch (level) {
      case 'green': return 'bg-green-100 text-green-800';
      case 'yellow': return 'bg-yellow-100 text-yellow-800';
      case 'red': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysSinceAssignment = (complaint) => {
    if (!complaint.assignedTo) return null;
    
    // Find when the complaint was assigned (first timeline entry with assignment)
    const assignmentEntry = complaint.timeline?.find(t => 
      t.action.includes('assigned') || t.action.includes('Assigned')
    );
    
    if (!assignmentEntry) return null;
    
    const assignmentDate = new Date(assignmentEntry.timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - assignmentDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getWorkStatus = (complaint) => {
    if (complaint.status === 'resolved') return 'completed';
    if (complaint.status === 'in_progress') return 'in_progress';
    
    // Check if any work has been done (timeline entries beyond initial submission)
    const workEntries = complaint.timeline?.filter(t => 
      !t.action.includes('submitted') && !t.action.includes('Submitted')
    );
    
    if (!workEntries || workEntries.length === 0) return 'no_work';
    return 'some_work';
  };

  const getDaysColor = (days) => {
    if (days <= 3) return 'text-green-600';
    if (days <= 7) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading || !squads) return <div className="p-6">Loading squad progress...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Squad Progress Overview</h2>
        
        {squads.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            No squads found. Officials need to be assigned to departments.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {squads.map((squad) => (
              <div key={squad.department} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">{squad.department}</h3>
                  <button
                    onClick={() => fetchSquadDetails(squad.department)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    {squad.totalOfficials} officials
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-green-50 p-2 rounded">
                      <div className="font-semibold text-green-700">{squad.metrics.resolvedComplaints}</div>
                      <div className="text-green-600">Resolved</div>
                    </div>
                    <div className="bg-blue-50 p-2 rounded">
                      <div className="font-semibold text-blue-700">{squad.metrics.inProgressComplaints}</div>
                      <div className="text-blue-600">In Progress</div>
                    </div>
                    <div className="bg-yellow-50 p-2 rounded">
                      <div className="font-semibold text-yellow-700">{squad.metrics.pendingComplaints}</div>
                      <div className="text-yellow-600">Pending</div>
                    </div>
                    <div className="bg-purple-50 p-2 rounded">
                      <div className="font-semibold text-purple-700">{squad.metrics.resolutionRate}%</div>
                      <div className="text-purple-600">Success Rate</div>
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      Avg: {squad.metrics.avgResolutionDays} days
                    </div>
                    <div className="flex items-center text-gray-600">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Progress: {squad.metrics.avgProgress}%
                    </div>
                  </div>
                  
                  {/* Overdue and No Work Alerts */}
                  {(squad.metrics.totalOverdue > 0 || squad.metrics.totalNoWork > 0) && (
                    <div className="space-y-1">
                      {squad.metrics.totalOverdue > 0 && (
                        <div className="flex items-center text-xs text-red-600">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {squad.metrics.totalOverdue} overdue complaints
                        </div>
                      )}
                      {squad.metrics.totalNoWork > 0 && (
                        <div className="flex items-center text-xs text-orange-600">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {squad.metrics.totalNoWork} with no work started
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex gap-1">
                    {Object.entries(squad.escalationBreakdown).map(([level, count]) => (
                      count > 0 && (
                        <span key={level} className={`px-2 py-1 rounded text-xs ${getEscalationColor(level)}`}>
                          {level}: {count}
                        </span>
                      )
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Squad Details Modal */}
      {selectedSquad && squadDetails && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">{selectedSquad} Squad Details</h3>
            <button
              onClick={() => {
                setSelectedSquad(null);
                setSquadDetails(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          {/* Squad Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">{squadDetails.summary.totalOfficials}</div>
              <div className="text-blue-600">Officials</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{squadDetails.summary.resolvedComplaints}</div>
              <div className="text-green-600">Resolved</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">{squadDetails.summary.resolutionRate}%</div>
              <div className="text-purple-600">Success Rate</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-700">{squadDetails.summary.avgResolutionDays}</div>
              <div className="text-orange-600">Avg Days</div>
            </div>
          </div>
          
          {/* Additional Metrics */}
          {(squadDetails.summary.totalOverdue > 0 || squadDetails.summary.totalNoWork > 0) && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {squadDetails.summary.totalOverdue > 0 && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-700">{squadDetails.summary.totalOverdue}</div>
                  <div className="text-red-600">Overdue</div>
                </div>
              )}
              {squadDetails.summary.totalNoWork > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-700">{squadDetails.summary.totalNoWork}</div>
                  <div className="text-yellow-600">No Work Started</div>
                </div>
              )}
            </div>
          )}

          {/* Individual Official Metrics */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Individual Performance</h4>
            {squadDetails.officialMetrics.map((official) => (
              <div key={official.officialId} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h5 className="font-semibold">{official.officialName}</h5>
                    <p className="text-sm text-gray-600">{official.officialEmail}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{official.totalAssigned}</div>
                    <div className="text-sm text-gray-600">Total Assigned</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-green-600">{official.resolved}</div>
                    <div className="text-gray-600">Resolved</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-blue-600">{official.inProgress}</div>
                    <div className="text-gray-600">In Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-yellow-600">{official.pending}</div>
                    <div className="text-gray-600">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-purple-600">{official.avgResolutionDays}</div>
                    <div className="text-gray-600">Avg Days</div>
                  </div>
                </div>
                
                {/* Official Issues */}
                {(official.overdueComplaints > 0 || official.noWorkStarted > 0) && (
                  <div className="mt-3 space-y-1">
                    {official.overdueComplaints > 0 && (
                      <div className="p-2 bg-red-50 rounded">
                        <div className="text-sm text-red-800">
                          <AlertTriangle className="h-4 w-4 inline mr-1" />
                          {official.overdueComplaints} overdue complaints
                        </div>
                      </div>
                    )}
                    {official.noWorkStarted > 0 && (
                      <div className="p-2 bg-yellow-50 rounded">
                        <div className="text-sm text-yellow-800">
                          <AlertCircle className="h-4 w-4 inline mr-1" />
                          {official.noWorkStarted} complaints with no work started
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {official.currentWorkload > 0 && (
                  <div className="mt-3 p-2 bg-blue-50 rounded">
                    <div className="text-sm text-blue-800">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Current workload: {official.currentWorkload} active complaints
                    </div>
                  </div>
                )}
                
                {Object.keys(official.categoryBreakdown).length > 0 && (
                  <div className="mt-3">
                    <div className="text-sm font-medium text-gray-700 mb-1">Category Breakdown:</div>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(official.categoryBreakdown).map(([category, count]) => (
                        <span key={category} className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {category}: {count}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Recent Complaints with Assignment Days */}
          {squadDetails.recentComplaints.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-3">Recent Complaints</h4>
              <div className="space-y-2">
                {squadDetails.recentComplaints.map((complaint) => {
                  const daysSinceAssignment = getDaysSinceAssignment(complaint);
                  const workStatus = getWorkStatus(complaint);
                  
                  return (
                    <div key={complaint._id} className="border rounded p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{complaint.title}</div>
                          <div className="text-sm text-gray-600">
                            Assigned to: {complaint.assignedTo?.name}
                          </div>
                          {daysSinceAssignment !== null && (
                            <div className="flex items-center mt-1">
                              <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                              <span className={`text-xs ${getDaysColor(daysSinceAssignment)}`}>
                                {daysSinceAssignment} days since assignment
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(complaint.status)}`}>
                            {complaint.status.replace('_', ' ')}
                          </span>
                          {workStatus === 'no_work' && (
                            <div className="mt-1">
                              <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800 flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                No work started
                              </span>
                            </div>
                          )}
                          {complaint.progress > 0 && (
                            <div className="text-sm text-gray-600 mt-1">
                              Progress: {complaint.progress}%
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SquadProgress; 