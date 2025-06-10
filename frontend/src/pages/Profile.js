import React, { useContext } from 'react';
import { UserContext } from '../UserContext';
import ChangeAvatar from '../components/ChangeAvatar';
import './Profile.css';
import UserPosts from './UserPosts';

const Profile = () => {
  const { user } = useContext(UserContext);

  if (!user) return <div>Please log in to view your profile.</div>;

  return (
    <div className="profile-root">
      <div className="profile-section">
        <div className="profile-banner"></div>
        <div className="profile-card">
          <div className="profile-avatar-row">
            <div className="profile-avatar-container">
              <ChangeAvatar />
            </div>
          </div>
          <div className="profile-info">
            <h3 className="profile-name">{user.name}</h3>
            <div className="profile-username">@{user.username}</div>
          </div>
        </div>
      </div>
      <div className="profile-posts-main">
        <div className="profile-posts-section">
          <UserPosts userId={user.id} hideHeader />
        </div>
      </div>
    </div>
  );
};

export default Profile;