import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/me/`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching current user:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/login/`, {
        username,
        password,
      });
      
      const { token, user_id, username: userUsername } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;
      
      setUser({ id: user_id, username: userUsername });
      toast.success('Login successful!');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      return false;
    }
  };

  const signup = async (username, email, password) => {
    try {
      // First create user via Django admin or custom endpoint
      // For now, we'll use a simple approach
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/signup/`, {
        username,
        email,
        password,
      });
      
      toast.success('Account created successfully! Please login.');
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      const message = error.response?.data?.error || 'Signup failed';
      toast.error(message);
      return false;
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/logout/`);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};