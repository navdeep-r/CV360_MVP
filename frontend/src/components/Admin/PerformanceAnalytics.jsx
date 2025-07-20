import React, { useEffect, useState } from 'react';

const PerformanceAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        setError('Failed to fetch analytics');
      }
    } catch (err) {
      setError('Error fetching analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading analytics...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!data) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Performance Analytics</h2>
      {/* Department-wise resolution times */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Department-wise Avg. Resolution Time (days)</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Avg. Days</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Resolved</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.deptResolution.map((row, i) => (
                <tr key={i}>
                  <td className="px-4 py-2 whitespace-nowrap">{row._id || '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{row.avgResolutionDays?.toFixed(2)}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Category-wise complaint volume */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Category-wise Complaint Volume</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Count</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.categoryVolume.map((row, i) => (
                <tr key={i}>
                  <td className="px-4 py-2 whitespace-nowrap">{row._id}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Top performing officials */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Top Performing Officials (Avg. Resolution Time)</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Official</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Avg. Days</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Resolved</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.topOfficials.map((row, i) => (
                <tr key={i}>
                  <td className="px-4 py-2 whitespace-nowrap">{row.official?.name || '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{row.official?.email || '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{row.avgResolutionDays?.toFixed(2)}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{row.resolvedCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalytics; 