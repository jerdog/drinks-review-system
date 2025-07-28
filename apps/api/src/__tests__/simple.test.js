import { createTestUser, testPrisma } from '../test/setup.js';

describe('Simple Fastify Test', () => {
  let app;

  beforeAll(async () => {
    // Import the app using dynamic import for ES modules
    const { default: fastifyApp } = await import('../index.js');
    app = fastifyApp;
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
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('ok');
      expect(body.timestamp).toBeDefined();
    });
  });

  describe('Auth Endpoints', () => {
    it('should register a new user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: userData
      });

      console.log('Register response:', response.statusCode, response.body);

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.user.username).toBe(userData.username);
      expect(body.user.email).toBe(userData.email);
      expect(body.user).not.toHaveProperty('password');
    });

    it('should login user with correct credentials', async () => {
      // First register a user
      const userData = {
        username: 'loginuser',
        email: 'login@example.com',
        password: 'password123',
        name: 'Login User'
      };

      const registerResponse = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: userData
      });

      console.log('Register response:', registerResponse.statusCode, registerResponse.body);

      // Then login
      const loginData = {
        email: 'login@example.com',
        password: 'password123'
      };

      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: loginData
      });

      console.log('Login response:', response.statusCode, response.body);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body).toHaveProperty('token');
    });
  });
});