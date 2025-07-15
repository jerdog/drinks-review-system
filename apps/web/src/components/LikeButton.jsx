import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const LikeButton = ({ reviewId, initialLikes = 0, initialHasLiked = false }) => {
  const { isAuthenticated } = useAuth();
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(initialHasLiked);
  const [loading, setLoading] = useState(false);

  const checkLikeStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/social/like/check/${reviewId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setHasLiked(data.hasLiked);
      }
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  }, [reviewId]);

  useEffect(() => {
    if (isAuthenticated) {
      checkLikeStatus();
    }
  }, [isAuthenticated, checkLikeStatus]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      // Could show login modal or redirect to login
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const method = hasLiked ? 'DELETE' : 'POST';
      const url = `${API_URL}/social/like/${reviewId}`;

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();

        if (hasLiked) {
          setLikes(prev => Math.max(0, prev - 1));
          setHasLiked(false);
        } else {
          setLikes(prev => prev + 1);
          setHasLiked(true);
        }
      } else {
        const errorData = await response.json();
        console.error('Like error:', errorData.message);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-colors ${
        hasLiked
          ? 'bg-red-100 text-red-600 hover:bg-red-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      aria-label={hasLiked ? 'Unlike this review' : 'Like this review'}
    >
      <svg
        className={`w-4 h-4 ${hasLiked ? 'fill-current' : 'stroke-current fill-none'}`}
        viewBox="0 0 24 24"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
      <span>{likes}</span>
    </button>
  );
};

export default LikeButton;