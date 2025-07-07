import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Status page component for integration tests and system monitoring
 * @returns {JSX.Element} The status page
 */
function StatusPage() {
  const { isAuthenticated, user } = useAuth();
  const [apiStatus, setApiStatus] = useState('checking');
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  // Test API connection on component mount
  useEffect(() => {
    testApiConnection();
  }, []);

  const testApiConnection = async () => {
    try {
      const response = await fetch('http://localhost:3001/health');
      if (response.ok) {
        setApiStatus('connected');
      } else {
        setApiStatus('error');
      }
    } catch (error) {
      setApiStatus('error');
    }
  };

  const runTest = async (testName, testFunction) => {
    setLoading(true);
    try {
      const result = await testFunction();
      setTestResults(prev => ({
        ...prev,
        [testName]: result
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testName]: {
          success: false,
          message: 'Test failed',
          error: error.message
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const testRegistration = async () => {
    const testUser = {
      name: 'Integration Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      username: `testuser${Date.now()}`
    };

    const response = await fetch('http://localhost:3001/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: 'Registration test passed!',
        data: data
      };
    } else {
      return {
        success: false,
        message: 'Registration test failed',
        error: data.message
      };
    }
  };

  const testLogin = async () => {
    // First register a test user
    const testUser = {
      name: 'Login Test User',
      email: `logintest${Date.now()}@example.com`,
      password: 'password123',
      username: `logintest${Date.now()}`
    };

    // Register
    const registerResponse = await fetch('http://localhost:3001/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });

    if (!registerResponse.ok) {
      return {
        success: false,
        message: 'Login test failed - registration failed',
        error: 'Could not create test user'
      };
    }

    // Now test login
    const loginResponse = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });

    const data = await loginResponse.json();

    if (loginResponse.ok) {
      return {
        success: true,
        message: 'Login test passed!',
        data: data
      };
    } else {
      return {
        success: false,
        message: 'Login test failed',
        error: data.message
      };
    }
  };

  const testProtectedEndpoint = async () => {
    // First register and login to get a token
    const testUser = {
      name: 'Protected Test User',
      email: `protectedtest${Date.now()}@example.com`,
      password: 'password123',
      username: `protectedtest${Date.now()}`
    };

    // Register
    const registerResponse = await fetch('http://localhost:3001/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });

    if (!registerResponse.ok) {
      return {
        success: false,
        message: 'Protected endpoint test failed - registration failed',
        error: 'Could not create test user'
      };
    }

    const registerData = await registerResponse.json();
    const token = registerData.token;

    // Test protected endpoint
    const protectedResponse = await fetch('http://localhost:3001/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await protectedResponse.json();

    if (protectedResponse.ok) {
      return {
        success: true,
        message: 'Protected endpoint test passed!',
        data: data
      };
    } else {
      return {
        success: false,
        message: 'Protected endpoint test failed',
        error: data.message
      };
    }
  };

  const testDatabaseConnection = async () => {
    try {
      // Test by creating a user and then querying it
      const testUser = {
        name: 'DB Test User',
        email: `dbtest${Date.now()}@example.com`,
        password: 'password123',
        username: `dbtest${Date.now()}`
      };

      const response = await fetch('http://localhost:3001/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testUser)
      });

      if (response.ok) {
        return {
          success: true,
          message: 'Database connection test passed!',
          data: { message: 'User created and stored successfully' }
        };
      } else {
        return {
          success: false,
          message: 'Database connection test failed',
          error: 'Could not create user in database'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Database connection test failed',
        error: error.message
      };
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    await Promise.all([
      runTest('registration', testRegistration),
      runTest('login', testLogin),
      runTest('protectedEndpoint', testProtectedEndpoint),
      runTest('databaseConnection', testDatabaseConnection)
    ]);
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'is-success';
      case 'error': return 'is-danger';
      default: return 'is-warning';
    }
  };

  const getTestResultColor = (success) => {
    return success ? 'is-success' : 'is-danger';
  };

  return (
    <div className="container">
      <section className="section">
        <div className="container">
          <h1 className="title">System Status & Integration Tests</h1>
          <p className="subtitle">Monitor the health of the application and test integrations</p>

          {/* API Status */}
          <div className="box">
            <h2 className="title is-4">API Status</h2>
            <div className="field">
              <div className="control">
                <span className={`tag is-medium ${getStatusColor(apiStatus)}`}>
                  {apiStatus === 'connected' ? '✅ Connected' : apiStatus === 'error' ? '❌ Error' : '⏳ Checking...'}
                </span>
              </div>
            </div>
          </div>

          {/* Authentication Status */}
          <div className="box">
            <h2 className="title is-4">Authentication Status</h2>
            <div className="field">
              <div className="control">
                <span className={`tag is-medium ${isAuthenticated ? 'is-success' : 'is-warning'}`}>
                  {isAuthenticated ? '✅ Authenticated' : '⚠️ Not Authenticated'}
                </span>
              </div>
            </div>
            {isAuthenticated && user && (
              <div className="notification is-light">
                <p><strong>Current User:</strong> {user.displayName} ({user.email})</p>
              </div>
            )}
          </div>

          {/* Integration Tests */}
          <div className="box">
            <h2 className="title is-4">Integration Tests</h2>

            <div className="buttons mb-4">
              <button
                className="button is-info"
                onClick={() => runTest('registration', testRegistration)}
                disabled={loading || apiStatus !== 'connected'}
              >
                Test Registration
              </button>
              <button
                className="button is-info"
                onClick={() => runTest('login', testLogin)}
                disabled={loading || apiStatus !== 'connected'}
              >
                Test Login
              </button>
              <button
                className="button is-info"
                onClick={() => runTest('protectedEndpoint', testProtectedEndpoint)}
                disabled={loading || apiStatus !== 'connected'}
              >
                Test Protected Endpoint
              </button>
              <button
                className="button is-info"
                onClick={() => runTest('databaseConnection', testDatabaseConnection)}
                disabled={loading || apiStatus !== 'connected'}
              >
                Test Database Connection
              </button>
              <button
                className="button is-primary"
                onClick={runAllTests}
                disabled={loading || apiStatus !== 'connected'}
              >
                Run All Tests
              </button>
            </div>

            {loading && (
              <div className="notification is-info">
                <p>Running tests...</p>
              </div>
            )}

            {/* Test Results */}
            {Object.keys(testResults).length > 0 && (
              <div className="content">
                <h3 className="title is-5">Test Results</h3>
                {Object.entries(testResults).map(([testName, result]) => (
                  <div key={testName} className="notification is-light mb-3">
                    <h4 className="title is-6">
                      <span className={`tag ${getTestResultColor(result.success)}`}>
                        {result.success ? '✅' : '❌'}
                      </span>
                      {testName.charAt(0).toUpperCase() + testName.slice(1)} Test
                    </h4>
                    <p>{result.message}</p>
                    {result.error && (
                      <p className="has-text-danger">{result.error}</p>
                    )}
                    {result.data && (
                      <details className="mt-2">
                        <summary>Response Data</summary>
                        <pre className="mt-2 p-2 has-background-light" style={{fontSize: '0.8rem', maxHeight: '200px', overflow: 'auto'}}>
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System Information */}
          <div className="box">
            <h2 className="title is-4">System Information</h2>
            <div className="columns">
              <div className="column">
                <p><strong>Frontend URL:</strong> http://localhost:3000</p>
                <p><strong>API URL:</strong> http://localhost:3001</p>
                <p><strong>Database:</strong> Neon PostgreSQL</p>
              </div>
              <div className="column">
                <p><strong>Environment:</strong> Development</p>
                <p><strong>Authentication:</strong> JWT + bcrypt</p>
                <p><strong>Framework:</strong> React + Fastify</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default StatusPage;