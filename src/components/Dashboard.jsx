import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    pendingRequests: 0,
    acceptedRequests: 0,
    completedSwaps: 0,
    totalRating: 0
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/swaps/my-requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const requests = data.swapRequests;

        // Calculate stats
        const pending = requests.filter(r => r.status === 'pending').length;
        const accepted = requests.filter(r => r.status === 'accepted').length;
        const completed = requests.filter(r => r.status === 'completed').length;

        setStats({
          pendingRequests: pending,
          acceptedRequests: accepted,
          completedSwaps: completed,
          totalRating: user.rating || 0
        });

        // Get recent requests (last 5)
        setRecentRequests(requests.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Pending Requests</h3>
          <p className="text-3xl font-bold text-gray-800">{stats.pendingRequests}</p>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Accepted Requests</h3>
          <p className="text-3xl font-bold text-gray-800">{stats.acceptedRequests}</p>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Completed Swaps</h3>
          <p className="text-3xl font-bold text-gray-800">{stats.completedSwaps}</p>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Your Rating</h3>
          <p className="text-3xl font-bold text-gray-800">
            {stats.totalRating > 0 ? `${stats.totalRating}/5` : 'No ratings yet'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Summary */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Summary</h2>
          <div className="space-y-3">
            <div>
              <span className="font-medium text-gray-600">Name:</span>
              <span className="ml-2 text-gray-800">{user.name}</span>
            </div>
            {user.location && (
              <div>
                <span className="font-medium text-gray-600">Location:</span>
                <span className="ml-2 text-gray-800">{user.location}</span>
              </div>
            )}
            <div>
              <span className="font-medium text-gray-600">Skills Offered:</span>
              <span className="ml-2 text-gray-800">{user.skillsOffered?.length || 0}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Skills Wanted:</span>
              <span className="ml-2 text-gray-800">{user.skillsWanted?.length || 0}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Profile Status:</span>
              <span className={`ml-2 ${user.isPublic ? 'text-green-600' : 'text-red-600'}`}>
                {user.isPublic ? 'Public' : 'Private'}
              </span>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/profile" className="btn btn-primary">
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
          {recentRequests.length > 0 ? (
            <div className="space-y-3">
              {recentRequests.map((request) => (
                <div key={request._id} className="border-b border-gray-200 pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">
                        {request.fromUser._id === user._id 
                          ? `To: ${request.toUser.name}`
                          : `From: ${request.fromUser.name}`
                        }
                      </p>
                      <p className="text-sm text-gray-600">{request.message}</p>
                    </div>
                    <span className={`badge badge-${request.status}`}>
                      {request.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No recent activity</p>
          )}
          <div className="mt-4">
            <Link to="/requests" className="btn btn-secondary">
              View All Requests
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/discover" className="btn btn-primary">
            Discover Skills
          </Link>
          <Link to="/profile" className="btn btn-secondary">
            Update Profile
          </Link>
          <Link to="/requests" className="btn btn-secondary">
            View Requests
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 