import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Registration page component
 * @returns {JSX.Element} The registration page
 */
function RegisterPage() {
  const { register, socialLogin, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    username: ''
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

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      username: formData.username
    });

    if (!result.success) {
      // Handle specific registration errors
      if (result.error?.includes('email')) {
        setErrors({ email: result.error });
      } else if (result.error?.includes('username')) {
        setErrors({ username: result.error });
      }
    }
  };

  const handleSocialRegister = (provider) => {
    socialLogin(provider);
  };

  return (
    <div className="container">
      <section className="section">
        <div className="columns is-centered">
          <div className="column is-4">
            <div className="box">
              <h1 className="title has-text-centered">Create Account</h1>
              <p className="subtitle has-text-centered">Join the WineCraft community</p>

              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label className="label">Full Name</label>
                  <div className="control">
                    <input
                      className={`input ${errors.name ? 'is-danger' : ''}`}
                      type="text"
                      name="name"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {errors.name && <p className="help is-danger">{errors.name}</p>}
                </div>

                <div className="field">
                  <label className="label">Username</label>
                  <div className="control">
                    <input
                      className={`input ${errors.username ? 'is-danger' : ''}`}
                      type="text"
                      name="username"
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {errors.username && <p className="help is-danger">{errors.username}</p>}
                </div>

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
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {errors.password && <p className="help is-danger">{errors.password}</p>}
                </div>

                <div className="field">
                  <label className="label">Confirm Password</label>
                  <div className="control">
                    <input
                      className={`input ${errors.confirmPassword ? 'is-danger' : ''}`}
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {errors.confirmPassword && <p className="help is-danger">{errors.confirmPassword}</p>}
                </div>

                <div className="field">
                  <div className="control">
                    <button
                      className={`button is-primary is-fullwidth ${loading ? 'is-loading' : ''}`}
                      type="submit"
                      disabled={loading}
                    >
                      Create Account
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
                    onClick={() => handleSocialRegister('google')}
                    disabled={loading}
                  >
                    <span className="icon">
                      <i className="fab fa-google"></i>
                    </span>
                    <span>Sign up with Google</span>
                  </button>
                </div>
              </div>

              <div className="field">
                <div className="control">
                  <button
                    className="button is-fullwidth is-dark"
                    onClick={() => handleSocialRegister('github')}
                    disabled={loading}
                  >
                    <span className="icon">
                      <i className="fab fa-github"></i>
                    </span>
                    <span>Sign up with GitHub</span>
                  </button>
                </div>
              </div>

              <div className="has-text-centered mt-4">
                <p>
                  Already have an account?{' '}
                  <Link to="/login" className="has-text-primary">
                    Sign in
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

export default RegisterPage;