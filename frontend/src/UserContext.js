import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData)); // Save user data
    localStorage.setItem('token', userData.token); // Save token
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user'); // Remove user data
    localStorage.removeItem('token'); // Remove token
  };

  useEffect(() => {
    // Optional: Auto logout if token is missing
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};