// src/components/posts/PostHeader.js
import React from 'react';
import { FaRetweet } from 'react-icons/fa';

const PostHeader = ({ user, createdAt, formatDate }) => {
  if (!user) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
      <img
        src={user.avatar}
        alt="avatar"
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          marginRight: '10px',
          objectFit: 'cover',
          cursor: 'pointer',
        }}
        onClick={(e) => {
          e.stopPropagation();
          window.location.href = `/user/${user.id}`;
        }}
      />
      <div
        style={{ cursor: 'pointer' }}
        onClick={(e) => {
          e.stopPropagation();
          window.location.href = `/user/${user.id}`;
        }}
      >
        <strong>{user.name}</strong> <small style={{ color: '#666' }}>@{user.username}</small> · <small style={{ color: '#666' }}>{formatDate(createdAt)}</small>
      </div>
    </div>
  );
};

export default PostHeader;