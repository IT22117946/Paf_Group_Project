import React from 'react';
import UserSearch from '../components/User/UserSearch';
import { useAuth } from '../contexts/AuthContext';

const UserSearchPage = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Please log in to search for users.</div>;
  }

  return (
    <div className="page-container">
      <h1>Find Users</h1>
      <UserSearch currentUserId={user.id} />
    </div>
  );
};

export default UserSearchPage; 