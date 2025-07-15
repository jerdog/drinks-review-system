import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const PhotoGallery = ({
  photos = [],
  onDeletePhoto,
  className = '',
  showDelete = false,
  maxHeight = 'auto'
}) => {
  const { user } = useAuth();
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
  };

  const handleCloseLightbox = () => {
    setSelectedPhoto(null);
  };

  const handleDeletePhoto = async (photoId) => {
    if (onDeletePhoto) {
      await onDeletePhoto(photoId);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCloseLightbox();
    }
  };

  if (photos.length === 0) {
    return null;
  }

  return (
    <>
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
        {photos.map((photo) => (
          <div key={photo.id} className="relative group">
            <button
              type="button"
              onClick={() => handlePhotoClick(photo)}
              className="w-full h-32 md:h-40 lg:h-48 rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={`View ${photo.altText || 'photo'}`}
            >
              <img
                src={`${import.meta.env.VITE_API_URL}${photo.url}`}
                alt={photo.altText || 'Review photo'}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
              />
            </button>

            {showDelete && user?.id === photo.userId && (
              <button
                type="button"
                onClick={() => handleDeletePhoto(photo.id)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label={`Delete ${photo.altText || 'photo'}`}
              >
                ×
              </button>
            )}

            {photo.user && (
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                {photo.user.displayName || photo.user.username}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={handleCloseLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="dialog"
          aria-label="Photo lightbox"
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              type="button"
              onClick={handleCloseLightbox}
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white rounded"
              aria-label="Close lightbox"
            >
              ×
            </button>

            <img
              src={`${import.meta.env.VITE_API_URL}${selectedPhoto.url}`}
              alt={selectedPhoto.altText || 'Review photo'}
              className="max-w-full max-h-full object-contain"
            />

            {selectedPhoto.altText && (
              <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded">
                <p className="text-sm">{selectedPhoto.altText}</p>
                {selectedPhoto.user && (
                  <p className="text-xs text-gray-300 mt-1">
                    by {selectedPhoto.user.displayName || selectedPhoto.user.username}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PhotoGallery;