import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

const PhotoUpload = ({
  onUploadSuccess,
  onUploadError,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  reviewId = null,
  beverageId = null,
  className = ''
}) => {
  const { token } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewFiles, setPreviewFiles] = useState([]);
  const fileInputRef = useRef(null);

  const validateFile = useCallback((file) => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' };
    }

    // Check file size
    if (file.size > maxSize) {
      return { valid: false, error: `File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.` };
    }

    return { valid: true };
  }, [acceptedTypes, maxSize]);

  const handleFileSelect = useCallback((files) => {
    const validFiles = [];
    const errors = [];

    Array.from(files).forEach((file) => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      onUploadError?.(errors.join('\n'));
    }

    if (validFiles.length > 0) {
      // Create preview URLs
      const newPreviews = validFiles.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        url: URL.createObjectURL(file),
        name: file.name
      }));

      setPreviewFiles(prev => [...prev, ...newPreviews].slice(0, maxFiles));
    }
  }, [validateFile, maxFiles, onUploadError]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const removePreview = useCallback((id) => {
    setPreviewFiles(prev => {
      const updated = prev.filter(file => file.id !== id);
      // Revoke the object URL to free memory
      const removedFile = prev.find(file => file.id === id);
      if (removedFile) {
        URL.revokeObjectURL(removedFile.url);
      }
      return updated;
    });
  }, []);

  const uploadFiles = useCallback(async () => {
    if (previewFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();

      previewFiles.forEach((preview, index) => {
        formData.append('files', preview.file);
        formData.append('altText', preview.name);
        if (reviewId) formData.append('reviewId', reviewId);
        if (beverageId) formData.append('beverageId', beverageId);
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/upload/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();

      if (result.success) {
        onUploadSuccess?.(result.data);
        // Clear previews
        previewFiles.forEach(preview => URL.revokeObjectURL(preview.url));
        setPreviewFiles([]);
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      onUploadError?.(error.message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [previewFiles, reviewId, beverageId, token, onUploadSuccess, onUploadError]);

  const handleUploadClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleUploadClick();
    }
  }, [handleUploadClick]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <button
        type="button"
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors w-full
          ${isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
          }
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        aria-label="Upload area - drag and drop files here or click to select"
        onKeyDown={handleKeyDown}
        onClick={handleUploadClick}
        disabled={isUploading}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isUploading}
        />

        <div className="space-y-2">
          <div className="text-gray-600">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="text-sm text-gray-600">
            <span className="font-medium text-blue-600">Click to upload</span>
            {' '}or drag and drop
          </div>

          <p className="text-xs text-gray-500">
            PNG, JPG, WebP up to {Math.round(maxSize / 1024 / 1024)}MB
          </p>
        </div>
      </button>

      {/* Preview Area */}
      {previewFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">
              Selected Photos ({previewFiles.length}/{maxFiles})
            </h3>
            <button
              type="button"
              onClick={uploadFiles}
              disabled={isUploading}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : 'Upload Photos'}
            </button>
          </div>

          {/* Progress Bar */}
          {isUploading && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          {/* Photo Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {previewFiles.map((preview) => (
              <div key={preview.id} className="relative group">
                <img
                  src={preview.url}
                  alt={preview.name}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removePreview(preview.id)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Remove ${preview.name}`}
                >
                  ×
                </button>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {preview.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;