import request from 'supertest';
import bcrypt from 'bcryptjs';
import { createTestUser, generateTestToken } from '../test/setup.js';

describe('Authentication Endpoints', () => {
  let app;
  let testUser;

  beforeAll(async () => {
    // Import the app
    const { default: appModule } = await import('../index.js');
    app = appModule;
    // Start the server for testing on a specific port
    await app.listen({ port: 0, host: 'localhost' });

    // Create a test user
    testUser = await createTestUser();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        displayName: 'New User',
        bio: 'New user bio',
        location: 'New City'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.username).toBe(userData.username);
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data).not.toHaveProperty('password');
      expect(response.body.data).toHaveProperty('token');
    });

    it('should return error for duplicate username', async () => {
      const userData = {
        username: testUser.username,
        email: 'different@example.com',
        password: 'password123',
        displayName: 'Duplicate User'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('username');
    });

    it('should return error for duplicate email', async () => {
      const userData = {
        username: 'differentuser',
        email: testUser.email,
        password: 'password123',
        displayName: 'Duplicate Email'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('email');
    });

    it('should return error for invalid email format', async () => {
      const userData = {
        username: 'invaliduser',
        email: 'invalid-email',
        password: 'password123',
        displayName: 'Invalid Email'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('email');
    });

    it('should return error for short password', async () => {
      const userData = {
        username: 'shortpass',
        email: 'short@example.com',
        password: '123',
        displayName: 'Short Password'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('password');
    });

    it('should return error for missing required fields', async () => {
      const userData = {
        username: 'missingfields',
        // Missing email and password
        displayName: 'Missing Fields'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /auth/login', () => {
    it('should login user with correct credentials', async () => {
      const loginData = {
        email: testUser.email,
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe(testUser.email);
      expect(response.body.data).not.toHaveProperty('password');
      expect(response.body.data).toHaveProperty('token');
    });

    it('should login user with username', async () => {
      const loginData = {
        email: testUser.username,
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
    });

    it('should return error for incorrect password', async () => {
      const loginData = {
        email: testUser.email,
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should return error for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should return error for missing credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /auth/profile', () => {
    it('should return user profile with valid token', async () => {
      const token = generateTestToken(testUser);

      const response = await request(app)
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testUser.id);
      expect(response.body.data.username).toBe(testUser.username);
      expect(response.body.data.email).toBe(testUser.email);
    });

    it('should return error without token', async () => {
      const response = await request(app)
        .get('/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No token provided');
    });

    it('should return error with invalid token', async () => {
      const response = await request(app)
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid token');
    });

    it('should return error with expired token', async () => {
      const jwt = await import('jsonwebtoken');
      const expiredToken = jwt.default.sign(
        { id: testUser.id, username: testUser.username },
        process.env.JWT_SECRET,
        { expiresIn: '0s' }
      );

      const response = await request(app)
        .get('/auth/profile')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Token expired');
    });
  });

  describe('PUT /auth/profile', () => {
    it('should update user profile with valid token', async () => {
      const token = generateTestToken(testUser);
      const updateData = {
        displayName: 'Updated Name',
        bio: 'Updated bio',
        location: 'Updated City'
      };

      const response = await request(app)
        .put('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.displayName).toBe(updateData.displayName);
      expect(response.body.data.bio).toBe(updateData.bio);
      expect(response.body.data.location).toBe(updateData.location);
    });

    it('should return error when updating with invalid data', async () => {
      const token = generateTestToken(testUser);
      const updateData = {
        email: 'invalid-email',
        displayName: 'Valid Name'
      };

      const response = await request(app)
        .put('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return error without token', async () => {
      const updateData = {
        displayName: 'No Token Update'
      };

      const response = await request(app)
        .put('/auth/profile')
        .send(updateData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should not allow updating sensitive fields', async () => {
      const token = generateTestToken(testUser);
      const updateData = {
        isAdmin: true,
        isVerified: true,
        password: 'newpassword'
      };

      const response = await request(app)
        .put('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      // Should ignore sensitive fields
      expect(response.body.data.isAdmin).toBe(false);
      expect(response.body.data.isVerified).toBe(false);
    });
  });

  describe('Password Security', () => {
    it('should hash passwords during registration', async () => {
      const userData = {
        username: 'passwordtest',
        email: 'passwordtest@example.com',
        password: 'testpassword123',
        displayName: 'Password Test'
      };

      await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      // Check that password is hashed in database
      const user = await testPrisma.user.findUnique({
        where: { username: userData.username }
      });

      expect(user.password).not.toBe(userData.password);
      expect(user.password).toMatch(/^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/); // bcrypt hash pattern
    });

    it('should verify password correctly during login', async () => {
      const userData = {
        username: 'verifytest',
        email: 'verifytest@example.com',
        password: 'verifypassword123',
        displayName: 'Verify Test'
      };

      // Register user
      await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      // Login with correct password
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.data).toHaveProperty('token');
    });
  });

  describe('Token Security', () => {
    it('should include user information in token', async () => {
      const token = generateTestToken(testUser);
      const jwt = await import('jsonwebtoken');

      const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
      expect(decoded.id).toBe(testUser.id);
      expect(decoded.username).toBe(testUser.username);
      expect(decoded.isAdmin).toBe(testUser.isAdmin);
    });

    it('should reject tokens with wrong secret', async () => {
      const jwt = await import('jsonwebtoken');
      const wrongToken = jwt.default.sign(
        { id: testUser.id, username: testUser.username },
        'wrong-secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/auth/profile')
        .set('Authorization', `Bearer ${wrongToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});