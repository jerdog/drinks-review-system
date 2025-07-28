import { createTestUser, generateTestToken, testPrisma } from '../test/setup.js';
import jwt from 'jsonwebtoken';

describe('Debug Authentication', () => {
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

  it('should generate valid token', async () => {
    const user = await createTestUser();
    const token = generateTestToken(user);

    console.log('Generated token:', token);
    console.log('User:', { id: user.id, username: user.username });

    // Decode token to see what's in it
    const decoded = jwt.decode(token);
    console.log('Decoded token:', decoded);

    // Verify token
    const secret = process.env.JWT_SECRET || 'test-secret';
    const verified = jwt.verify(token, secret);
    console.log('Verified token:', verified);

    expect(verified.userId).toBe(user.id);
    expect(verified.username).toBe(user.username);
  });

  it('should authenticate with token in API call', async () => {
    const user = await createTestUser();
    const token = generateTestToken(user);

    console.log('Testing API call with token:', token);

    const response = await app.inject({
      method: 'GET',
      url: '/social/followers/' + user.id,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('API Response:', response.statusCode, response.body);
    console.log('Response headers:', response.headers);

    // Even if it fails, we want to see the response
    expect(response.statusCode).toBeDefined();
  });

  it('should test social follow functionality', async () => {
    // Create two users like in the social test
    const user1 = await createTestUser();
    const user2 = await createTestUser();

    console.log('Created users:', { user1: user1.id, user2: user2.id });

    const token = generateTestToken(user2);
    console.log('Generated token for user2:', token);

    const response = await app.inject({
      method: 'POST',
      url: `/social/follow/${user1.id}`,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Follow response:', response.statusCode, response.body);

    // Check if it's a 401 or 200
    if (response.statusCode === 401) {
      console.log('Authentication failed - checking token...');
      const decoded = jwt.decode(token);
      console.log('Token payload:', decoded);
    }

    expect(response.statusCode).toBeDefined();
  });
});