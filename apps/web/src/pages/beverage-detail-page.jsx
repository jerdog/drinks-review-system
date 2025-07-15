import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LikeButton from '../components/LikeButton';
import CommentForm from '../components/CommentForm';
import CommentList from '../components/CommentList';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const ReviewCard = ({ review, onCommentAdded }) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(review.comments || []);
  const [loadingComments, setLoadingComments] = useState(false);

  const handleCommentAdded = (newComment) => {
    setComments(prev => [newComment, ...prev]);
    if (onCommentAdded) {
      onCommentAdded(newComment);
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">
              {review.isAnonymous ? 'Anonymous' : review.user?.displayName || review.user?.username}
            </span>
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
        <div className="flex items-center gap-2">
          <LikeButton
            reviewId={review.id}
            initialLikes={review._count?.likes || 0}
          />
        </div>
      </div>

      {review.notes && (
        <p className="text-gray-700 text-sm mb-3">{review.notes}</p>
      )}

      {/* Comments section */}
      <div className="border-t pt-3 mt-3">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={toggleComments}
            className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {review._count?.comments || 0} comment{(review._count?.comments || 0) !== 1 ? 's' : ''}
          </button>
        </div>

        {showComments && (
          <div className="space-y-4">
            <CommentForm
              reviewId={review.id}
              onCommentAdded={handleCommentAdded}
            />
            <CommentList comments={comments} />
          </div>
        )}
      </div>
    </div>
  );
};

const ReviewForm = ({ beverageId, onReviewCreated }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [notes, setNotes] = useState('');
  const [price, setPrice] = useState('');
  const [servingType, setServingType] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const reviewData = {
        beverageId,
        rating,
        notes,
        price: price ? parseFloat(price) : null,
        servingType: servingType || null,
        isAnonymous,
        isPublic
      };

      const res = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create review');
      }

      const data = await res.json();
      onReviewCreated(data.review);

      // Reset form
      setRating(5);
      setNotes('');
      setPrice('');
      setServingType('');
      setIsAnonymous(false);
      setIsPublic(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800">
          Please <Link to="/login" className="underline">sign in</Link> to write a review.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Write a Review</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 text-red-700">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="rating" className="block text-sm font-medium mb-2">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => {
                setRating(star);
              }}
              className={`text-2xl ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
              aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="notes" className="block text-sm font-medium mb-2">Tasting Notes</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          rows={3}
          placeholder="Share your thoughts about this beverage..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium mb-2">Price (optional)</label>
          <input
            id="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>
        <div>
          <label htmlFor="servingType" className="block text-sm font-medium mb-2">Serving Type</label>
          <select
            id="servingType"
            value={servingType}
            onChange={(e) => setServingType(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select type</option>
            <option value="bottle">Bottle</option>
            <option value="glass">Glass</option>
            <option value="shot">Shot</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm">Post anonymously</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm">Make review public</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
          loading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-primary-600 text-white hover:bg-primary-700'
        }`}
      >
        {loading ? 'Posting...' : 'Post Review'}
      </button>
    </form>
  );
};

const BeverageDetailPage = () => {
  const { id } = useParams();
  const [beverage, setBeverage] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBeverage = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/beverages/${id}`);
      if (!res.ok) {
        throw new Error('Beverage not found');
      }
      const data = await res.json();
      setBeverage(data.beverage);
      setReviews(data.beverage.reviews || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBeverage();
  }, [fetchBeverage]);

  const handleReviewCreated = (newReview) => {
    setReviews(prev => [newReview, ...prev]);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="text-red-600 text-center py-8">{error}</div>
        <Link to="/beverages" className="text-primary-600 hover:underline">
          ← Back to Beverages
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Beverage Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-2xl font-bold text-gray-600">
            {beverage?.name?.charAt(0) || '?'}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">{beverage?.name}</h1>
            {beverage?.description && (
              <p className="text-gray-600 mb-3">{beverage.description}</p>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              {beverage?.type && <span>Type: {beverage.type}</span>}
              {beverage?.region && <span>Region: {beverage.region}</span>}
              {beverage?.varietal && <span>Varietal: {beverage.varietal}</span>}
              {beverage?.abv && <span>ABV: {beverage.abv}%</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Review Form */}
      <ReviewForm beverageId={id} onReviewCreated={handleReviewCreated} />

      {/* Reviews */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No reviews yet. Be the first to review this beverage!
          </div>
        ) : (
          reviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))
        )}
      </div>
    </div>
  );
};

export default BeverageDetailPage;