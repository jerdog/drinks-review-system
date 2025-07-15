import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Home page component
 * @returns {JSX.Element} The home page
 */
function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="container">
      {/* Hero Section */}
      <section className="hero is-primary">
        <div className="hero-body">
          <div className="container">
            <h1 className="title">
              Wine, Cocktail, and Spirit Reviews
            </h1>
            <h2 className="subtitle">
              Discover, review, and share your favorite wines, cocktails, and spirits
            </h2>
            <div className="buttons">
              {!isAuthenticated ? (
                <>
                  <Link to="/register" className="button is-light is-medium">
                    Get Started
                  </Link>
                  <Link to="/login" className="button is-outlined is-light is-medium">
                    Sign In
                  </Link>
                </>
              ) : (
                <Link to="/dashboard" className="button is-light is-medium">
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="container">
          <h3 className="title has-text-centered">Features</h3>
          <div className="columns">
            <div className="column">
              <div className="card">
                <div className="card-content">
                  <div className="content">
                    <h4 className="title is-4">
                      <span className="icon has-text-primary">
                        <i className="fas fa-wine-glass"></i>
                      </span>
                      Discover Beverages
                    </h4>
                    <p>Find new wines, cocktails, and spirits based on your preferences and community recommendations.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="column">
              <div className="card">
                <div className="card-content">
                  <div className="content">
                    <h4 className="title is-4">
                      <span className="icon has-text-primary">
                        <i className="fas fa-star"></i>
                      </span>
                      Rate & Review
                    </h4>
                    <p>Share your tasting notes and ratings with the community.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="column">
              <div className="card">
                <div className="card-content">
                  <div className="content">
                    <h4 className="title is-4">
                      <span className="icon has-text-primary">
                        <i className="fas fa-users"></i>
                      </span>
                      Social Features
                    </h4>
                    <p>Follow friends, like reviews, and build your beverage community.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Reviews Section */}
      <section className="section has-background-light">
        <div className="container">
          <div className="level">
            <div className="level-left">
              <div className="level-item">
                <h2 className="title is-2">Recent Reviews</h2>
              </div>
            </div>
            <div className="level-right">
              <div className="level-item">
                <Link to="/search" className="button is-primary">
                  View All Reviews
                </Link>
              </div>
            </div>
          </div>

          <div className="columns is-multiline">
            {/* Sample Review Cards */}
            <div className="column is-4">
              <div className="card">
                <div className="card-content">
                  <div className="media">
                    <div className="media-left">
                      <figure className="image is-48x48">
                        <img className="is-rounded" src="https://bulma.io/images/placeholders/96x96.png" alt="User" />
                      </figure>
                    </div>
                    <div className="media-content">
                      <p className="title is-6">John Doe</p>
                      <p className="subtitle is-7">2 hours ago</p>
                    </div>
                  </div>
                  <div className="content">
                    <h4 className="title is-5">Château Margaux 2015</h4>
                    <div className="rating-stars mb-2">
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                    </div>
                    <p>Exceptional Bordeaux with rich tannins and complex flavors. A truly memorable experience.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="column is-4">
              <div className="card">
                <div className="card-content">
                  <div className="media">
                    <div className="media-left">
                      <figure className="image is-48x48">
                        <img className="is-rounded" src="https://bulma.io/images/placeholders/96x96.png" alt="User" />
                      </figure>
                    </div>
                    <div className="media-content">
                      <p className="title is-6">Jane Smith</p>
                      <p className="subtitle is-7">5 hours ago</p>
                    </div>
                  </div>
                  <div className="content">
                    <h4 className="title is-5">Classic Martini</h4>
                    <div className="rating-stars mb-2">
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="far fa-star"></i>
                    </div>
                    <p>Perfectly balanced with premium gin. The classic cocktail done right.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="column is-4">
              <div className="card">
                <div className="card-content">
                  <div className="media">
                    <div className="media-left">
                      <figure className="image is-48x48">
                        <img className="is-rounded" src="https://bulma.io/images/placeholders/96x96.png" alt="User" />
                      </figure>
                    </div>
                    <div className="media-content">
                      <p className="title is-6">Mike Johnson</p>
                      <p className="subtitle is-7">1 day ago</p>
                    </div>
                  </div>
                  <div className="content">
                    <h4 className="title is-5">Macallan 18 Year</h4>
                    <div className="rating-stars mb-2">
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                    </div>
                    <p>Incredible depth and complexity. Worth every penny for this premium whisky.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="section">
        <div className="container">
          <div className="has-text-centered">
            <h2 className="title is-2">Join Our Community</h2>
            <p className="subtitle is-5">
              Start reviewing your favorite wines, cocktails, and spirits today. Connect with fellow enthusiasts and discover new favorites.
            </p>
            <div className="buttons is-centered">
              {!isAuthenticated ? (
                <>
                  <Link to="/register" className="button is-primary is-large">
                    Get Started
                  </Link>
                  <Link to="/search" className="button is-outlined is-primary is-large">
                    Browse Reviews
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className="button is-primary is-large">
                    Go to Dashboard
                  </Link>
                  <Link to="/search" className="button is-outlined is-primary is-large">
                    Browse Reviews
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="footer">
        <div className="container">
          <div className="columns">
            <div className="column">
              <h3 className="title is-4">About Us</h3>
              <p className="subtitle">Join thousands of wine, cocktail, and spirit enthusiasts</p>
              <p>We're building the world's largest community of beverage enthusiasts. Share your experiences, discover new favorites, and connect with fellow connoisseurs.</p>
            </div>
            <div className="column">
              <h3 className="title is-4">Quick Links</h3>
              <ul>
                <li><Link to="/search">Browse Reviews</Link></li>
                <li><Link to="/register">Sign Up</Link></li>
                <li><Link to="/login">Sign In</Link></li>
                <li><Link to="/about">About</Link></li>
              </ul>
            </div>
            <div className="column">
              <h3 className="title is-4">Connect</h3>
              <div className="buttons">
                <a href="https://twitter.com" className="button is-small">
                  <span className="icon">
                    <i className="fab fa-twitter"></i>
                  </span>
                </a>
                <a href="https://facebook.com" className="button is-small">
                  <span className="icon">
                    <i className="fab fa-facebook"></i>
                  </span>
                </a>
                <a href="https://instagram.com" className="button is-small">
                  <span className="icon">
                    <i className="fab fa-instagram"></i>
                  </span>
                </a>
              </div>
            </div>
          </div>
          <hr />
          <div className="has-text-centered">
            <p>Made with ❤️ for wine, cocktail, and spirit enthusiasts</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;