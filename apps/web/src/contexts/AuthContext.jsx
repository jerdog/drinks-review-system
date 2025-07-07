import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

/**
 * Authentication context for managing user state
 */
const AuthContext = createContext();

/**
 * Authentication provider component
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check if user is logged in on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * Check authentication status from API
   */
  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:3001/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('authToken');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login with email and password
   */
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        toast.success('Welcome back!');
        navigate('/dashboard');
        return { success: true };
      } else {
        toast.error(data.message || 'Login failed');
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return { success: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register new user
   */
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        toast.success('Account created successfully!');
        navigate('/dashboard');
        return { success: true };
      } else {
        toast.error(data.message || 'Registration failed');
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
      return { success: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Social login (Google/GitHub)
   */
  const socialLogin = async (provider) => {
    try {
      // Redirect to OAuth provider
      window.location.href = `http://localhost:3001/auth/${provider}`;
    } catch (error) {
      console.error('Social login error:', error);
      toast.error('Social login failed. Please try again.');
    }
  };

  /**
   * Logout user
   */
  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
    navigate('/');
  };

  /**
   * Update user profile
   */
  const updateProfile = async (profileData) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3001/users/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data);
        toast.success('Profile updated successfully!');
        return { success: true };
      } else {
        toast.error(data.message || 'Profile update failed');
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Profile update failed. Please try again.');
      return { success: false, error: 'Network error' };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    socialLogin,
    logout,
    updateProfile,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use authentication context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}