import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Navigation bar component
 * @returns {JSX.Element} The navigation bar
 */
function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar is-primary" role="navigation" aria-label="main navigation">
      <div className="container">
        <div className="navbar-brand">
          <Link className="navbar-item" to="/">
            <h1 className="title is-4 has-text-white">🍷 WineCraft</h1>
          </Link>

          <a
            role="button"
            className={`navbar-burger ${isMenuOpen ? 'is-active' : ''}`}
            aria-label="menu"
            aria-expanded="false"
            onClick={toggleMenu}
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>

        <div className={`navbar-menu ${isMenuOpen ? 'is-active' : ''}`}>
          <div className="navbar-start">
            <Link className="navbar-item" to="/" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>

            <Link className="navbar-item" to="/search" onClick={() => setIsMenuOpen(false)}>
              Discover
            </Link>

            <Link className="navbar-item" to="/leaderboard" onClick={() => setIsMenuOpen(false)}>
              Leaderboard
            </Link>
          </div>

          <div className="navbar-end">
            {isAuthenticated ? (
              <>
                <div className="navbar-item has-dropdown is-hoverable">
                  <a className="navbar-link">
                    <span className="icon">
                      <i className="fas fa-user"></i>
                    </span>
                    <span>{user?.name || user?.username || 'Profile'}</span>
                  </a>

                  <div className="navbar-dropdown is-right">
                    <Link
                      className="navbar-item"
                      to="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="icon">
                        <i className="fas fa-tachometer-alt"></i>
                      </span>
                      <span>Dashboard</span>
                    </Link>

                    <Link
                      className="navbar-item"
                      to={`/profile/${user?.username}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="icon">
                        <i className="fas fa-user-circle"></i>
                      </span>
                      <span>My Profile</span>
                    </Link>

                    <hr className="navbar-divider" />

                    <a className="navbar-item" onClick={handleLogout}>
                      <span className="icon">
                        <i className="fas fa-sign-out-alt"></i>
                      </span>
                      <span>Sign Out</span>
                    </a>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="navbar-item">
                  <div className="buttons">
                    <Link
                      className="button is-light"
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <strong>Sign In</strong>
                    </Link>
                    <Link
                      className="button is-white"
                      to="/register"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <strong>Sign Up</strong>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;