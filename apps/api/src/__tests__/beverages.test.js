import request from 'supertest';
import { createTestUser, createTestBeverage, generateTestToken, testPrisma } from '../test/setup.js';

describe('Beverage Endpoints', () => {
  let app;
  let testUser;
  let testBeverage;
  let testCategory;

  beforeAll(async () => {
    const { default: appModule } = await import('../index.js');
    app = appModule;
    // Start the server for testing on a specific port
    await app.listen({ port: 0, host: 'localhost' });
    testUser = await createTestUser();

    // Create test category
    testCategory = await testPrisma.beverageCategory.create({
      data: {
        name: 'Test Category',
        slug: 'test-category',
        description: 'Test category description'
      }
    });

    // Create test beverage
    testBeverage = await createTestBeverage({
      categoryId: testCategory.id
    });
  });

  describe('GET /beverages', () => {
    it('should return list of beverages with pagination', async () => {
      const response = await request(app)
        .get('/beverages')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('total');
    });

    it('should filter beverages by type', async () => {
      const response = await request(app)
        .get('/beverages?type=wine')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);

      // All returned beverages should be wine type
      response.body.data.forEach(beverage => {
        expect(beverage.type).toBe('wine');
      });
    });

    it('should filter beverages by category', async () => {
      const response = await request(app)
        .get(`/beverages?categoryId=${testCategory.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);

      // All returned beverages should be in the test category
      response.body.data.forEach(beverage => {
        expect(beverage.categoryId).toBe(testCategory.id);
      });
    });

    it('should search beverages by name', async () => {
      const response = await request(app)
        .get('/beverages?search=Test')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);

      // All returned beverages should contain "Test" in name
      response.body.data.forEach(beverage => {
        expect(beverage.name.toLowerCase()).toContain('test');
      });
    });

    it('should handle pagination correctly', async () => {
      const response = await request(app)
        .get('/beverages?page=1&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });

    it('should return empty array when no beverages match filters', async () => {
      const response = await request(app)
        .get('/beverages?type=nonexistent')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
      expect(response.body.pagination.total).toBe(0);
    });
  });

  describe('GET /beverages/:id', () => {
    it('should return beverage details by ID', async () => {
      const response = await request(app)
        .get(`/beverages/${testBeverage.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testBeverage.id);
      expect(response.body.data.name).toBe(testBeverage.name);
      expect(response.body.data.type).toBe(testBeverage.type);
      expect(response.body.data.category).toBeDefined();
    });

    it('should return 404 for non-existent beverage', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app)
        .get(`/beverages/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Beverage not found');
    });

    it('should return 400 for invalid UUID format', async () => {
      const response = await request(app)
        .get('/beverages/invalid-uuid')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid ID format');
    });
  });

  describe('GET /beverages/categories', () => {
    it('should return list of categories', async () => {
      const response = await request(app)
        .get('/beverages/categories')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);

      // Check that categories have required fields
      response.body.data.forEach(category => {
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('description');
      });
    });
  });

  describe('GET /beverages/search', () => {
    it('should search beverages by name', async () => {
      const response = await request(app)
        .get('/beverages/search?q=Test')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);

      response.body.data.forEach(beverage => {
        expect(beverage.name.toLowerCase()).toContain('test');
      });
    });

    it('should search beverages by description', async () => {
      const response = await request(app)
        .get('/beverages/search?q=description')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should return empty results for no matches', async () => {
      const response = await request(app)
        .get('/beverages/search?q=nonexistentbeverage')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should handle empty search query', async () => {
      const response = await request(app)
        .get('/beverages/search?q=')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('POST /beverages', () => {
    it('should create new beverage with valid data', async () => {
      const token = generateTestToken(testUser);
      const beverageData = {
        name: 'New Test Beverage',
        type: 'cocktail',
        description: 'A new test beverage',
        abv: 15.5,
        origin: 'Test Origin',
        manufacturer: 'Test Manufacturer',
        categoryId: testCategory.id
      };

      const response = await request(app)
        .post('/beverages')
        .set('Authorization', `Bearer ${token}`)
        .send(beverageData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(beverageData.name);
      expect(response.body.data.type).toBe(beverageData.type);
      expect(response.body.data.isApproved).toBe(false); // Should be pending approval
    });

    it('should return error without authentication', async () => {
      const beverageData = {
        name: 'Unauthorized Beverage',
        type: 'wine',
        description: 'Should fail'
      };

      const response = await request(app)
        .post('/beverages')
        .send(beverageData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No token provided');
    });

    it('should return error for invalid beverage data', async () => {
      const token = generateTestToken(testUser);
      const beverageData = {
        name: '', // Invalid empty name
        type: 'invalid-type', // Invalid type
        abv: -5 // Invalid negative ABV
      };

      const response = await request(app)
        .post('/beverages')
        .set('Authorization', `Bearer ${token}`)
        .send(beverageData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return error for missing required fields', async () => {
      const token = generateTestToken(testUser);
      const beverageData = {
        description: 'Missing name and type'
      };

      const response = await request(app)
        .post('/beverages')
        .set('Authorization', `Bearer ${token}`)
        .send(beverageData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return error for invalid category ID', async () => {
      const token = generateTestToken(testUser);
      const beverageData = {
        name: 'Invalid Category Beverage',
        type: 'wine',
        description: 'Test description',
        categoryId: '00000000-0000-0000-0000-000000000000'
      };

      const response = await request(app)
        .post('/beverages')
        .set('Authorization', `Bearer ${token}`)
        .send(beverageData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Category not found');
    });
  });

  describe('PUT /beverages/:id', () => {
    it('should update beverage with admin privileges', async () => {
      const adminUser = await createTestAdmin();
      const token = generateTestToken(adminUser);

      const updateData = {
        name: 'Updated Beverage Name',
        description: 'Updated description',
        abv: 18.0
      };

      const response = await request(app)
        .put(`/beverages/${testBeverage.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.description).toBe(updateData.description);
      expect(response.body.data.abv).toBe(updateData.abv);
    });

    it('should return error for non-admin users', async () => {
      const token = generateTestToken(testUser);
      const updateData = {
        name: 'Unauthorized Update'
      };

      const response = await request(app)
        .put(`/beverages/${testBeverage.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Admin access required');
    });

    it('should return error for non-existent beverage', async () => {
      const adminUser = await createTestAdmin();
      const token = generateTestToken(adminUser);
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const updateData = {
        name: 'Update Non-existent'
      };

      const response = await request(app)
        .put(`/beverages/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Beverage not found');
    });
  });

  describe('DELETE /beverages/:id', () => {
    it('should delete beverage with admin privileges', async () => {
      const adminUser = await createTestAdmin();
      const token = generateTestToken(adminUser);

      // Create a beverage to delete
      const beverageToDelete = await createTestBeverage({
        name: 'Beverage to Delete'
      });

      const response = await request(app)
        .delete(`/beverages/${beverageToDelete.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Beverage deleted successfully');

      // Verify beverage is deleted
      const deletedBeverage = await testPrisma.beverage.findUnique({
        where: { id: beverageToDelete.id }
      });
      expect(deletedBeverage).toBeNull();
    });

    it('should return error for non-admin users', async () => {
      const token = generateTestToken(testUser);

      const response = await request(app)
        .delete(`/beverages/${testBeverage.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Admin access required');
    });

    it('should return error for non-existent beverage', async () => {
      const adminUser = await createTestAdmin();
      const token = generateTestToken(adminUser);
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app)
        .delete(`/beverages/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Beverage not found');
    });
  });

  describe('Beverage Validation', () => {
    it('should validate ABV range', async () => {
      const token = generateTestToken(testUser);

      // Test negative ABV
      const negativeABV = {
        name: 'Negative ABV Beverage',
        type: 'wine',
        description: 'Test description',
        abv: -5,
        categoryId: testCategory.id
      };

      const response1 = await request(app)
        .post('/beverages')
        .set('Authorization', `Bearer ${token}`)
        .send(negativeABV)
        .expect(400);

      expect(response1.body.success).toBe(false);

      // Test ABV over 100%
      const highABV = {
        name: 'High ABV Beverage',
        type: 'wine',
        description: 'Test description',
        abv: 150,
        categoryId: testCategory.id
      };

      const response2 = await request(app)
        .post('/beverages')
        .set('Authorization', `Bearer ${token}`)
        .send(highABV)
        .expect(400);

      expect(response2.body.success).toBe(false);
    });

    it('should validate beverage type', async () => {
      const token = generateTestToken(testUser);
      const invalidType = {
        name: 'Invalid Type Beverage',
        type: 'invalid-type',
        description: 'Test description',
        categoryId: testCategory.id
      };

      const response = await request(app)
        .post('/beverages')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidType)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('type');
    });

    it('should validate name length', async () => {
      const token = generateTestToken(testUser);
      const longName = {
        name: 'A'.repeat(256), // Too long name
        type: 'wine',
        description: 'Test description',
        categoryId: testCategory.id
      };

      const response = await request(app)
        .post('/beverages')
        .set('Authorization', `Bearer ${token}`)
        .send(longName)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});