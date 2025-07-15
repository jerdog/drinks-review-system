// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// User types
export interface UserProfile {
  id: string
  email: string
  username: string
  displayName?: string
  bio?: string
  location?: string
  avatar?: string
  isPrivate: boolean
  isVerified: boolean
  preferences?: UserPreferences
  createdAt: string
  updatedAt: string
}

export interface UserPreferences {
  emailNotifications: boolean
  pushNotifications: boolean
  timelineView: 'infinite' | 'pagination'
  privacy: {
    showEmail: boolean
    showLocation: boolean
    allowFollows: boolean
  }
  favorites: {
    regions: string[]
    varietals: string[]
    types: string[]
  }
}

// Beverage types
export interface BeverageCategory {
  id: string
  name: string
  slug: string
  description?: string
  parentId?: string
  parent?: BeverageCategory
  children?: BeverageCategory[]
  createdAt: string
  updatedAt: string
}

export interface Beverage {
  id: string
  name: string
  slug: string
  description?: string
  type: 'wine' | 'cocktail' | 'spirit'
  region?: string
  varietal?: string
  abv?: number
  vintage?: number
  isApproved: boolean
  suggestedBy?: string
  categoryId: string
  category: BeverageCategory
  createdAt: string
  updatedAt: string
}

// Review types
export interface Review {
  id: string
  rating: number
  notes?: string
  price?: number
  servingType?: 'bottle' | 'glass' | 'shot'
  isAnonymous: boolean
  isPublic: boolean
  userId: string
  user: UserProfile
  beverageId: string
  beverage: Beverage
  venueId?: string
  venue?: Venue
  createdAt: string
  updatedAt: string
  _count?: {
    likes: number
    comments: number
    photos: number
  }
}

// Venue types
export interface Venue {
  id: string
  name: string
  slug: string
  description?: string
  address?: string
  city?: string
  state?: string
  country?: string
  latitude?: number
  longitude?: number
  website?: string
  phone?: string
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

// Social types
export interface Comment {
  id: string
  content: string
  userId: string
  user: UserProfile
  reviewId: string
  createdAt: string
  updatedAt: string
}

export interface Like {
  id: string
  userId: string
  user: UserProfile
  reviewId: string
  createdAt: string
}

export interface CheckIn {
  id: string
  userId: string
  user: UserProfile
  venueId: string
  venue: Venue
  reviewId?: string
  review?: Review
  createdAt: string
}

// Photo types
export interface Photo {
  id: string
  url: string
  altText?: string
  userId: string
  user: UserProfile
  reviewId?: string
  review?: Review
  beverageId?: string
  beverage?: Beverage
  createdAt: string
}

// Badge and Achievement types
export interface Badge {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color?: string
  criteria?: any
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface UserBadge {
  id: string
  userId: string
  user: UserProfile
  badgeId: string
  badge: Badge
  earnedAt: string
}

export interface Achievement {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  points: number
  criteria: any
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface UserAchievement {
  id: string
  userId: string
  user: UserProfile
  achievementId: string
  achievement: Achievement
  earnedAt: string
}

// Notification types
export interface Notification {
  id: string
  type: 'like' | 'comment' | 'follow' | 'achievement' | 'badge' | 'mention'
  title: string
  message: string
  data?: any
  isRead: boolean
  userId: string
  user: UserProfile
  createdAt: string
}

// Timeline types
export interface TimelineItem {
  id: string
  type: 'review' | 'checkin' | 'achievement' | 'badge'
  data: Review | CheckIn | UserAchievement | UserBadge
  createdAt: string
}

// Search and Filter types
export interface SearchFilters {
  query?: string
  type?: string[]
  region?: string[]
  varietal?: string[]
  category?: string[]
  rating?: number[]
  price?: {
    min?: number
    max?: number
  }
  abv?: {
    min?: number
    max?: number
  }
  vintage?: {
    min?: number
    max?: number
  }
}

export interface ReviewFilters extends SearchFilters {
  userId?: string
  beverageId?: string
  venueId?: string
  isPublic?: boolean
  hasPhotos?: boolean
  hasCheckIn?: boolean
}

// Form types
export interface CreateReviewData {
  beverageId: string
  rating: number
  notes?: string
  price?: number
  servingType?: 'bottle' | 'glass' | 'shot'
  isAnonymous?: boolean
  isPublic?: boolean
  venueId?: string
  photos?: any[] // File[] will be handled in the frontend
}

export interface UpdateReviewData {
  rating?: number
  notes?: string
  price?: number
  servingType?: 'bottle' | 'glass' | 'shot'
  isAnonymous?: boolean
  isPublic?: boolean
  venueId?: string
}

export interface CreateBeverageSuggestion {
  name: string
  description?: string
  type: 'wine' | 'cocktail' | 'spirit'
  region?: string
  varietal?: string
  abv?: number
  vintage?: number
  categoryId: string
}

// OAuth types
export interface OAuthProvider {
  id: string
  name: string
  clientId: string
  redirectUri: string
  scope: string[]
}

// API Error types
export interface ApiError {
  code: string
  message: string
  details?: any
}

// Pagination types
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// File upload types
export interface FileUploadResult {
  url: string
  altText?: string
  size: number
  mimeType: string
}

// Leaderboard types
export interface LeaderboardEntry {
  user: UserProfile
  score: number
  reviews: number
  followers: number
  checkIns: number
  badges: number
  achievements: number
}

// Stats types
export interface UserStats {
  totalReviews: number
  averageRating: number
  totalCheckIns: number
  totalFollowers: number
  totalFollowing: number
  badges: number
  achievements: number
  points: number
  favoriteRegions: string[]
  favoriteVarietals: string[]
  reviewHistory: {
    date: string
    count: number
  }[]
}

// All types are exported above as interfaces