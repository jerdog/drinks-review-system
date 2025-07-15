import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const CommentForm = ({ reviewId, onCommentAdded }) => {
  const { isAuthenticated } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setError('Please sign in to comment');
      return;
    }

    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    if (content.length > 1000) {
      setError('Comment too long (max 1000 characters)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/social/comment/${reviewId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: content.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add comment');
      }

      const data = await response.json();
      onCommentAdded(data.comment);
      setContent('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <p className="text-blue-800 text-sm">
          Please sign in to add a comment.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="mb-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
          maxLength={1000}
        />
        <div className="text-xs text-gray-500 mt-1 text-right">
          {content.length}/1000
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !content.trim()}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          loading || !content.trim()
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {loading ? 'Posting...' : 'Post Comment'}
      </button>
    </form>
  );
};

export default CommentForm;