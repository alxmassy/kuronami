// src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initAuth = () => {
      if (token) {
        console.log("Found a fake token, creating a fake user session.");
        setUser({ 
          id: 'mock-user-123', 
          name: 'Test User', 
          email: 'test@example.com',
          location: 'San Francisco, CA', // NEW
          photoUrl: 'https://i.pravatar.cc/150?u=test@example.com', // NEW
          isPublic: true, // NEW
          skillsOffered: ['Guitar', 'Cooking'],
          skillsWanted: ['React', 'Piano'],
        });
        // --- END MOCK DATA ---
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (credentials) => {
    console.log("Faking a successful login for:", credentials.email);
    const fakeToken = 'fake-jwt-for-testing';
    localStorage.setItem('token', fakeToken);
    setToken(fakeToken);
    setUser({ 
        id: 'mock-user-123', 
        name: 'Logged In User',
        email: credentials.email,
        location: 'San Francisco, CA', // NEW
        photoUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', // NEW
        isPublic: true, // NEW
        skillsOffered: ['Guitar', 'Cooking'],
        skillsWanted: ['React', 'Piano']
    });
  };

  const register = async (userData) => {
    console.log("Faking a successful registration for:", userData.name);
    const fakeToken = 'fake-jwt-for-testing';
    localStorage.setItem('token', fakeToken);
    setToken(fakeToken);
    setUser({ 
        id: 'mock-user-123', 
        name: userData.name, 
        email: userData.email,
        location: '', 
        photoUrl: '', 
        isPublic: true, 
        skillsOffered: [],
        skillsWanted: []
    });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };
  
  const updateUser = (updatedUserData) => {
      // This is now more important as it will update the profile in real-time on the page
      setUser(prevUser => ({...prevUser, ...updatedUserData}));
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);