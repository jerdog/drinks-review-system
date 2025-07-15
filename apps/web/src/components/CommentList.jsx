import React from 'react';
import { Link } from 'react-router-dom';

const CommentList = ({ comments = [] }) => {
  if (comments.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm">
        No comments yet. Be the first to comment!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map(comment => (
        <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 flex-shrink-0">
              {comment.user?.displayName?.charAt(0) || comment.user?.username?.charAt(0) || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Link
                  to={`/users/${comment.user?.username}`}
                  className="font-medium text-sm text-gray-900 hover:underline"
                >
                  {comment.user?.displayName || comment.user?.username}
                </Link>
                <span className="text-xs text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentList;