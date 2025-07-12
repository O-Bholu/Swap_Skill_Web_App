import React, { useState, useEffect } from 'react';

const Discover = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [swapForm, setSwapForm] = useState({
    message: '',
    skillsOffered: [],
    skillsRequested: []
  });

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, selectedSkill]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = 'http://localhost:5000/api/users/discover';
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (selectedSkill) params.append('skill', selectedSkill);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwapRequest = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/swaps/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          toUserId: selectedUser._id,
          message: swapForm.message,
          skillsOffered: swapForm.skillsOffered,
          skillsRequested: swapForm.skillsRequested
        })
      });

      const data = await response.json();

      if (response.ok) {
        setShowSwapModal(false);
        setSelectedUser(null);
        setSwapForm({
          message: '',
          skillsOffered: [],
          skillsRequested: []
        });
        alert('Swap request sent successfully!');
      } else {
        alert(data.message || 'Failed to send swap request');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    }
  };

  const openSwapModal = (user) => {
    setSelectedUser(user);
    setShowSwapModal(true);
  };

  const addSkillToForm = (skill, type) => {
    setSwapForm(prev => ({
      ...prev,
      [type]: [...prev[type], skill]
    }));
  };

  const removeSkillFromForm = (skill, type) => {
    setSwapForm(prev => ({
      ...prev,
      [type]: prev[type].filter(s => s !== skill)
    }));
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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Discover Skills</h1>

      {/* Search and Filter */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Search by name or skill</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              placeholder="Search users..."
            />
          </div>
          <div>
            <label className="form-label">Filter by specific skill</label>
            <input
              type="text"
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="form-input"
              placeholder="e.g., Photoshop, Excel"
            />
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div key={user._id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{user.name}</h3>
                {user.location && (
                  <p className="text-sm text-gray-600">{user.location}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Rating</div>
                <div className="font-semibold text-gray-800">
                  {user.rating > 0 ? `${user.rating}/5` : 'No ratings'}
                </div>
              </div>
            </div>

            {user.availability && (
              <div className="mb-3">
                <span className="text-sm font-medium text-gray-600">Availability: </span>
                <span className="text-sm text-gray-800">{user.availability}</span>
              </div>
            )}

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Skills Offered:</h4>
              <div className="flex flex-wrap gap-1">
                {user.skillsOffered?.slice(0, 3).map((skill, index) => (
                  <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                    {skill}
                  </span>
                ))}
                {user.skillsOffered?.length > 3 && (
                  <span className="text-xs text-gray-500">+{user.skillsOffered.length - 3} more</span>
                )}
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Skills Wanted:</h4>
              <div className="flex flex-wrap gap-1">
                {user.skillsWanted?.slice(0, 3).map((skill, index) => (
                  <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                    {skill}
                  </span>
                ))}
                {user.skillsWanted?.length > 3 && (
                  <span className="text-xs text-gray-500">+{user.skillsWanted.length - 3} more</span>
                )}
              </div>
            </div>

            <button
              onClick={() => openSwapModal(user)}
              className="btn btn-primary w-full"
            >
              Send Swap Request
            </button>
          </div>
        ))}
      </div>

      {users.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-600">No users found matching your criteria.</p>
        </div>
      )}

      {/* Swap Request Modal */}
      {showSwapModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Send Swap Request to {selectedUser.name}
              </h2>

              <form onSubmit={handleSwapRequest}>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea
                    value={swapForm.message}
                    onChange={(e) => setSwapForm({...swapForm, message: e.target.value})}
                    className="form-input"
                    rows="3"
                    placeholder="Introduce yourself and explain what you'd like to swap..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Skills You're Offering</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {user.skillsOffered?.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => addSkillToForm(skill, 'skillsOffered')}
                        className={`text-xs px-2 py-1 rounded ${
                          swapForm.skillsOffered.includes(skill)
                            ? 'bg-gray-300 text-gray-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {swapForm.skillsOffered.map((skill) => (
                      <span key={skill} className="text-xs bg-blue-100 px-2 py-1 rounded text-blue-700">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkillFromForm(skill, 'skillsOffered')}
                          className="ml-1 text-blue-500 hover:text-blue-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Skills You Want</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedUser.skillsOffered?.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => addSkillToForm(skill, 'skillsRequested')}
                        className={`text-xs px-2 py-1 rounded ${
                          swapForm.skillsRequested.includes(skill)
                            ? 'bg-gray-300 text-gray-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {swapForm.skillsRequested.map((skill) => (
                      <span key={skill} className="text-xs bg-green-100 px-2 py-1 rounded text-green-700">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkillFromForm(skill, 'skillsRequested')}
                          className="ml-1 text-green-500 hover:text-green-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                  >
                    Send Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSwapModal(false)}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Discover; 