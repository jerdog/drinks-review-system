import React, { useState } from 'react';

/**
 * Search page component for discovering wines and cocktails
 * @returns {JSX.Element} The search page
 */
function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all');

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: Implement search logic
    console.log('Searching for:', searchTerm, 'Type:', searchType);
  };

  return (
    <div className="container">
      <section className="section">
        <h1 className="title">Discover</h1>
        <p className="subtitle">Find your next favorite wine or cocktail</p>

        <div className="box">
          <form onSubmit={handleSearch}>
            <div className="field has-addons">
              <div className="control is-expanded">
                <input
                  className="input is-large"
                  type="text"
                  placeholder="Search for wines, cocktails, or venues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="control">
                <button className="button is-primary is-large" type="submit">
                  <span className="icon">
                    <i className="fas fa-search"></i>
                  </span>
                </button>
              </div>
            </div>

            <div className="field">
              <div className="control">
                <div className="buttons">
                  <button
                    className={`button ${searchType === 'all' ? 'is-primary' : 'is-outlined'}`}
                    onClick={() => setSearchType('all')}
                    type="button"
                  >
                    All
                  </button>
                  <button
                    className={`button ${searchType === 'wines' ? 'is-primary' : 'is-outlined'}`}
                    onClick={() => setSearchType('wines')}
                    type="button"
                  >
                    Wines
                  </button>
                  <button
                    className={`button ${searchType === 'cocktails' ? 'is-primary' : 'is-outlined'}`}
                    onClick={() => setSearchType('cocktails')}
                    type="button"
                  >
                    Cocktails
                  </button>
                  <button
                    className={`button ${searchType === 'venues' ? 'is-primary' : 'is-outlined'}`}
                    onClick={() => setSearchType('venues')}
                    type="button"
                  >
                    Venues
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="columns">
          <div className="column is-3">
            <div className="box">
              <h3 className="title is-5">Filters</h3>
              <div className="field">
                <label className="label">Category</label>
                <div className="control">
                  <div className="select is-fullwidth">
                    <select>
                      <option>All Categories</option>
                      <option>Red Wine</option>
                      <option>White Wine</option>
                      <option>Rosé Wine</option>
                      <option>Sparkling Wine</option>
                      <option>Whiskey</option>
                      <option>Gin</option>
                      <option>Vodka</option>
                      <option>Rum</option>
                      <option>Tequila</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="field">
                <label className="label">Price Range</label>
                <div className="control">
                  <div className="select is-fullwidth">
                    <select>
                      <option>Any Price</option>
                      <option>Under $20</option>
                      <option>$20 - $50</option>
                      <option>$50 - $100</option>
                      <option>Over $100</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="field">
                <label className="label">Rating</label>
                <div className="control">
                  <div className="select is-fullwidth">
                    <select>
                      <option>Any Rating</option>
                      <option>4+ Stars</option>
                      <option>3+ Stars</option>
                      <option>2+ Stars</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="column is-9">
            <div className="box">
              <h3 className="title is-4">Popular Now</h3>
              <div className="columns is-multiline">
                <div className="column is-4">
                  <div className="card">
                    <div className="card-image">
                      <figure className="image is-4by3">
                        <img src="https://bulma.io/images/placeholders/128x96.png" alt="Wine" />
                      </figure>
                    </div>
                    <div className="card-content">
                      <p className="title is-5">Château Margaux 2015</p>
                      <p className="subtitle is-6">Bordeaux, France</p>
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
                </div>

                <div className="column is-4">
                  <div className="card">
                    <div className="card-image">
                      <figure className="image is-4by3">
                        <img src="https://bulma.io/images/placeholders/128x96.png" alt="Cocktail" />
                      </figure>
                    </div>
                    <div className="card-content">
                      <p className="title is-5">Negroni</p>
                      <p className="subtitle is-6">Classic Cocktail</p>
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
                        <span className="icon has-text-warning">
                          <i className="fas fa-star"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="column is-4">
                  <div className="card">
                    <div className="card-image">
                      <figure className="image is-4by3">
                        <img src="https://bulma.io/images/placeholders/128x96.png" alt="Wine" />
                      </figure>
                    </div>
                    <div className="card-content">
                      <p className="title is-5">Dom Pérignon 2012</p>
                      <p className="subtitle is-6">Champagne, France</p>
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
                        <span className="icon has-text-warning">
                          <i className="fas fa-star"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default SearchPage;