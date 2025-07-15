import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const FollowButton = ({ userId, initialIsFollowing = false, className = '' }) => {
  const { isAuthenticated, user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  const checkFollowStatus = useCallback(async () => {
    if (!isAuthenticated || !userId) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/social/follow/check/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.isFollowing);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  }, [userId, isAuthenticated]);

  useEffect(() => {
    checkFollowStatus();
  }, [checkFollowStatus]);

  const handleFollow = async () => {
    if (!isAuthenticated) {
      // Could show login modal or redirect to login
      return;
    }

    // Prevent self-following
    if (user?.id === userId) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const method = isFollowing ? 'DELETE' : 'POST';
      const url = `${API_URL}/social/follow/${userId}`;

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(!isFollowing);
      } else {
        const errorData = await response.json();
        console.error('Follow error:', errorData.message);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setLoading(false);
    }
  };

  // Don't show follow button if user is viewing their own profile
  if (user?.id === userId) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleFollow}
      disabled={loading}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        isFollowing
          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      aria-label={isFollowing ? 'Unfollow this user' : 'Follow this user'}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {isFollowing ? 'Unfollowing...' : 'Following...'}
        </span>
      ) : (
        isFollowing ? 'Unfollow' : 'Follow'
      )}
    </button>
  );
};

export default FollowButton;