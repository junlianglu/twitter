import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import { UserContext } from './UserContext';
import PublicFeed from './pages/PublicFeed';
import UserPosts from './pages/UserPosts';
import SinglePostView from './pages/SinglePostView';
import Profile from './pages/Profile';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';

const App = () => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  return (
    <div>
      {user ? (
        <>
          <Header />
          {/* Routes for authenticated users */}
          <Routes>
            <Route path="/" element={<PublicFeed />} />
            <Route path="/post/:postId" element={<SinglePostView />} />
            <Route path="/user/:userId" element={<UserPosts />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </>
      ) : (
        <>
          {/* Routes for unauthenticated users */}
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </>
      )}
    </div>
  );
};

export default App;