import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const StatusPage = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runTest = async (testName, testFunction) => {
    setLoading(true);
    try {
      const result = await testFunction();
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: true, message: result }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: false, message: error.message }
      }));
    } finally {
      setLoading(false);
    }
  };

  const testApiHealth = async () => {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    return `API is healthy - ${data.status}`;
  };

  const testDatabaseConnection = async () => {
    const response = await fetch(`${API_URL}/beverages?limit=1`);
    const data = await response.json();
    return `Database connected - ${data.beverages?.length || 0} beverages available`;
  };

  const testBeverageListing = async () => {
    const response = await fetch(`${API_URL}/beverages`);
    const data = await response.json();
    return `Beverage listing works - ${data.beverages?.length || 0} beverages loaded`;
  };

  const testBeverageCategories = async () => {
    const response = await fetch(`${API_URL}/beverages/categories`);
    const data = await response.json();
    return `Categories loaded - ${data.categories?.length || 0} categories available`;
  };

  const testBeverageDetail = async () => {
    // Get first beverage ID
    const listResponse = await fetch(`${API_URL}/beverages?limit=1`);
    const listData = await listResponse.json();

    if (!listData.beverages?.length) {
      throw new Error('No beverages available for detail test');
    }

    const beverageId = listData.beverages[0].id;
    const detailResponse = await fetch(`${API_URL}/beverages/${beverageId}`);
    const detailData = await detailResponse.json();

    return `Beverage detail works - ${detailData.beverage?.name} loaded`;
  };

  const testReviewCreation = async () => {
    if (!isAuthenticated) {
      throw new Error('Authentication required for review creation test');
    }

    // Get first beverage ID
    const listResponse = await fetch(`${API_URL}/beverages?limit=1`);
    const listData = await listResponse.json();

    if (!listData.beverages?.length) {
      throw new Error('No beverages available for review test');
    }

    const beverageId = listData.beverages[0].id;
    const token = localStorage.getItem('authToken');

    const reviewData = {
      beverageId,
      rating: 5,
      notes: 'Test review from status page',
      price: 25.00,
      servingType: 'glass',
      isAnonymous: false,
      isPublic: true
    };

    const response = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reviewData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Review creation failed');
    }

    const data = await response.json();
    return `Review created successfully - ID: ${data.review?.id}`;
  };

  const testAuthentication = async () => {
    const testCredentials = {
      email: 'test2@example.com',
      password: 'password123'
    };

    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testCredentials)
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Authentication failed');
    }

    return `Authentication works - Logged in as ${data.user?.username}`;
  };

  const testProtectedEndpoint = async () => {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(`${API_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error('Protected endpoint test failed');
    }

    return `Protected endpoint works - User: ${data.user?.username}`;
  };

  const handleQuickLogin = async () => {
    try {
      await login('test2@example.com', 'password123');
    } catch (error) {
      console.error('Quick login failed:', error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">System Status & Testing</h1>

      {/* System Information */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">System Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <strong>Frontend URL:</strong> http://localhost:3000
          </div>
          <div>
            <strong>API URL:</strong> http://localhost:3001
          </div>
          <div>
            <strong>Authentication:</strong> {isAuthenticated ? '✅ Logged In' : '❌ Not Logged In'}
          </div>
          <div>
            <strong>Current User:</strong> {user?.username || 'None'}
          </div>
        </div>
      </div>

      {/* Test Credentials */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Credentials</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <strong>Email:</strong> test2@example.com
          </div>
          <div>
            <strong>Password:</strong> password123
          </div>
          <div>
            <strong>Username:</strong> testuser2
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleQuickLogin}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={isAuthenticated}
          >
            Quick Login
          </button>
          <button
            onClick={handleLogout}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            disabled={!isAuthenticated}
          >
            Logout
          </button>
        </div>
      </div>

      {/* API Tests */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">API Tests</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => runTest('API Health', testApiHealth)}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            Test API Health
          </button>
          <button
            onClick={() => runTest('Database Connection', testDatabaseConnection)}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            Test Database Connection
          </button>
          <button
            onClick={() => runTest('Authentication', testAuthentication)}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Test Authentication
          </button>
          <button
            onClick={() => runTest('Protected Endpoint', testProtectedEndpoint)}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Test Protected Endpoint
          </button>
        </div>
      </div>

      {/* Phase 2 Tests */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Phase 2: Beverage & Review System Tests</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => runTest('Beverage Listing', testBeverageListing)}
            disabled={loading}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
          >
            Test Beverage Listing
          </button>
          <button
            onClick={() => runTest('Beverage Categories', testBeverageCategories)}
            disabled={loading}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
          >
            Test Beverage Categories
          </button>
          <button
            onClick={() => runTest('Beverage Detail', testBeverageDetail)}
            disabled={loading}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
          >
            Test Beverage Detail
          </button>
          <button
            onClick={() => runTest('Review Creation', testReviewCreation)}
            disabled={loading || !isAuthenticated}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
          >
            Test Review Creation
          </button>
        </div>
      </div>

      {/* Test Results */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Test Results</h2>
        {Object.keys(testResults).length === 0 ? (
          <p className="text-gray-500">No tests run yet. Click the buttons above to run tests.</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(testResults).map(([testName, result]) => (
              <div
                key={testName}
                className={`p-3 rounded ${
                  result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                    {result.success ? '✅' : '❌'}
                  </span>
                  <strong>{testName}:</strong>
                  <span className={result.success ? 'text-green-700' : 'text-red-700'}>
                    {result.message}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/beverages"
            className="bg-blue-600 text-white px-4 py-2 rounded text-center hover:bg-blue-700"
          >
            Browse Beverages
          </a>
          <a
            href="/login"
            className="bg-green-600 text-white px-4 py-2 rounded text-center hover:bg-green-700"
          >
            Login Page
          </a>
          <a
            href="/register"
            className="bg-purple-600 text-white px-4 py-2 rounded text-center hover:bg-purple-700"
          >
            Register Page
          </a>
        </div>
      </div>
    </div>
  );
};

export default StatusPage;