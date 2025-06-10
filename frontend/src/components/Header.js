import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  return (
    <header className="header-root">
    <div
        className="header-logo"
        onClick={() => navigate('/')}
        title="Go to home"
    >
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 4h24c1.1 0 2 .9 2 2v16c0 1.1-.9 2-2 2H8l-6 6V6c0-1.1.9-2 2-2z"
        fill="#FFFFFF"
      />
    </svg>

      <span
        className="header-twitter-text"
      >
        Social Media Platform
      </span>
    </div>
      <div className="header-right">
        <div
          onClick={() => navigate('/profile')}
          className="header-profile"
          title="View profile"
        >
          <img
            src={user.avatar}
            alt="profile"
            className="header-avatar"
          />
          <span className="header-username">{user.name}</span>
        </div>
        <button onClick={logout} className="header-logout">Logout</button>
      </div>
    </header>
  );
};

export default Header;