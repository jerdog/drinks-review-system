import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FollowButton from '../components/FollowButton';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const UserProfilePage = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('reviews');

  const fetchUserProfile = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/users/${username}`);
      if (!response.ok) {
        throw new Error('User not found');
      }

      const data = await response.json();
      setUser(data.user);

      // Fetch user's reviews
      const reviewsResponse = await fetch(`${API_URL}/users/${data.user.id}/reviews`);
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        setReviews(reviewsData.reviews || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const ReviewCard = ({ review }) => {
    return (
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Link
                to={`/beverages/${review.beverage?.id}`}
                className="font-semibold text-blue-600 hover:underline"
              >
                {review.beverage?.name}
              </Link>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => {
                  const isYellow = i < review.rating;
                  return (
                    <span
                      key={`star-${i}`}
                      className={`text-sm ${isYellow ? 'text-yellow-500' : 'text-gray-300'}`}
                      style={{ color: isYellow ? '#f59e0b' : '#d1d5db' }}
                    >
                      ★
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {new Date(review.createdAt).toLocaleDateString()}
              {review.price && ` · $${review.price}`}
              {review.servingType && ` · ${review.servingType}`}
            </div>
          </div>
        </div>
        {review.notes && (
          <p className="text-gray-700 text-sm">{review.notes}</p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-red-600 text-center py-8">{error}</div>
        <Link to="/" className="text-primary-600 hover:underline">
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* User Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-600">
            {user?.displayName?.charAt(0) || user?.username?.charAt(0) || '?'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-2xl font-bold">
                {user?.displayName || user?.username}
              </h1>
              {currentUser?.id !== user?.id && (
                <FollowButton userId={user?.id} />
              )}
            </div>
            {user?.bio && (
              <p className="text-gray-600 mb-3">{user.bio}</p>
            )}
            {user?.location && (
              <p className="text-sm text-gray-500 mb-3">
                📍 {user.location}
              </p>
            )}
            <div className="flex gap-6 text-sm text-gray-500">
              <span>{reviews.length} reviews</span>
              <span>Member since {new Date(user?.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b">
          <nav className="flex">
            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'reviews'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Reviews ({reviews.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('following')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'following'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Following
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('followers')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'followers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Followers
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'reviews' && (
            <div>
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No reviews yet.
                </div>
              ) : (
                <div>
                  {reviews.map(review => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'following' && (
            <div className="text-center py-8 text-gray-500">
              Following list coming soon...
            </div>
          )}

          {activeTab === 'followers' && (
            <div className="text-center py-8 text-gray-500">
              Followers list coming soon...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;