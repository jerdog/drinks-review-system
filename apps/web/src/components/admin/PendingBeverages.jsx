import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const PendingBeverages = () => {
  const { user } = useAuth();
  const [beverages, setBeverages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBeverages, setTotalBeverages] = useState(0);
  const [processingBeverage, setProcessingBeverage] = useState(null);
  const [approvalReason, setApprovalReason] = useState('');

  const fetchPendingBeverages = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/beverages/pending?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBeverages(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalBeverages(data.pagination.total);
      } else {
        setError('Failed to fetch pending beverages');
      }
    } catch (error) {
      console.error('Pending beverages fetch error:', error);
      setError('Failed to fetch pending beverages');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    if (user?.isAdmin) {
      fetchPendingBeverages();
    }
  }, [user, fetchPendingBeverages]);

  const handleApproveBeverage = async (beverageId) => {
    try {
      setProcessingBeverage(beverageId);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/beverages/${beverageId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          approved: true,
          reason: approvalReason
        })
      });

      if (response.ok) {
        // Remove the approved beverage from the list
        setBeverages(beverages.filter(b => b.id !== beverageId));
        setTotalBeverages(prev => prev - 1);
        setApprovalReason('');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to approve beverage');
      }
    } catch (error) {
      console.error('Approve beverage error:', error);
      setError('Failed to approve beverage');
    } finally {
      setProcessingBeverage(null);
    }
  };

  const handleRejectBeverage = async (beverageId) => {
    try {
      setProcessingBeverage(beverageId);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/beverages/${beverageId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          approved: false,
          reason: approvalReason
        })
      });

      if (response.ok) {
        // Remove the rejected beverage from the list
        setBeverages(beverages.filter(b => b.id !== beverageId));
        setTotalBeverages(prev => prev - 1);
        setApprovalReason('');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to reject beverage');
      }
    } catch (error) {
      console.error('Reject beverage error:', error);
      setError('Failed to reject beverage');
    } finally {
      setProcessingBeverage(null);
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">
          Access denied. Admin privileges required.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pending Beverage Approvals</h1>
        <p className="text-gray-600 mt-1">Review and approve new beverage submissions</p>
      </div>

      {/* Approval Reason Input */}
      <div className="bg-white rounded-lg shadow p-6">
        <label htmlFor="approval-reason" className="block text-sm font-medium text-gray-700 mb-2">
          Approval/Rejection Reason (Optional)
        </label>
        <textarea
          id="approval-reason"
          value={approvalReason}
          onChange={(e) => setApprovalReason(e.target.value)}
          placeholder="Enter a reason for approval or rejection..."
          rows={3}
          className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Beverages List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Pending Beverages ({totalBeverages})
          </h2>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={`loading-beverage-${index}`} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="p-6">
            <p className="text-red-600">{error}</p>
          </div>
        ) : beverages.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No pending beverages to review</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-200">
              {beverages.map((beverage) => (
                <div key={beverage.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {beverage.name}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {beverage.category?.name}
                        </span>
                      </div>

                      <div className="mt-2 text-sm text-gray-600">
                        <p><strong>Type:</strong> {beverage.type}</p>
                        {beverage.description && (
                          <p className="mt-1"><strong>Description:</strong> {beverage.description}</p>
                        )}
                        {beverage.abv && (
                          <p className="mt-1"><strong>ABV:</strong> {beverage.abv}%</p>
                        )}
                        {beverage.origin && (
                          <p className="mt-1"><strong>Origin:</strong> {beverage.origin}</p>
                        )}
                        {beverage.manufacturer && (
                          <p className="mt-1"><strong>Manufacturer:</strong> {beverage.manufacturer}</p>
                        )}
                      </div>

                      <div className="mt-3 text-xs text-gray-500">
                        <p>Suggested by: {beverage.suggestedBy?.displayName || beverage.suggestedBy?.username || 'Unknown'}</p>
                        <p>Submitted: {new Date(beverage.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="ml-6 flex flex-col space-y-2">
                      <button
                        type="button"
                        onClick={() => handleApproveBeverage(beverage.id)}
                        disabled={processingBeverage === beverage.id}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                      >
                        {processingBeverage === beverage.id ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Approve
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRejectBeverage(beverage.id)}
                        disabled={processingBeverage === beverage.id}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                      >
                        {processingBeverage === beverage.id ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Reject
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing page <span className="font-medium">{currentPage}</span> of{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        type="button"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PendingBeverages;