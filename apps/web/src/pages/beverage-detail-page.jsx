import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const ReviewCard = ({ review }) => {
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
                    key={i}
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
        <div className="text-xs text-gray-400">
          {review._count?.likes || 0} likes
        </div>
      </div>
      {review.notes && (
        <p className="text-gray-700 text-sm">{review.notes}</p>
      )}
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
        <label className="block text-sm font-medium mb-2">Rating</label>
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
        <label className="block text-sm font-medium mb-2">Tasting Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          rows={3}
          placeholder="Share your thoughts about this beverage..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">Price (optional)</label>
          <input
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
          <label className="block text-sm font-medium mb-2">Serving Type</label>
          <select
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
        className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 disabled:opacity-50"
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

  useEffect(() => {
    fetchBeverage();
  }, [id]);

  const fetchBeverage = async () => {
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
  };

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
      <Link to="/beverages" className="text-primary-600 hover:underline mb-4 inline-block">
        ← Back to Beverages
      </Link>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">{beverage.name}</h1>
        <div className="text-gray-600 mb-4">
          {beverage.type} {beverage.region && `· ${beverage.region}`}
          {beverage.varietal && ` · ${beverage.varietal}`}
          {beverage.abv && ` · ${beverage.abv}% ABV`}
          {beverage.vintage && ` · ${beverage.vintage}`}
        </div>
        {beverage.description && (
          <p className="text-gray-700 mb-4">{beverage.description}</p>
        )}
        <div className="text-sm text-gray-500">
          Category: {beverage.category?.name || '—'}
        </div>
      </div>

      <ReviewForm beverageId={id} onReviewCreated={handleReviewCreated} />

      <div>
        <h2 className="text-xl font-semibold mb-4">
          Reviews ({reviews.length})
        </h2>
        {reviews.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
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