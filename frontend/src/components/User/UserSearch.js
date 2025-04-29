import React, { useState, useEffect } from 'react';
import { searchUsers, followUser, isFollowing } from '../services/api';
import './UserSearch.css';

const UserSearch = ({ currentUserId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followStatus, setFollowStatus] = useState({});

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!currentUserId) return;
      
      const status = {};
      for (const user of users) {
        status[user.id] = await isFollowing(currentUserId, user.id);
      }
      setFollowStatus(status);
    };

    if (users.length > 0) {
      checkFollowStatus();
    }
  }, [users, currentUserId]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const results = await searchUsers(searchQuery);
      setUsers(results);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    if (!currentUserId) return;
    
    try {
      await followUser(currentUserId, userId);
      setFollowStatus(prev => ({
        ...prev,
        [userId]: !prev[userId]
      }));
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  return (
    <div className="user-search">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users by name or email..."
          className="search-input"
        />
        <button type="submit" className="search-button" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      <div className="users-list">
        {users.map(user => (
          <div key={user.id} className="user-card">
            <img
              src={user.profileImage || 'https://via.placeholder.com/50'}
              alt={user.name}
              className="user-avatar"
            />
            <div className="user-info">
              <h3>{user.name}</h3>
              <p>{user.email}</p>
              <div className="user-stats">
                <span>{user.followersCount} followers</span>
                <span>{user.followingCount} following</span>
              </div>
            </div>
            <button
              onClick={() => handleFollow(user.id)}
              className={`follow-button ${followStatus[user.id] ? 'following' : ''}`}
            >
              {followStatus[user.id] ? 'Following' : 'Follow'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserSearch; 