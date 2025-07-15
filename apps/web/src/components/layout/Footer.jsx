import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Footer component for the wine, cocktail, and spirit review platform
 * @returns {JSX.Element} The footer
 */
function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer has-background-dark has-text-light">
      <div className="container">
        <div className="columns">
          <div className="column">
            <h3 className="title is-4 has-text-light">🍷 WineCraft</h3>
            <p className="has-text-grey-light">
              Discover, review, and share your favorite wines, cocktails, and spirits with the world.
            </p>
          </div>

          <div className="column">
            <h4 className="title is-5 has-text-light">Platform</h4>
            <ul>
              <li><Link to="/discover" className="has-text-grey-light">Discover</Link></li>
              <li><Link to="/reviews" className="has-text-grey-light">Reviews</Link></li>
              <li><Link to="/venues" className="has-text-grey-light">Venues</Link></li>
              <li><Link to="/leaderboard" className="has-text-grey-light">Leaderboard</Link></li>
            </ul>
          </div>

          <div className="column">
            <h4 className="title is-5 has-text-light">Community</h4>
            <ul>
              <li><Link to="/about" className="has-text-grey-light">About</Link></li>
              <li><Link to="/guidelines" className="has-text-grey-light">Guidelines</Link></li>
              <li><Link to="/privacy" className="has-text-grey-light">Privacy</Link></li>
              <li><Link to="/terms" className="has-text-grey-light">Terms</Link></li>
            </ul>
          </div>

          <div className="column">
            <h4 className="title is-5 has-text-light">Connect</h4>
            <div className="buttons">
              <a
                href="https://twitter.com/winecraft"
                className="button is-small is-rounded"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                <span className="icon">
                  <i className="fab fa-twitter"></i>
                </span>
              </a>
              <a
                href="https://instagram.com/winecraft"
                className="button is-small is-rounded"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <span className="icon">
                  <i className="fab fa-instagram"></i>
                </span>
              </a>
              <a
                href="https://github.com/winecraft"
                className="button is-small is-rounded"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <span className="icon">
                  <i className="fab fa-github"></i>
                </span>
              </a>
            </div>
          </div>
        </div>

        <hr className="has-background-grey-dark" />

        <div className="columns is-mobile is-vcentered">
          <div className="column">
            <p className="has-text-grey-light">
              © {currentYear} WineCraft. All rights reserved.
            </p>
          </div>
          <div className="column has-text-right">
            <p className="has-text-grey-light">
              Made with ❤️ for wine, cocktail, and spirit enthusiasts
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;