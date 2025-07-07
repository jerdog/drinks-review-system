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
              Wine & Cocktail Reviews
            </h1>
            <h2 className="subtitle">
              Discover, review, and share your favorite wines and cocktails
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
                    <p>Find new wines and cocktails based on your preferences and community recommendations.</p>
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

      {/* Leaderboard Section */}
      <section className="section">
        <div className="container">
          <div className="level">
            <div className="level-left">
              <div className="level-item">
                <h2 className="title is-2">Top Reviewers</h2>
              </div>
            </div>
            <div className="level-right">
              <div className="level-item">
                <Link to="/leaderboard" className="button is-primary">
                  View Full Leaderboard
                </Link>
              </div>
            </div>
          </div>

          <div className="columns">
            <div className="column is-8">
              <div className="box">
                <div className="table-container">
                  <table className="table is-fullwidth">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>User</th>
                        <th>Reviews</th>
                        <th>Followers</th>
                        <th>Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><span className="tag is-warning is-medium">1</span></td>
                        <td>
                          <div className="media">
                            <div className="media-left">
                              <figure className="image is-32x32">
                                <img className="is-rounded" src="https://bulma.io/images/placeholders/64x64.png" alt="User" />
                              </figure>
                            </div>
                            <div className="media-content">
                              <p className="title is-6">WineMaster</p>
                            </div>
                          </div>
                        </td>
                        <td>247</td>
                        <td>1,234</td>
                        <td>8,950</td>
                      </tr>
                      <tr>
                        <td><span className="tag is-light is-medium">2</span></td>
                        <td>
                          <div className="media">
                            <div className="media-left">
                              <figure className="image is-32x32">
                                <img className="is-rounded" src="https://bulma.io/images/placeholders/64x64.png" alt="User" />
                              </figure>
                            </div>
                            <div className="media-content">
                              <p className="title is-6">CocktailQueen</p>
                            </div>
                          </div>
                        </td>
                        <td>189</td>
                        <td>987</td>
                        <td>7,320</td>
                      </tr>
                      <tr>
                        <td><span className="tag is-light is-medium">3</span></td>
                        <td>
                          <div className="media">
                            <div className="media-left">
                              <figure className="image is-32x32">
                                <img className="is-rounded" src="https://bulma.io/images/placeholders/64x64.png" alt="User" />
                              </figure>
                            </div>
                            <div className="media-content">
                              <p className="title is-6">SpiritHunter</p>
                            </div>
                          </div>
                        </td>
                        <td>156</td>
                        <td>756</td>
                        <td>6,890</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="column is-4">
              <div className="box">
                <h3 className="title is-4">Join the Community</h3>
                <p className="mb-4">
                  Start reviewing your favorite wines and cocktails today. Connect with fellow enthusiasts and discover new favorites.
                </p>
                <Link to="/login" className="button is-primary is-fullwidth">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section has-background-light">
        <div className="container has-text-centered">
          <h3 className="title">Ready to start your journey?</h3>
          <p className="subtitle">Join thousands of wine and cocktail enthusiasts</p>
          {!isAuthenticated && (
            <Link to="/register" className="button is-primary is-medium">
              Create Account
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}

export default HomePage;