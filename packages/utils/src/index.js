/**
 * Validation utilities
 */

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates username format (3-20 alphanumeric characters and underscores)
 * @param {string} username - Username to validate
 * @returns {boolean} - True if valid username format
 */
export const validateUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
  return usernameRegex.test(username)
}

/**
 * Validates password length (minimum 8 characters)
 * @param {string} password - Password to validate
 * @returns {boolean} - True if valid password length
 */
export const validatePassword = (password) => {
  return password.length >= 8
}

/**
 * Formatting utilities
 */

/**
 * Formats number as currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount)
}

/**
 * Formats date to readable string
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (date) => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Formats date and time to readable string
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date and time string
 */
export const formatDateTime = (date) => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Formats date as relative time (e.g., "2 hours ago")
 * @param {string|Date} date - Date to format
 * @returns {string} - Relative time string
 */
export const formatRelativeTime = (date) => {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`
  return `${Math.floor(diffInSeconds / 31536000)}y ago`
}

/**
 * String utilities
 */

/**
 * Converts text to URL-friendly slug
 * @param {string} text - Text to slugify
 * @returns {string} - URL-friendly slug
 */
export const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Truncates text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Capitalizes first letter of text
 * @param {string} text - Text to capitalize
 * @returns {string} - Capitalized text
 */
export const capitalize = (text) => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * Array utilities
 */

/**
 * Splits array into chunks of specified size
 * @param {Array} array - Array to chunk
 * @param {number} size - Size of each chunk
 * @returns {Array} - Array of chunks
 */
export const chunk = (array, size) => {
  const chunks = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

/**
 * Removes duplicates from array
 * @param {Array} array - Array to deduplicate
 * @returns {Array} - Array with unique values
 */
export const unique = (array) => {
  return [...new Set(array)]
}

/**
 * Groups array items by key
 * @param {Array} array - Array to group
 * @param {Function} key - Function to get grouping key
 * @returns {Object} - Object with grouped items
 */
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = key(item)
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {})
}

/**
 * Number utilities
 */

/**
 * Clamps value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Clamped value
 */
export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max)
}

/**
 * Rounds number to specified decimal places
 * @param {number} value - Value to round
 * @param {number} decimals - Number of decimal places
 * @returns {number} - Rounded value
 */
export const roundTo = (value, decimals) => {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

/**
 * Object utilities
 */

/**
 * Picks specified keys from object
 * @param {Object} obj - Object to pick from
 * @param {Array} keys - Keys to pick
 * @returns {Object} - Object with picked keys
 */
export const pick = (obj, keys) => {
  const result = {}
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

/**
 * Omits specified keys from object
 * @param {Object} obj - Object to omit from
 * @param {Array} keys - Keys to omit
 * @returns {Object} - Object without omitted keys
 */
export const omit = (obj, keys) => {
  const result = { ...obj }
  keys.forEach(key => {
    delete result[key]
  })
  return result
}

/**
 * URL utilities
 */

/**
 * Builds URL with query parameters
 * @param {string} base - Base URL
 * @param {Object} params - Query parameters
 * @returns {string} - URL with parameters
 */
export const buildUrl = (base, params) => {
  const url = new URL(base, 'http://localhost')
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value))
    }
  })
  return url.toString()
}

/**
 * Parses query parameters from URL
 * @param {string} url - URL to parse
 * @returns {Object} - Object with query parameters
 */
export const parseQueryParams = (url) => {
  const params = new URLSearchParams(url.split('?')[1] || '')
  const result = {}
  params.forEach((value, key) => {
    result[key] = value
  })
  return result
}

/**
 * File utilities
 */

/**
 * Gets file extension from filename
 * @param {string} filename - Filename to get extension from
 * @returns {string} - File extension
 */
export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

/**
 * Formats file size in human readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Validates image file
 * @param {File} file - File to validate
 * @returns {boolean} - True if valid image file
 */
export const validateImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const maxSize = 10 * 1024 * 1024 // 10MB
  return validTypes.includes(file.type) && file.size <= maxSize
}

/**
 * Rating utilities
 */

/**
 * Calculates average rating from array of ratings
 * @param {Array<number>} ratings - Array of ratings
 * @returns {number} - Average rating
 */
export const calculateAverageRating = (ratings) => {
  if (ratings.length === 0) return 0
  return roundTo(ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length, 1)
}

/**
 * Gets CSS class for rating color
 * @param {number} rating - Rating value
 * @returns {string} - CSS class name
 */
export const getRatingColor = (rating) => {
  if (rating >= 4.5) return 'is-success'
  if (rating >= 3.5) return 'is-warning'
  if (rating >= 2.5) return 'is-info'
  return 'is-danger'
}

/**
 * Pagination utilities
 */

/**
 * Calculates pagination information
 * @param {number} total - Total number of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} - Pagination information
 */
export const calculatePagination = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit)
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  }
}

/**
 * Search utilities
 */

/**
 * Highlights search terms in text
 * @param {string} text - Text to highlight
 * @param {string} searchTerm - Term to highlight
 * @returns {string} - Text with highlighted terms
 */
export const highlightSearchTerm = (text, searchTerm) => {
  if (!searchTerm) return text
  const regex = new RegExp(`(${searchTerm})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}