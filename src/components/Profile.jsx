import React, { useState, useEffect } from 'react';

const Profile = ({ user, setUser }) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    location: user.location || '',
    availability: user.availability || '',
    isPublic: user.isPublic !== undefined ? user.isPublic : true
  });
  const [newSkillOffered, setNewSkillOffered] = useState('');
  const [newSkillWanted, setNewSkillWanted] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setMessage('Profile updated successfully!');
      } else {
        setMessage(data.message || 'Failed to update profile');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addSkillOffered = async () => {
    if (!newSkillOffered.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/skills/offered', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ skill: newSkillOffered.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        setUser({ ...user, skillsOffered: data.skillsOffered });
        setNewSkillOffered('');
        setMessage('Skill added successfully!');
      } else {
        setMessage(data.message || 'Failed to add skill');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    }
  };

  const removeSkillOffered = async (skill) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/skills/offered/${encodeURIComponent(skill)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setUser({ ...user, skillsOffered: data.skillsOffered });
        setMessage('Skill removed successfully!');
      } else {
        setMessage(data.message || 'Failed to remove skill');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    }
  };

  const addSkillWanted = async () => {
    if (!newSkillWanted.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/skills/wanted', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ skill: newSkillWanted.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        setUser({ ...user, skillsWanted: data.skillsWanted });
        setNewSkillWanted('');
        setMessage('Skill added successfully!');
      } else {
        setMessage(data.message || 'Failed to add skill');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    }
  };

  const removeSkillWanted = async (skill) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/skills/wanted/${encodeURIComponent(skill)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setUser({ ...user, skillsWanted: data.skillsWanted });
        setMessage('Skill removed successfully!');
      } else {
        setMessage(data.message || 'Failed to remove skill');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Profile Settings</h1>

      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.includes('successfully') 
            ? 'bg-green-100 border border-green-400 text-green-700'
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location (optional)</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., New York, NY"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Availability (optional)</label>
              <input
                type="text"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., Weekends, Evenings"
              />
            </div>

            <div className="form-group">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="form-label mb-0">Make profile public</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Skills Management */}
        <div className="space-y-6">
          {/* Skills Offered */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Skills You Offer</h3>
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkillOffered}
                  onChange={(e) => setNewSkillOffered(e.target.value)}
                  className="form-input flex-1"
                  placeholder="Add a skill you can teach"
                  onKeyPress={(e) => e.key === 'Enter' && addSkillOffered()}
                />
                <button
                  onClick={addSkillOffered}
                  className="btn btn-primary"
                >
                  Add
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {user.skillsOffered?.map((skill, index) => (
                <div key={index} className="flex items-center bg-gray-100 px-3 py-1 rounded">
                  <span className="text-gray-800">{skill}</span>
                  <button
                    onClick={() => removeSkillOffered(skill)}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Wanted */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Skills You Want</h3>
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkillWanted}
                  onChange={(e) => setNewSkillWanted(e.target.value)}
                  className="form-input flex-1"
                  placeholder="Add a skill you want to learn"
                  onKeyPress={(e) => e.key === 'Enter' && addSkillWanted()}
                />
                <button
                  onClick={addSkillWanted}
                  className="btn btn-primary"
                >
                  Add
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {user.skillsWanted?.map((skill, index) => (
                <div key={index} className="flex items-center bg-gray-100 px-3 py-1 rounded">
                  <span className="text-gray-800">{skill}</span>
                  <button
                    onClick={() => removeSkillWanted(skill)}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 