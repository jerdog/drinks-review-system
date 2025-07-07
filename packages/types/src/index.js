/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {*} [data]
 * @property {string} [error]
 * @property {string} [message]
 */

/**
 * @typedef {Object} PaginatedResponse
 * @extends {ApiResponse}
 * @property {Object} pagination
 * @property {number} pagination.page
 * @property {number} pagination.limit
 * @property {number} pagination.total
 * @property {number} pagination.totalPages
 */

/**
 * @typedef {Object} UserProfile
 * @property {string} id
 * @property {string} email
 * @property {string} username
 * @property {string} [displayName]
 * @property {string} [bio]
 * @property {string} [location]
 * @property {string} [avatar]
 * @property {boolean} isPrivate
 * @property {boolean} isVerified
 * @property {Object} [preferences]
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} UserPreferences
 * @property {boolean} emailNotifications
 * @property {boolean} pushNotifications
 * @property {'infinite'|'pagination'} timelineView
 * @property {Object} privacy
 * @property {boolean} privacy.showEmail
 * @property {boolean} privacy.showLocation
 * @property {boolean} privacy.allowFollows
 * @property {Object} favorites
 * @property {string[]} favorites.regions
 * @property {string[]} favorites.varietals
 * @property {string[]} favorites.types
 */

/**
 * @typedef {Object} BeverageCategory
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {string} [description]
 * @property {string} [parentId]
 * @property {BeverageCategory} [parent]
 * @property {BeverageCategory[]} [children]
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} Beverage
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {string} [description]
 * @property {'wine'|'cocktail'|'liquor'} type
 * @property {string} [region]
 * @property {string} [varietal]
 * @property {number} [abv]
 * @property {number} [vintage]
 * @property {boolean} isApproved
 * @property {string} [suggestedBy]
 * @property {string} categoryId
 * @property {BeverageCategory} category
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} Review
 * @property {string} id
 * @property {number} rating
 * @property {string} [notes]
 * @property {number} [price]
 * @property {'bottle'|'glass'|'shot'} [servingType]
 * @property {boolean} isAnonymous
 * @property {boolean} isPublic
 * @property {string} userId
 * @property {UserProfile} user
 * @property {string} beverageId
 * @property {Beverage} beverage
 * @property {string} [venueId]
 * @property {Venue} [venue]
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {Object} [_count]
 * @property {number} [_count.likes]
 * @property {number} [_count.comments]
 * @property {number} [_count.photos]
 */

/**
 * @typedef {Object} Venue
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {string} [description]
 * @property {string} [address]
 * @property {string} [city]
 * @property {string} [state]
 * @property {string} [country]
 * @property {number} [latitude]
 * @property {number} [longitude]
 * @property {string} [website]
 * @property {string} [phone]
 * @property {boolean} isVerified
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} Comment
 * @property {string} id
 * @property {string} content
 * @property {string} userId
 * @property {UserProfile} user
 * @property {string} reviewId
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} Like
 * @property {string} id
 * @property {string} userId
 * @property {UserProfile} user
 * @property {string} reviewId
 * @property {string} createdAt
 */

/**
 * @typedef {Object} CheckIn
 * @property {string} id
 * @property {string} userId
 * @property {UserProfile} user
 * @property {string} venueId
 * @property {Venue} venue
 * @property {string} [reviewId]
 * @property {Review} [review]
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Photo
 * @property {string} id
 * @property {string} url
 * @property {string} [altText]
 * @property {string} userId
 * @property {UserProfile} user
 * @property {string} [reviewId]
 * @property {Review} [review]
 * @property {string} [beverageId]
 * @property {Beverage} [beverage]
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Badge
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {string} description
 * @property {string} icon
 * @property {string} [color]
 * @property {*} [criteria]
 * @property {boolean} isActive
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} UserBadge
 * @property {string} id
 * @property {string} userId
 * @property {UserProfile} user
 * @property {string} badgeId
 * @property {Badge} badge
 * @property {string} earnedAt
 */

/**
 * @typedef {Object} Achievement
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {string} description
 * @property {string} icon
 * @property {number} points
 * @property {*} criteria
 * @property {boolean} isActive
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} UserAchievement
 * @property {string} id
 * @property {string} userId
 * @property {UserProfile} user
 * @property {string} achievementId
 * @property {Achievement} achievement
 * @property {string} earnedAt
 */

