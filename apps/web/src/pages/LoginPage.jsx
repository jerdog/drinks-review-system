import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Login page component
 * @returns {JSX.Element} The login page
 */
function LoginPage() {
  const { login, socialLogin, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await login(formData.email, formData.password);

    if (!result.success) {
      // Handle specific login errors
      if (result.error?.includes('email')) {
        setErrors({ email: result.error });
      } else if (result.error?.includes('password')) {
        setErrors({ password: result.error });
      }
    }
  };

  const handleSocialLogin = (provider) => {
    socialLogin(provider);
  };

  return (
    <div className="container">
      <section className="section">
        <div className="columns is-centered">
          <div className="column is-4">
            <div className="box">
              <h1 className="title has-text-centered">Welcome Back</h1>
              <p className="subtitle has-text-centered">Sign in to your WineCraft account</p>

              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label className="label">Email</label>
                  <div className="control">
                    <input
                      className={`input ${errors.email ? 'is-danger' : ''}`}
                      type="email"
                      name="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {errors.email && <p className="help is-danger">{errors.email}</p>}
                </div>

                <div className="field">
                  <label className="label">Password</label>
                  <div className="control">
                    <input
                      className={`input ${errors.password ? 'is-danger' : ''}`}
                      type="password"
                      name="password"
                      placeholder="Your password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {errors.password && <p className="help is-danger">{errors.password}</p>}
                </div>

                <div className="field">
                  <div className="control">
                    <button
                      className={`button is-primary is-fullwidth ${loading ? 'is-loading' : ''}`}
                      type="submit"
                      disabled={loading}
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              </form>

              <div className="has-text-centered">
                <p className="has-text-grey">or</p>
              </div>

              <div className="field">
                <div className="control">
                  <button
                    className="button is-fullwidth is-info"
                    onClick={() => handleSocialLogin('google')}
                    disabled={loading}
                  >
                    <span className="icon">
                      <i className="fab fa-google"></i>
                    </span>
                    <span>Sign in with Google</span>
                  </button>
                </div>
              </div>

              <div className="field">
                <div className="control">
                  <button
                    className="button is-fullwidth is-dark"
                    onClick={() => handleSocialLogin('github')}
                    disabled={loading}
                  >
                    <span className="icon">
                      <i className="fab fa-github"></i>
                    </span>
                    <span>Sign in with GitHub</span>
                  </button>
                </div>
              </div>

              <div className="has-text-centered mt-4">
                <p>
                  Don't have an account?{' '}
                  <Link to="/register" className="has-text-primary">
                    Sign up
                  </Link>
                </p>
                <p className="mt-2">
                  <Link to="/forgot-password" className="has-text-grey">
                    Forgot your password?
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LoginPage;