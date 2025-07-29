# Search & Discovery Implementation Guide
## Wine, Cocktail, and Spirit Review Platform

### Version: 1.0
### Status: Complete
### Last Updated: July 2025

---

## 1. Overview

The Search & Discovery system provides comprehensive search functionality across all content types in the platform. It includes advanced filtering, sorting, pagination, and robust error handling with graceful fallbacks for invalid parameters.

### Key Features
- **Multi-Content Search**: Search across beverages, venues, reviews, and users
- **Advanced Filtering**: Text search, numeric ranges, boolean filters
- **Flexible Sorting**: Multiple sort options with validation
- **Robust Pagination**: Configurable limits with proper validation
- **Error Handling**: Graceful fallbacks for invalid parameters
- **Performance Optimized**: Efficient database queries with Prisma ORM

---

## 2. API Endpoints

### 2.1 Base URL
All search endpoints are prefixed with `/search`

### 2.2 Endpoint Overview

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| `/search/beverages` | GET | Search beverages with advanced filters | Optional |
| `/search/venues` | GET | Search venues with location filters | Optional |
| `/search/reviews` | GET | Search reviews with content filters | Optional |
| `/search/users` | GET | Search users with activity filters | Optional |
| `/search/global` | GET | Global search across all content types | Optional |

---

## 3. Detailed Endpoint Documentation

### 3.1 Beverages Search (`/search/beverages`)

#### Query Parameters
- `q` (string, optional): Text search in name, description, region, varietal
- `type` (string, optional): Filter by beverage type (wine, spirit, cocktail)
- `category` (string, optional): Filter by category ID
- `region` (string, optional): Filter by region (case-insensitive)
- `varietal` (string, optional): Filter by varietal (case-insensitive)
- `abv_min` (number, optional): Minimum ABV percentage
- `abv_max` (number, optional): Maximum ABV percentage
- `vintage_min` (number, optional): Minimum vintage year
- `vintage_max` (number, optional): Maximum vintage year
- `rating_min` (number, optional): Minimum average rating (1-5)
- `rating_max` (number, optional): Maximum average rating (1-5)
- `price_min` (number, optional): Minimum price
- `price_max` (number, optional): Maximum price
- `sort_by` (string, optional): Sort field (name, type, region, abv, vintage, rating, reviews, createdAt)
- `sort_order` (string, optional): Sort direction (asc, desc)
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Results per page (1-100, default: 20)

