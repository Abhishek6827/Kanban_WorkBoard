import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { login as apiLogin, logout as apiLogout, getCurrentUser, getUserAssignments, getAssignedBoards, setAuthToken } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [assignedBoards, setAssignedBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserData = useCallback(async (token) => {
    try {
      setAuthToken(token);
      const userData = await getCurrentUser();
      setUser(userData);
      const [userAssignments, userAssignedBoards] = await Promise.all([
        getUserAssignments(userData.id),
        getAssignedBoards(userData.id)
      ]);
      setAssignments(userAssignments);
      setAssignedBoards(userAssignedBoards);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setError(error.message || 'Failed to fetch user data. Please try logging in again.');
      localStorage.removeItem('token');
      setAuthToken(null);
      setUser(null);
      setAssignments([]);
      setAssignedBoards([]);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        await fetchUserData(token);
      }
      setLoading(false);
    };

    initAuth();
  }, [fetchUserData]);

  const login = async (username, password) => {
    try {
      const data = await apiLogin(username, password);
      if (data.token) {
        localStorage.setItem('token', data.token);
        await fetchUserData(data.token);
      }
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      if (error.response) {
        switch (error.response.status) {
          case 400:
            setError('Login failed: Invalid credentials. Please check your username and password.');
            break;
          case 401:
            setError('Login failed: Invalid credentials. Please check your username and password.');
            break;
          case 404:
            setError('Login failed: The login service is not available. Please contact support.');
            break;
          case 500:
            setError('Login failed: An internal server error occurred. Please try again later or contact support.');
            break;
          default:
            setError('Login failed: An unexpected error occurred. Please try again later.');
        }
      } else if (error.request) {
        setError('Login failed: No response from the server. Please check your internet connection.');
      } else {
        setError('Login failed: An unexpected error occurred. Please try again later.');
      }
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      setAssignments([]);
      setAssignedBoards([]);
      setAuthToken(null);
      localStorage.removeItem('token');
      setError(null);
    }
  };

  const updateUserData = useCallback(async () => {
    if (user) {
      try {
        const [userAssignments, userAssignedBoards] = await Promise.all([
          getUserAssignments(user.id),
          getAssignedBoards(user.id)
        ]);
        setAssignments(userAssignments);
        setAssignedBoards(userAssignedBoards);
        setError(null);
      } catch (error) {
        console.error('Failed to update user data:', error);
        setError('Failed to update user data. Please try again.');
      }
    }
  }, [user]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    assignments,
    assignedBoards,
    login,
    logout,
    loading,
    error,
    updateUserData,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;