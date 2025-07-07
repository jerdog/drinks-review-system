import React from 'react';

/**
 * Dashboard page for logged-in users
 * @returns {JSX.Element} The dashboard page
 */
function DashboardPage() {
  return (
    <div className="container">
      <section className="section">
        <div className="columns">
          <div className="column is-8">
            <h1 className="title">Dashboard</h1>
            <p className="subtitle">Welcome back! Here's what's happening with your reviews.</p>

            <div className="box">
              <h2 className="title is-4">Recent Activity</h2>
              <p className="has-text-grey">No recent activity to show.</p>
            </div>

            <div className="box">
              <h2 className="title is-4">Your Reviews</h2>
              <p className="has-text-grey">You haven't written any reviews yet.</p>
              <button className="button is-primary">Write Your First Review</button>
            </div>
          </div>

          <div className="column is-4">
            <div className="box">
              <h3 className="title is-5">Quick Stats</h3>
              <div className="content">
                <p><strong>Reviews:</strong> 0</p>
                <p><strong>Followers:</strong> 0</p>
                <p><strong>Following:</strong> 0</p>
                <p><strong>Points:</strong> 0</p>
              </div>
            </div>

            <div className="box">
              <h3 className="title is-5">Recent Check-ins</h3>
              <p className="has-text-grey">No recent check-ins.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;