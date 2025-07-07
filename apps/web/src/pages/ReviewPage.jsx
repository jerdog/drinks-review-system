import React from 'react';
import { useParams } from 'react-router-dom';

/**
 * Individual review page component
 * @returns {JSX.Element} The review page
 */
function ReviewPage() {
  const { id } = useParams();

  return (
    <div className="container">
      <section className="section">
        <div className="columns">
          <div className="column is-8">
            <div className="box">
              <div className="media">
                <div className="media-left">
                  <figure className="image is-64x64">
                    <img
                      src="https://bulma.io/images/placeholders/64x64.png"
                      alt="Beverage"
                    />
                  </figure>
                </div>
                <div className="media-content">
                  <h1 className="title">Château Margaux 2015</h1>
                  <p className="subtitle">Bordeaux, France</p>
                  <div className="stars">
                    <span className="icon has-text-warning">
                      <i className="fas fa-star"></i>
                    </span>
                    <span className="icon has-text-warning">
                      <i className="fas fa-star"></i>
                    </span>
                    <span className="icon has-text-warning">
                      <i className="fas fa-star"></i>
                    </span>
                    <span className="icon has-text-warning">
                      <i className="fas fa-star"></i>
                    </span>
                    <span className="icon has-text-grey-light">
                      <i className="far fa-star"></i>
                    </span>
                  </div>
                </div>
              </div>

              <div className="content">
                <p>
                  Exceptional vintage with deep, complex flavors. Notes of blackberry,
                  cassis, and subtle oak. The tannins are well-integrated and the
                  finish is long and elegant. A truly remarkable wine that showcases
                  the best of Bordeaux.
                </p>

                <div className="tags">
                  <span className="tag is-primary">Red Wine</span>
                  <span className="tag is-info">Bordeaux</span>
                  <span className="tag is-success">Premium</span>
                </div>
              </div>

              <div className="columns">
                <div className="column">
                  <p><strong>Price:</strong> $850</p>
                </div>
                <div className="column">
                  <p><strong>Serving:</strong> Bottle</p>
                </div>
                <div className="column">
                  <p><strong>Location:</strong> Home</p>
                </div>
              </div>
            </div>

            <div className="box">
              <h3 className="title is-4">Comments</h3>
              <p className="has-text-grey">No comments yet.</p>
            </div>
          </div>

          <div className="column is-4">
            <div className="box">
              <h3 className="title is-5">Reviewer</h3>
              <div className="media">
                <div className="media-left">
                  <figure className="image is-48x48">
                    <img
                      className="is-rounded"
                      src="https://bulma.io/images/placeholders/48x48.png"
                      alt="Reviewer"
                    />
                  </figure>
                </div>
                <div className="media-content">
                  <p className="title is-6">@wineenthusiast</p>
                  <p className="subtitle is-7">Wine Expert</p>
                </div>
              </div>
            </div>

            <div className="box">
              <h3 className="title is-5">Actions</h3>
              <div className="buttons">
                <button className="button is-primary">
                  <span className="icon">
                    <i className="fas fa-heart"></i>
                  </span>
                  <span>Like</span>
                </button>
                <button className="button is-outlined">
                  <span className="icon">
                    <i className="fas fa-comment"></i>
                  </span>
                  <span>Comment</span>
                </button>
                <button className="button is-outlined">
                  <span className="icon">
                    <i className="fas fa-share"></i>
                  </span>
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ReviewPage;