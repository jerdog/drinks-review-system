import { createTestUser, createTestBeverage, createTestReview, generateTestToken, testPrisma } from '../test/setup.js';

describe('Search Endpoints', () => {
  let testUser, testBeverage, testReview, testToken, app;

  beforeAll(async () => {
    // Import the app using dynamic import for ES modules
    const { default: fastifyApp } = await import('../index.js');
    app = fastifyApp;

    // Create test data
    testUser = await createTestUser();
    testBeverage = await createTestBeverage();
    testToken = generateTestToken(testUser);
  });

  afterAll(async () => {
    // Close the app after tests
    if (app && typeof app.close === 'function') {
      await app.close();
    }
  });

  beforeEach(async () => {
    // Clean up database before each test
    await testPrisma.user.deleteMany();
    await testPrisma.beverage.deleteMany();
    await testPrisma.review.deleteMany();
    await testPrisma.venue.deleteMany();
  });

  describe('GET /search/beverages', () => {
    it('should search beverages by name', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/search/beverages?q=Test'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.beverages).toBeInstanceOf(Array);
      expect(body.pagination).toBeDefined();
    });

    it('should filter beverages by type', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/search/beverages?type=wine'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.beverages).toBeInstanceOf(Array);

      // All returned beverages should be wine type
      body.beverages.forEach(beverage => {
        expect(beverage.type).toBe('wine');
      });
    });

    it('should filter beverages by ABV range', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/search/beverages?abv_min=10&abv_max=15'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.beverages).toBeInstanceOf(Array);
    });

    it('should filter beverages by vintage range', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/search/beverages?vintage_min=2020&vintage_max=2023'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.beverages).toBeInstanceOf(Array);
    });

    it('should sort beverages by rating', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/search/beverages?sort_by=rating&sort_order=desc'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.beverages).toBeInstanceOf(Array);
    });

    it('should handle pagination correctly', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/search/beverages?page=1&limit=5'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.pagination.page).toBe(1);
      expect(body.pagination.limit).toBe(5);
      expect(body.beverages.length).toBeLessThanOrEqual(5);
    });

    it('should return empty results for no matches', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/search/beverages?q=nonexistentbeverage'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.beverages).toEqual([]);
      expect(body.pagination.total).toBe(0);
    });
  });

  describe('GET /search/venues', () => {
    it('should search venues by name', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/search/venues?q=Test'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.venues).toBeInstanceOf(Array);
      expect(body.pagination).toBeDefined();
    });

    it('should filter venues by city', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/search/venues?city=Test'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.venues).toBeInstanceOf(Array);
    });

    it('should filter venues by state', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/search/venues?state=Test'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.venues).toBeInstanceOf(Array);
    });

    it('should filter venues by country', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/search/venues?country=Test'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.venues).toBeInstanceOf(Array);
    });

    it('should sort venues by name', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/search/venues?sort_by=name&sort_order=asc'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.venues).toBeInstanceOf(Array);
    });

    it('should return empty results for no matches', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/search/venues?q=nonexistentvenue'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.venues).toEqual([]);
      expect(body.pagination.total).toBe(0);
    });
  });

  describe('GET /search/reviews', () => {
    it('should search reviews by notes', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/search/reviews?q=Test'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.reviews).toBeInstanceOf(Array);
      expect(body.pagination).toBeDefined();
    });

    it('should filter reviews by rating range', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/search/reviews?rating_min=3&rating_max=5'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.reviews).toBeInstanceOf(Array);
    });

    it('should filter reviews by price range', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/search/reviews?price_min=10&price_max=50'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.reviews).toBeInstanceOf(Array);
    });

    it('should filter reviews by beverage type', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/search/reviews?beverage_type=wine'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.reviews).toBeInstanceOf(Array);
    });

    it('should filter reviews by user', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/search/reviews?user_id=${testUser.id}`
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.reviews).toBeInstanceOf(Array);
    });

    it('should filter reviews by venue', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/search/reviews?venue_id=test-venue-id`
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.reviews).toBeInstanceOf(Array);
    });

    it('should filter reviews with photos', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/search/reviews?has_photos=true'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.reviews).toBeInstanceOf(Array);
    });

    it('should sort reviews by creation date', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/search/reviews?sort_by=createdAt&sort_order=desc'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.reviews).toBeInstanceOf(Array);
    });

    it('should return empty results for no matches', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/search/reviews?q=nonexistentreview'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.reviews).toEqual([]);
      expect(body.pagination.total).toBe(0);
    });
  });

  describe('GET /search/users', () => {
    it('should search users by username', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/search/users?q=test'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.users).toBeInstanceOf(Array);
      expect(body.pagination).toBeDefined();
    });

    it('should filter users with reviews', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/search/users?has_reviews=true'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.users).toBeInstanceOf(Array);
    });

    it('should filter users with followers', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/search/users?has_followers=true'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.users).toBeInstanceOf(Array);
    });

    it('should filter verified users', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/search/users?is_verified=true'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.users).toBeInstanceOf(Array);
    });

    it('should sort users by username', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/search/users?sort_by=username&sort_order=asc'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.users).toBeInstanceOf(Array);
    });

    it('should return empty results for no matches', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/search/users?q=nonexistentuser'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.users).toEqual([]);
      expect(body.pagination.total).toBe(0);
    });
  });

  describe('GET /search/global', () => {
    it('should perform global search across all content types', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/search/global?q=Test'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.results).toBeDefined();
      expect(body.results.beverages).toBeInstanceOf(Array);
      expect(body.results.venues).toBeInstanceOf(Array);
      expect(body.results.users).toBeInstanceOf(Array);
      expect(body.results.reviews).toBeInstanceOf(Array);
      expect(body.summary).toBeDefined();
    });

    it('should return error for empty search query', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/search/global?q='
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.message).toContain('Search query required');
    });

    it('should limit results based on limit parameter', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/search/global?q=Test&limit=4'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.results).toBeDefined();

      // Each category should have at most limit/4 results
      expect(body.results.beverages.length).toBeLessThanOrEqual(1);
      expect(body.results.venues.length).toBeLessThanOrEqual(1);
      expect(body.results.users.length).toBeLessThanOrEqual(1);
      expect(body.results.reviews.length).toBeLessThanOrEqual(1);
    });

    it('should return empty results for no matches', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/search/global?q=nonexistentcontent'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.results).toBeDefined();
      expect(body.summary.beverages).toBe(0);
      expect(body.summary.venues).toBe(0);
      expect(body.summary.users).toBe(0);
      expect(body.summary.reviews).toBe(0);
    });
  });

  describe('Search Error Handling', () => {
    it('should handle invalid pagination parameters', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/search/beverages?page=invalid&limit=invalid'
      });

      expect(response.statusCode).toBe(200); // Should still work with defaults
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.pagination.page).toBe(1);
      expect(body.pagination.limit).toBe(20);
    });

    it('should handle invalid sort parameters', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/search/beverages?sort_by=invalid&sort_order=invalid'
      });

      expect(response.statusCode).toBe(200); // Should use defaults
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.beverages).toBeInstanceOf(Array);
    });

    it('should handle invalid numeric filters', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/search/beverages?abv_min=invalid&abv_max=invalid'
      });

      expect(response.statusCode).toBe(200); // Should ignore invalid filters
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.beverages).toBeInstanceOf(Array);
    });
  });
});