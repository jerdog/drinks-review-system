import React from 'react'
import { Link } from 'react-router-dom'

const HomePage = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero is-primary is-medium">
        <div className="hero-body">
          <div className="container">
            <div className="columns is-vcentered">
              <div className="column is-6">
                <h1 className="title is-1 has-text-white">
                  Discover Amazing Wines & Cocktails
                </h1>
                <h2 className="subtitle is-4 has-text-white">
                  Rate, review, and share your favorite beverages with a community of enthusiasts
                </h2>
                <div className="buttons">
                  <Link to="/search" className="button is-white is-medium">
                    <span className="icon">
                      <i className="fas fa-search"></i>
                    </span>
                    <span>Explore Beverages</span>
                  </Link>
                  <Link to="/login" className="button is-outlined is-white is-medium">
                    <span className="icon">
                      <i className="fas fa-user"></i>
                    </span>
                    <span>Join Community</span>
                  </Link>
                </div>
              </div>
              <div className="column is-6">
                <div className="has-text-centered">
                  <i className="fas fa-wine-glass-alt fa-6x has-text-white"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="container">
          <h2 className="title is-2 has-text-centered mb-6">Why Choose Our Platform?</h2>
          <div className="columns">
            <div className="column is-4">
              <div className="card">
                <div className="card-content has-text-centered">
                  <div className="mb-4">
                    <i className="fas fa-star fa-3x has-text-warning"></i>
                  </div>
                  <h3 className="title is-4">Rate & Review</h3>
                  <p className="subtitle is-6">
                    Rate your favorite wines and cocktails with our 5-star system and share detailed tasting notes.
                  </p>
                </div>
              </div>
            </div>
            <div className="column is-4">
              <div className="card">
                <div className="card-content has-text-centered">
                  <div className="mb-4">
                    <i className="fas fa-users fa-3x has-text-info"></i>
                  </div>
                  <h3 className="title is-4">Social Community</h3>
                  <p className="subtitle is-6">
                    Follow other enthusiasts, like and comment on reviews, and build your network.
                  </p>
                </div>
              </div>
            </div>
            <div className="column is-4">
              <div className="card">
                <div className="card-content has-text-centered">
                  <div className="mb-4">
                    <i className="fas fa-trophy fa-3x has-text-success"></i>
                  </div>
                  <h3 className="title is-4">Earn Badges</h3>
                  <p className="subtitle is-6">
                    Unlock achievements and badges as you explore different beverages and venues.
                  </p>
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
    </div>
  )
}

export default HomePage