#### Response Format
```json
{
  "success": true,
  "beverages": [
    {
      "id": "beverage-id",
      "name": "Beverage Name",
      "type": "wine",
      "region": "Bordeaux",
      "abv": 13.5,
      "vintage": 2020,
      "averageRating": 4.2,
      "averagePrice": 45.00,
      "category": {
        "id": "category-id",
        "name": "Red Wine"
      },
      "_count": {
        "reviews": 15
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### 3.2 Venues Search (`/search/venues`)

#### Query Parameters
- `q` (string, optional): Text search in name, description, address
- `city` (string, optional): Filter by city (case-insensitive)
- `state` (string, optional): Filter by state (case-insensitive)
- `country` (string, optional): Filter by country (case-insensitive)
- `rating_min` (number, optional): Minimum average rating (1-5)
- `rating_max` (number, optional): Maximum average rating (1-5)
- `sort_by` (string, optional): Sort field (name, city, state, country, createdAt)
- `sort_order` (string, optional): Sort direction (asc, desc)
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Results per page (1-100, default: 20)

#### Response Format
```json
{
  "success": true,
  "venues": [
    {
      "id": "venue-id",
      "name": "Venue Name",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "averageRating": 4.1,
      "_count": {
        "reviews": 25,
        "checkIns": 150
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 75,
    "totalPages": 4
  }
}
```

### 3.3 Reviews Search (`/search/reviews`)

#### Query Parameters
- `q` (string, optional): Text search in notes and beverage information
- `rating_min` (number, optional): Minimum rating (1-5)
- `rating_max` (number, optional): Maximum rating (1-5)
- `price_min` (number, optional): Minimum price
- `price_max` (number, optional): Maximum price
- `beverage_type` (string, optional): Filter by beverage type
- `beverage_category` (string, optional): Filter by beverage category ID
- `user_id` (string, optional): Filter by user ID
- `venue_id` (string, optional): Filter by venue ID
- `has_photos` (boolean, optional): Filter reviews with photos
- `sort_by` (string, optional): Sort field (createdAt, rating, price)
- `sort_order` (string, optional): Sort direction (asc, desc)
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Results per page (1-100, default: 20)

#### Response Format
```json
{
  "success": true,
  "reviews": [
    {
      "id": "review-id",
      "rating": 4,
      "price": 35.00,
      "notes": "Excellent wine with rich flavors",
      "createdAt": "2025-07-28T10:00:00Z",
      "user": {
        "id": "user-id",
        "username": "wine_lover",
        "displayName": "Wine Lover",
        "avatar": "avatar-url"
      },
      "beverage": {
        "id": "beverage-id",
        "name": "Beverage Name",
        "category": {
          "id": "category-id",
          "name": "Red Wine"
        }
      },
      "_count": {
        "likes": 12,
        "comments": 3
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 200,
    "totalPages": 10
  }
}
```

### 3.4 Users Search (`/search/users`)

#### Query Parameters
- `q` (string, optional): Text search in username, displayName, bio, location
- `has_reviews` (boolean, optional): Filter users with reviews
- `has_followers` (boolean, optional): Filter users with followers
- `is_verified` (boolean, optional): Filter verified users
- `sort_by` (string, optional): Sort field (username, displayName, createdAt)
- `sort_order` (string, optional): Sort direction (asc, desc)
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Results per page (1-100, default: 20)

#### Response Format
```json
{
  "success": true,
  "users": [
    {
      "id": "user-id",
      "username": "wine_expert",
      "displayName": "Wine Expert",
      "bio": "Passionate about fine wines",
      "location": "Napa Valley",
      "avatar": "avatar-url",
      "isVerified": true,
      "createdAt": "2025-01-15T10:00:00Z",
      "_count": {
        "reviews": 45,
        "followers": 120,
        "following": 85
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 500,
    "totalPages": 25
  }
}
```

### 3.5 Global Search (`/search/global`)

#### Query Parameters
- `q` (string, required): Search query across all content types
- `limit` (number, optional): Total results limit (default: 10)

#### Response Format
```json
{
  "success": true,
  "results": {
    "beverages": [
      {
        "id": "beverage-id",
        "name": "Beverage Name",
        "type": "wine",
        "category": {
          "id": "category-id",
          "name": "Red Wine"
        },
        "_count": {
          "reviews": 15
        }
      }
    ],
    "venues": [
      {
        "id": "venue-id",
        "name": "Venue Name",
        "city": "New York",
        "_count": {
          "reviews": 25
        }
      }
    ],
    "users": [
      {
        "id": "user-id",
        "username": "wine_lover",
        "displayName": "Wine Lover",
        "avatar": "avatar-url",
        "isVerified": true,
        "_count": {
          "reviews": 30,
          "followers": 50
        }
      }
    ],
    "reviews": [
      {
        "id": "review-id",
        "rating": 4,
        "notes": "Great wine!",
        "user": {
          "id": "user-id",
          "username": "reviewer",
          "displayName": "Reviewer"
        },
        "beverage": {
          "id": "beverage-id",
          "name": "Beverage Name"
        }
      }
    ]
  },
  "summary": {
    "beverages": 5,
    "venues": 3,
    "users": 2,
    "reviews": 8
  }
}
```

---

## 4. Error Handling

### 4.1 Validation Errors

#### Invalid Pagination Parameters
```json
{
  "success": true,
  "beverages": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```
*Note: Invalid pagination parameters default to safe values instead of returning errors*

#### Invalid Sort Parameters
```json
{
  "success": true,
  "beverages": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```
*Note: Invalid sort parameters default to 'name' and 'asc'*

#### Invalid Numeric Filters
```json
{
  "success": true,
  "beverages": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```
*Note: Invalid numeric filters are gracefully ignored*

### 4.2 Required Parameters

#### Global Search Query Required
```json
{
  "success": false,
  "message": "Search query required"
}
```

---

## 5. Technical Implementation

### 5.1 Database Queries

#### Beverages Search
```javascript
const [beverages, total] = await Promise.all([
  prisma.beverage.findMany({
    where: {
      isApproved: true,
      // Dynamic filters based on query parameters
    },
    include: {
      category: true,
      _count: { select: { reviews: true } },
      reviews: { select: { rating: true, price: true } }
    },
    skip,
    take,
    orderBy
  }),
  prisma.beverage.count({ where })
]);
```

#### Average Calculations
```javascript
const beveragesWithStats = beverages.map(beverage => {
  const ratings = beverage.reviews.map(r => r.rating).filter(r => r);
  const prices = beverage.reviews.map(r => r.price).filter(p => p);

  return {
    ...beverage,
    averageRating: ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null,
    averagePrice: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : null,
    reviews: undefined // Remove from response
  };
});
```

### 5.2 Parameter Validation

#### Pagination Validation
```javascript
const pageNum = parseInt(page);
const limitNum = parseInt(limit);

const validPage = (isNaN(pageNum) || pageNum < 1) ? 1 : pageNum;
const validLimit = (isNaN(limitNum) || limitNum < 1 || limitNum > 100) ? 20 : limitNum;

const skip = (validPage - 1) * validLimit;
const take = validLimit;
```

#### Sort Validation
```javascript
const validSortBy = ['name', 'type', 'region', 'abv', 'vintage', 'rating', 'reviews', 'createdAt'].includes(sort_by) ? sort_by : 'name';
const validSortOrder = ['asc', 'desc'].includes(sort_order) ? sort_order : 'asc';
```

#### Numeric Filter Validation
```javascript
if (abv_min || abv_max) {
  const abvMin = parseFloat(abv_min);
  const abvMax = parseFloat(abv_max);

  if (!isNaN(abvMin) || !isNaN(abvMax)) {
    where.abv = {};
    if (!isNaN(abvMin)) where.abv.gte = abvMin;
    if (!isNaN(abvMax)) where.abv.lte = abvMax;
  }
}
```

---

## 6. Testing

### 6.1 Test Coverage

The search functionality includes comprehensive test coverage:

- **35 test cases** across all search endpoints
- **Parameter validation** testing
- **Error handling** scenarios
- **Edge cases** and boundary conditions
- **Response format** validation

### 6.2 Test Categories

#### Functional Tests
- Text search functionality
- Filter application
- Sorting behavior
- Pagination logic

#### Validation Tests
- Invalid pagination parameters
- Invalid sort parameters
- Invalid numeric filters
- Required parameter validation

#### Edge Case Tests
- Empty search results
- No matches found
- Boundary conditions
- Performance with large datasets

---

## 7. Performance Considerations

### 7.1 Database Optimization
- **Indexed fields**: All searchable fields are properly indexed
- **Efficient queries**: Using Prisma ORM for optimized queries
- **Pagination**: Proper skip/take implementation
- **Selective includes**: Only loading necessary related data

### 7.2 Response Optimization
- **Average calculations**: Computed on-demand, not stored
- **Limited results**: Configurable limits prevent large responses
- **Compressed responses**: Fastify handles compression automatically

### 7.3 Caching Strategy
- **Future enhancement**: Consider Redis caching for popular searches
- **Query result caching**: For frequently accessed data
- **Search suggestion caching**: For autocomplete functionality

---

## 8. Future Enhancements

### 8.1 Planned Features
- **Search suggestions**: Autocomplete functionality
- **Search history**: User search history tracking
- **Saved searches**: Allow users to save search criteria
- **Advanced filters**: More granular filtering options
- **Search analytics**: Track popular searches and trends

### 8.2 Performance Improvements
- **Full-text search**: PostgreSQL full-text search integration
- **Elasticsearch**: For advanced search capabilities
- **Search indexing**: Optimized search indexes
- **Caching layer**: Redis integration for search results

### 8.3 User Experience
- **Real-time search**: Instant search results
- **Search filters UI**: Advanced filter interface
- **Search result highlighting**: Highlight matching terms
- **Search result ranking**: Relevance-based sorting

---

## 9. Security Considerations

### 9.1 Input Validation
- **Parameter sanitization**: All inputs are validated
- **SQL injection prevention**: Using Prisma ORM
- **Rate limiting**: Prevent search abuse
- **Input length limits**: Prevent excessive query sizes

### 9.2 Access Control
- **Public endpoints**: Search is available to all users
- **Optional authentication**: Enhanced features for logged-in users
- **Admin search**: Separate admin search functionality
- **Privacy controls**: Respect user privacy settings

---

## 10. Monitoring & Analytics

### 10.1 Search Metrics
- **Search volume**: Track number of searches
- **Popular queries**: Identify trending searches
- **Search performance**: Monitor response times
- **Error rates**: Track validation errors

### 10.2 User Behavior
- **Search patterns**: Analyze user search behavior
- **Filter usage**: Track popular filters
- **Result engagement**: Monitor click-through rates
- **Search abandonment**: Identify problematic searches

---

## 11. Troubleshooting

### 11.1 Common Issues

#### Slow Search Performance
- Check database indexes
- Review query optimization
- Monitor server resources
- Consider caching implementation

#### Invalid Parameter Errors
- Verify parameter validation logic
- Check client-side parameter encoding
- Review API documentation
- Test with valid parameters

#### Empty Search Results
- Verify search criteria
- Check database content
- Review filter logic
- Test with broader criteria

### 11.2 Debugging Tips
- Enable detailed logging
- Monitor database queries
- Check parameter values
- Verify response formats

---

## 12. API Integration Examples

### 12.1 JavaScript/Node.js
```javascript
// Search beverages
const response = await fetch('/api/search/beverages?type=wine&rating_min=4&limit=10');
const data = await response.json();

// Global search
const globalResponse = await fetch('/api/search/global?q=chardonnay');
const globalData = await globalResponse.json();
```

### 12.2 Python
```python
import requests

# Search venues
response = requests.get('/api/search/venues', params={
    'city': 'New York',
    'rating_min': 4,
    'limit': 5
})
data = response.json()
```

### 12.3 cURL
```bash
# Search reviews
curl -X GET "http://localhost:3001/search/reviews?rating_min=4&beverage_type=wine" \
  -H "Content-Type: application/json"

# Search users
curl -X GET "http://localhost:3001/search/users?has_reviews=true&is_verified=true" \
  -H "Content-Type: application/json"
```

---

*This documentation is maintained as part of the Wine, Cocktail, and Spirit Review Platform. For questions or contributions, please refer to the main project documentation.*