/**
 * @typedef {Object} Notification
 * @property {string} id
 * @property {'like'|'comment'|'follow'|'achievement'|'badge'|'mention'} type
 * @property {string} title
 * @property {string} message
 * @property {*} [data]
 * @property {boolean} isRead
 * @property {string} userId
 * @property {UserProfile} user
 * @property {string} createdAt
 */

/**
 * @typedef {Object} TimelineItem
 * @property {string} id
 * @property {'review'|'checkin'|'achievement'|'badge'} type
 * @property {Review|CheckIn|UserAchievement|UserBadge} data
 * @property {string} createdAt
 */

/**
 * @typedef {Object} SearchFilters
 * @property {string} [query]
 * @property {string[]} [type]
 * @property {string[]} [region]
 * @property {string[]} [varietal]
 * @property {string[]} [category]
 * @property {number[]} [rating]
 * @property {Object} [price]
 * @property {number} [price.min]
 * @property {number} [price.max]
 * @property {Object} [abv]
 * @property {number} [abv.min]
 * @property {number} [abv.max]
 * @property {Object} [vintage]
 * @property {number} [vintage.min]
 * @property {number} [vintage.max]
 */

/**
 * @typedef {Object} ReviewFilters
 * @extends {SearchFilters}
 * @property {string} [userId]
 * @property {string} [beverageId]
 * @property {string} [venueId]
 * @property {boolean} [isPublic]
 * @property {boolean} [hasPhotos]
 * @property {boolean} [hasCheckIn]
 */

/**
 * @typedef {Object} CreateReviewData
 * @property {string} beverageId
 * @property {number} rating
 * @property {string} [notes]
 * @property {number} [price]
 * @property {'bottle'|'glass'|'shot'} [servingType]
 * @property {boolean} [isAnonymous]
 * @property {boolean} [isPublic]
 * @property {string} [venueId]
 * @property {any[]} [photos]
 */

/**
 * @typedef {Object} UpdateReviewData
 * @property {number} [rating]
 * @property {string} [notes]
 * @property {number} [price]
 * @property {'bottle'|'glass'|'shot'} [servingType]
 * @property {boolean} [isAnonymous]
 * @property {boolean} [isPublic]
 * @property {string} [venueId]
 */

/**
 * @typedef {Object} CreateBeverageSuggestion
 * @property {string} name
 * @property {string} [description]
 * @property {'wine'|'cocktail'|'liquor'} type
 * @property {string} [region]
 * @property {string} [varietal]
 * @property {number} [abv]
 * @property {number} [vintage]
 * @property {string} categoryId
 */

/**
 * @typedef {Object} OAuthProvider
 * @property {string} id
 * @property {string} name
 * @property {string} clientId
 * @property {string} redirectUri
 * @property {string[]} scope
 */

/**
 * @typedef {Object} ApiError
 * @property {string} code
 * @property {string} message
 * @property {*} [details]
 */

/**
 * @typedef {Object} PaginationParams
 * @property {number} [page]
 * @property {number} [limit]
 * @property {string} [sortBy]
 * @property {'asc'|'desc'} [sortOrder]
 */

/**
 * @typedef {Object} FileUploadResult
 * @property {string} url
 * @property {string} [altText]
 * @property {number} size
 * @property {string} mimeType
 */

/**
 * @typedef {Object} LeaderboardEntry
 * @property {UserProfile} user
 * @property {number} score
 * @property {number} reviews
 * @property {number} followers
 * @property {number} checkIns
 * @property {number} badges
 * @property {number} achievements
 */

/**
 * @typedef {Object} UserStats
 * @property {number} totalReviews
 * @property {number} averageRating
 * @property {number} totalCheckIns
 * @property {number} totalFollowers
 * @property {number} totalFollowing
 * @property {number} badges
 * @property {number} achievements
 * @property {number} points
 * @property {string[]} favoriteRegions
 * @property {string[]} favoriteVarietals
 * @property {Object[]} reviewHistory
 * @property {string} reviewHistory[].date
 * @property {number} reviewHistory[].count
 */

// Export all type definitions for use in JSDoc comments
export {
  // Types are defined above as JSDoc comments
  // This allows for better IDE support and documentation
}