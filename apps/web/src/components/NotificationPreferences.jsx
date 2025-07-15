import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

const NotificationPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState({
    likes: true,
    comments: true,
    follows: true,
    mentions: true,
    achievements: true,
    email: false,
    push: false
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchPreferences = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications/preferences`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch notification preferences:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user, fetchPreferences]);

  const handleToggle = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(preferences)
      });

      if (response.ok) {
        setMessage('Preferences saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to save preferences');
      }
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
      setMessage('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setPreferences({
      likes: true,
      comments: true,
      follows: true,
      mentions: true,
      achievements: true,
      email: false,
      push: false
    });
  };

  if (!user) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800">
          Please sign in to manage notification preferences.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={`skeleton-${i}`} className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-8"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const notificationTypes = [
    {
      key: 'likes',
      label: 'Likes',
      description: 'When someone likes your reviews'
    },
    {
      key: 'comments',
      label: 'Comments',
      description: 'When someone comments on your reviews'
    },
    {
      key: 'follows',
      label: 'New Followers',
      description: 'When someone starts following you'
    },
    {
      key: 'mentions',
      label: 'Mentions',
      description: 'When someone mentions you in a comment'
    },
    {
      key: 'achievements',
      label: 'Achievements',
      description: 'When you earn badges or achievements'
    },
    {
      key: 'email',
      label: 'Email Notifications',
      description: 'Receive notifications via email'
    },
    {
      key: 'push',
      label: 'Push Notifications',
      description: 'Receive push notifications in browser'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Notification Preferences
        </h2>
        <p className="text-sm text-gray-600">
          Choose which notifications you want to receive
        </p>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-md ${
          message.includes('successfully')
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-4">
        {notificationTypes.map((type) => (
          <div key={type.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">{type.label}</h3>
              <p className="text-xs text-gray-500 mt-1">{type.description}</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle(type.key)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                preferences[type.key] ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              aria-label={`Toggle ${type.label} notifications`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences[type.key] ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Reset to Default
        </button>
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">About Notifications</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Notifications are sent in real-time when events occur</li>
          <li>• You can mark notifications as read to clear them</li>
          <li>• Email notifications require a valid email address</li>
          <li>• Push notifications work in supported browsers</li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationPreferences;