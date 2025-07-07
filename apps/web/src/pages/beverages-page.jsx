import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const BeverageCard = ({ beverage }) => (
  <Link
    to={`/beverages/${beverage.id}`}
    className="block bg-white rounded-lg shadow hover:shadow-lg transition p-4 mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
    tabIndex={0}
    aria-label={`View details for ${beverage.name}`}
    onKeyDown={e => { if (e.key === 'Enter') window.location = `/beverages/${beverage.id}`; }}
  >
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <h2 className="text-lg font-bold text-gray-900">{beverage.name}</h2>
        <div className="text-sm text-gray-500">{beverage.type} {beverage.region && `· ${beverage.region}`}</div>
        <div className="text-xs text-gray-400">Category: {beverage.category?.name || '—'}</div>
      </div>
      <div className="text-right">
        <span className="inline-block bg-primary-100 text-primary-700 rounded px-2 py-1 text-xs font-semibold">
          {beverage._count?.reviews || 0} reviews
        </span>
      </div>
    </div>
  </Link>
);

const BeveragesPage = () => {
  const [beverages, setBeverages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBeverages();
    // eslint-disable-next-line
  }, [search, category, type, page]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/beverages/categories`);
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      setCategories([]);
    }
  };

  const fetchBeverages = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        ...(search && { search }),
        ...(category && { category }),
        ...(type && { type }),
        page,
        limit: 10
      });
      const res = await fetch(`${API_URL}/beverages?${params.toString()}`);
      const data = await res.json();
      setBeverages(data.beverages || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err) {
      setError('Failed to load beverages.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = e => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleCategory = e => {
    setCategory(e.target.value);
    setPage(1);
  };

  const handleType = e => {
    setType(e.target.value);
    setPage(1);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Discover Beverages</h1>
      <form className="flex flex-col md:flex-row gap-4 mb-6" onSubmit={e => e.preventDefault()}>
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Search by name, region, varietal..."
          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Search beverages"
        />
        <select
          value={category}
          onChange={handleCategory}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <select
          value={type}
          onChange={handleType}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Filter by type"
        >
          <option value="">All Types</option>
          <option value="wine">Wine</option>
          <option value="cocktail">Cocktail</option>
          <option value="liquor">Liquor</option>
        </select>
      </form>
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : error ? (
        <div className="text-red-600 text-center py-8">{error}</div>
      ) : beverages.length === 0 ? (
        <div className="text-gray-500 text-center py-8">No beverages found.</div>
      ) : (
        <div>
          {beverages.map(beverage => (
            <BeverageCard key={beverage.id} beverage={beverage} />
          ))}
          <div className="flex justify-center gap-2 mt-6">
            <button
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
            >
              Prev
            </button>
            <span className="px-3 py-1 text-gray-700">Page {page} of {totalPages}</span>
            <button
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BeveragesPage;