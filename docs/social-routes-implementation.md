# Social Routes Implementation Guide
## Wine, Cocktail, and Spirit Review Platform

### Version: 1.0
### Status: Complete (Recently Fixed)
### Last Updated: July 2025

---

## Overview

This document details the implementation of social features in the platform, including the recent fixes applied to ensure proper authentication and consistent API responses.

## 1. Social Features Overview

### 1.1 Core Social Features
- **User Following System**: Follow/unfollow other users
- **Review Interactions**: Like/unlike reviews
- **Comment System**: Add comments to reviews
- **Social Discovery**: View followers, following, and activity

### 1.2 Authentication Requirements
All social routes require authentication via JWT tokens. The implementation uses individual route middleware instead of global plugin middleware for better control and reliability.

---

## 2. API Endpoints

### 2.1 Follow System

#### Follow User
```
POST /social/follow/:userId
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully followed User Name"
}
```

#### Unfollow User
```
DELETE /social/follow/:userId
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "User unfollowed successfully"
}
```

#### Check Follow Status
```
GET /social/follow/check/:userId
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "following": true
}
```

#### Get User Followers
```
GET /social/followers/:userId
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "followers": [
    {
      "id": "user-id",
      "username": "username",
      "displayName": "Display Name",
      "avatar": "avatar-url",
      "bio": "User bio"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

#### Get User Following
```
GET /social/following/:userId
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "following": [
    {
      "id": "user-id",
      "username": "username",
      "displayName": "Display Name",
      "avatar": "avatar-url",
      "bio": "User bio"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 30,
    "totalPages": 2
  }
}
```

### 2.2 Like System

#### Like Review
```
POST /social/like/:reviewId
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Review liked successfully"
}
```

#### Unlike Review
```
DELETE /social/like/:reviewId
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Review unliked successfully"
}
```

#### Check Like Status
```
GET /social/like/check/:reviewId
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "liked": true
}
```

### 2.3 Comment System

#### Add Comment
```
POST /social/comment
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "reviewId": "review-id",
  "content": "Comment text"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Comment created successfully",
  "comment": {
    "id": "comment-id",
    "content": "Comment text",
    "userId": "user-id",
    "reviewId": "review-id",
    "createdAt": "2025-07-28T04:00:00.000Z",
    "user": {
      "id": "user-id",
      "username": "username",
      "displayName": "Display Name",
      "avatar": "avatar-url"
    }
  }
}
```

#### Get Comments
```
GET /social/comments/:reviewId
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "comments": [
    {
      "id": "comment-id",
      "content": "Comment text",
      "userId": "user-id",
      "reviewId": "review-id",
      "createdAt": "2025-07-28T04:00:00.000Z",
      "user": {
        "id": "user-id",
        "username": "username",
        "displayName": "Display Name",
        "avatar": "avatar-url"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

---

## 3. Technical Implementation

### 3.1 Authentication Middleware

**Implementation Pattern:**
```javascript
// Individual route middleware (CORRECT)
fastify.post('/follow/:userId', { preHandler: authenticateToken }, async (request, reply) => {
  // Route handler
});

// Global plugin middleware (INCORRECT - was causing issues)
app.register(socialRoutes, {
  prefix: '/social',
  preHandler: authenticateToken  // This wasn't working properly
});
```

### 3.2 Response Format Standardization

**Before (Inconsistent):**
```javascript
// Follow check
return reply.send({
  success: true,
  data: { isFollowing: !!follow }
});

// Like check
return reply.send({
  success: true,
  data: { isLiked: !!like }
});
```

**After (Standardized):**
```javascript
// Follow check
return reply.send({
  success: true,
  following: !!follow
});

// Like check
return reply.send({
  success: true,
  liked: !!like
});
```

### 3.3 Error Handling

**Validation Errors:**
```javascript
// Missing reviewId
if (!reviewId) {
  return reply.code(400).send({
    success: false,
    message: 'Review ID is required'
  });
}

// Missing content
if (!content) {
  return reply.code(400).send({
    success: false,
    message: 'Comment content is required'
  });
}
```

---

## 4. Recent Fixes (July 2025)

### 4.1 Authentication Issues Fixed

**Problem:**
- Global plugin middleware wasn't properly applying authentication
- Routes were checking for `request.user` but middleware wasn't setting it
- Users getting 401 errors even with valid tokens

**Solution:**
- Applied `authenticateToken` middleware to individual routes
- Removed global plugin middleware approach
- Ensured proper JWT token validation on each request

### 4.2 Response Format Issues Fixed

**Problem:**
- Frontend expected specific field names (`following`, `liked`, `followers`, etc.)
- API was returning generic `data` objects
- Inconsistent response formats across endpoints

**Solution:**
- Standardized all response formats to match frontend expectations
- Updated field names to be consistent
- Ensured pagination objects are included where needed

### 4.3 Error Message Standardization

**Problem:**
- Inconsistent error messages across endpoints
- Test expectations didn't match actual error messages

**Solution:**
- Standardized error messages to match test expectations
- Separated validation logic for better error handling
- Improved error message clarity

### 4.4 Database Schema Alignment

**Problem:**
- Beverage category creation failing due to missing required fields
- Tests failing due to schema mismatches

**Solution:**
- Added required `slug` field to beverage category creation
- Updated test data to match current schema requirements

---

## 5. Testing

### 5.1 Test Coverage

All social routes are covered by comprehensive tests:

- **Follow System Tests**: Follow, unfollow, check status, get followers/following
- **Like System Tests**: Like, unlike, check status
- **Comment System Tests**: Add comment, get comments, validation
- **Authentication Tests**: Proper token validation and error handling

### 5.2 Test Results

**Current Status:**
- ✅ Social routes authentication working correctly
- ✅ Response formats matching frontend expectations
- ✅ Error handling standardized
- ✅ Database operations functioning properly

**Test Commands:**
```bash
# Run all social tests
npm test -- --testPathPattern=social.test.js

# Run debug test to verify authentication
npm test -- --testPathPattern=debug.test.js
```

---

## 6. Security Considerations

### 6.1 Authentication
- All social routes require valid JWT tokens
- Tokens are validated on each request
- User context is properly set on `request.user`

### 6.2 Authorization
- Users can only access their own data or public data
- Follow/unfollow operations validate user existence
- Like/unlike operations validate review existence

### 6.3 Input Validation
- All inputs are validated before processing
- Content length limits are enforced
- Required fields are checked

---

## 7. Performance Considerations

### 7.1 Database Queries
- Efficient queries with proper indexing
- Pagination implemented for large datasets
- Optimized joins for user data

### 7.2 Response Optimization
- Minimal response payloads
- Consistent response formats
- Proper HTTP status codes

---

## 8. Future Enhancements

### 8.1 Potential Improvements
- Real-time notifications for social interactions
- Activity feed implementation
- Social analytics and insights
- Advanced filtering and search

### 8.2 Scalability Considerations
- Database query optimization
- Caching strategies
- Rate limiting implementation
- Microservices architecture preparation

---

## 9. Troubleshooting

### 9.1 Common Issues

**401 Unauthorized Errors:**
- Check that JWT token is valid and not expired
- Ensure token is included in Authorization header
- Verify token format: `Bearer <token>`

**400 Bad Request Errors:**
- Validate required fields are present
- Check content length limits
- Ensure proper JSON format

**404 Not Found Errors:**
- Verify user/review IDs exist in database
- Check URL parameters are correct

### 9.2 Debug Steps

1. **Check Authentication:**
   ```bash
   npm test -- --testPathPattern=debug.test.js
   ```

2. **Verify Database:**
   ```bash
   # Check database connection
   npm run db:status
   ```

3. **Test Individual Endpoints:**
   ```bash
   # Test follow functionality
   curl -X POST /social/follow/user-id \
     -H "Authorization: Bearer <token>"
   ```

---

## 10. Conclusion

The social routes implementation is now complete and production-ready. The recent fixes have resolved authentication issues and standardized response formats, ensuring reliable operation and frontend compatibility.

**Key Achievements:**
- ✅ Proper authentication on all social routes
- ✅ Standardized API response formats
- ✅ Comprehensive error handling
- ✅ Full test coverage
- ✅ Production-ready implementation

The social features provide a solid foundation for user engagement and community building within the platform.