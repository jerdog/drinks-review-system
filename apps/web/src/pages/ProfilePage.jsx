import React from 'react';
import { useParams } from 'react-router-dom';

/**
 * User profile page component
 * @returns {JSX.Element} The profile page
 */
function ProfilePage() {
  const { username } = useParams();

  return (
    <div className="container">
      <section className="section">
        <div className="columns">
          <div className="column is-4">
            <div className="box">
              <div className="has-text-centered">
                <figure className="image is-128x128 is-inline-block">
                  <img
                    className="is-rounded"
                    src="https://bulma.io/images/placeholders/128x128.png"
                    alt="Profile"
                  />
                </figure>
                <h1 className="title">@{username}</h1>
                <p className="subtitle">Wine Enthusiast</p>

                <div className="buttons is-centered">
                  <button className="button is-primary">Follow</button>
                  <button className="button is-outlined">Message</button>
                </div>
              </div>

              <hr />

              <div className="content">
                <h4 className="title is-5">Stats</h4>
                <div className="columns is-mobile">
                  <div className="column has-text-centered">
                    <p className="heading">Reviews</p>
                    <p className="title is-4">42</p>
                  </div>
                  <div className="column has-text-centered">
                    <p className="heading">Followers</p>
                    <p className="title is-4">128</p>
                  </div>
                  <div className="column has-text-centered">
                    <p className="heading">Following</p>
                    <p className="title is-4">64</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="column is-8">
            <div className="tabs">
              <ul>
                <li className="is-active"><a>Reviews</a></li>
                <li><a>Check-ins</a></li>
                <li><a>Photos</a></li>
                <li><a>Badges</a></li>
              </ul>
            </div>

            <div className="box">
              <h2 className="title is-4">Recent Reviews</h2>
              <p className="has-text-grey">No reviews to show.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProfilePage;