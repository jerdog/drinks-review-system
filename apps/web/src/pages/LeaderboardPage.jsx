import React, { useState } from 'react';

/**
 * Leaderboard page component
 * @returns {JSX.Element} The leaderboard page
 */
function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState('reviewers');

  const topReviewers = [
    { rank: 1, username: '@wineexpert', name: 'Sarah Johnson', reviews: 156, followers: 1247, points: 2840 },
    { rank: 2, username: '@sommelier', name: 'Michael Chen', reviews: 142, followers: 892, points: 2650 },
    { rank: 3, username: '@cocktailking', name: 'David Rodriguez', reviews: 98, followers: 756, points: 1980 },
    { rank: 4, username: '@vintagehunter', name: 'Emma Thompson', reviews: 87, followers: 634, points: 1750 },
    { rank: 5, username: '@spiritguide', name: 'James Wilson', reviews: 76, followers: 521, points: 1520 },
  ];

  const topVenues = [
    { rank: 1, name: 'The Grand Cellar', location: 'New York, NY', checkins: 342, rating: 4.8 },
    { rank: 2, name: 'Vintage Lounge', location: 'San Francisco, CA', checkins: 298, rating: 4.7 },
    { rank: 3, name: 'Cork & Barrel', location: 'Chicago, IL', checkins: 267, rating: 4.6 },
    { rank: 4, name: 'The Wine Room', location: 'Los Angeles, CA', checkins: 234, rating: 4.5 },
    { rank: 5, name: 'Spirit House', location: 'Miami, FL', checkins: 198, rating: 4.4 },
  ];

  const topBeverages = [
    { rank: 1, name: 'Château Margaux 2015', category: 'Red Wine', reviews: 89, avgRating: 4.9 },
    { rank: 2, name: 'Negroni', category: 'Cocktail', reviews: 156, avgRating: 4.8 },
    { rank: 3, name: 'Dom Pérignon 2012', category: 'Sparkling Wine', reviews: 67, avgRating: 4.8 },
    { rank: 4, name: 'Old Fashioned', category: 'Cocktail', reviews: 134, avgRating: 4.7 },
    { rank: 5, name: 'Barolo 2018', category: 'Red Wine', reviews: 45, avgRating: 4.7 },
  ];

  return (
    <div className="container">
      <section className="section">
        <h1 className="title">Leaderboard</h1>
        <p className="subtitle">Discover the top contributors and venues</p>

        <div className="tabs is-centered">
          <ul>
            <li className={activeTab === 'reviewers' ? 'is-active' : ''}>
              <a onClick={() => setActiveTab('reviewers')}>Top Reviewers</a>
            </li>
            <li className={activeTab === 'venues' ? 'is-active' : ''}>
              <a onClick={() => setActiveTab('venues')}>Top Venues</a>
            </li>
            <li className={activeTab === 'beverages' ? 'is-active' : ''}>
              <a onClick={() => setActiveTab('beverages')}>Top Beverages</a>
            </li>
          </ul>
        </div>

        {activeTab === 'reviewers' && (
          <div className="box">
            <h2 className="title is-4">Top Reviewers</h2>
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
                  {topReviewers.map((reviewer) => (
                    <tr key={reviewer.rank}>
                      <td>
                        <span className={`tag ${reviewer.rank === 1 ? 'is-warning' : reviewer.rank === 2 ? 'is-light' : reviewer.rank === 3 ? 'is-danger' : 'is-dark'}`}>
                          #{reviewer.rank}
                        </span>
                      </td>
                      <td>
                        <div className="media">
                          <div className="media-left">
                            <figure className="image is-32x32">
                              <img
                                className="is-rounded"
                                src="https://bulma.io/images/placeholders/32x32.png"
                                alt="Avatar"
                              />
                            </figure>
                          </div>
                          <div className="media-content">
                            <p className="title is-6">{reviewer.name}</p>
                            <p className="subtitle is-7">{reviewer.username}</p>
                          </div>
                        </div>
                      </td>
                      <td>{reviewer.reviews}</td>
                      <td>{reviewer.followers}</td>
                      <td>{reviewer.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'venues' && (
          <div className="box">
            <h2 className="title is-4">Top Venues</h2>
            <div className="table-container">
              <table className="table is-fullwidth">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Venue</th>
                    <th>Location</th>
                    <th>Check-ins</th>
                    <th>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {topVenues.map((venue) => (
                    <tr key={venue.rank}>
                      <td>
                        <span className={`tag ${venue.rank === 1 ? 'is-warning' : venue.rank === 2 ? 'is-light' : venue.rank === 3 ? 'is-danger' : 'is-dark'}`}>
                          #{venue.rank}
                        </span>
                      </td>
                      <td>
                        <p className="title is-6">{venue.name}</p>
                      </td>
                      <td>{venue.location}</td>
                      <td>{venue.checkins}</td>
                      <td>
                        <div className="stars">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`icon ${i < Math.floor(venue.rating) ? 'has-text-warning' : 'has-text-grey-light'}`}>
                              <i className="fas fa-star"></i>
                            </span>
                          ))}
                          <span className="ml-2">{venue.rating}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'beverages' && (
          <div className="box">
            <h2 className="title is-4">Top Beverages</h2>
            <div className="table-container">
              <table className="table is-fullwidth">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Beverage</th>
                    <th>Category</th>
                    <th>Reviews</th>
                    <th>Avg Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {topBeverages.map((beverage) => (
                    <tr key={beverage.rank}>
                      <td>
                        <span className={`tag ${beverage.rank === 1 ? 'is-warning' : beverage.rank === 2 ? 'is-light' : beverage.rank === 3 ? 'is-danger' : 'is-dark'}`}>
                          #{beverage.rank}
                        </span>
                      </td>
                      <td>
                        <p className="title is-6">{beverage.name}</p>
                      </td>
                      <td>
                        <span className="tag is-info">{beverage.category}</span>
                      </td>
                      <td>{beverage.reviews}</td>
                      <td>
                        <div className="stars">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`icon ${i < Math.floor(beverage.avgRating) ? 'has-text-warning' : 'has-text-grey-light'}`}>
                              <i className="fas fa-star"></i>
                            </span>
                          ))}
                          <span className="ml-2">{beverage.avgRating}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default LeaderboardPage;