// Test setup file for Jest
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import request from 'supertest';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.PORT = '3001';

// Create a test database client
const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/drinks_review'
    }
  }
});

// Global test utilities
global.testPrisma = testPrisma;

// Setup before all tests
beforeAll(async () => {
  // Connect to test database
  await testPrisma.$connect();

  // Clean up test database once at the start
  await cleanupTestDatabase();

  // Create essential test categories
  await createEssentialCategories();
});

// Cleanup after all tests
afterAll(async () => {
  // Clean up at the end
  await cleanupTestDatabase();
  await testPrisma.$disconnect();
});

// Remove afterEach cleanup to prevent user/beverage deletion between tests
// Tests will use unique IDs to prevent conflicts

// Helper function to create essential categories
async function createEssentialCategories() {
  const categories = [
    { name: 'Wine', slug: 'wine', description: 'Wine category' },
    { name: 'Cocktail', slug: 'cocktail', description: 'Cocktail category' },
    { name: 'Spirit', slug: 'spirit', description: 'Spirit category' }
  ];

  for (const categoryData of categories) {
    const existing = await testPrisma.beverageCategory.findUnique({ where: { slug: categoryData.slug } });
    if (!existing) {
      await testPrisma.beverageCategory.create({ data: categoryData });
    }
  }
}

// Helper function to clean up test database
async function cleanupTestDatabase() {
  try {
    // Delete all data in dependency order (children first, then parents)
    await testPrisma.auditLog.deleteMany();
    await testPrisma.notification.deleteMany();
    await testPrisma.comment.deleteMany();
    await testPrisma.like.deleteMany();
    await testPrisma.follows.deleteMany();
    await testPrisma.checkIn.deleteMany();
    await testPrisma.photo.deleteMany();
    await testPrisma.review.deleteMany();
    await testPrisma.venue.deleteMany();
    await testPrisma.beverage.deleteMany();
    // Don't delete categories - they're essential for tests
    await testPrisma.user.deleteMany();

    console.log('✅ Test database cleaned successfully');
  } catch (error) {
    console.error('❌ Error cleaning test database:', error);
  }
}

// Helper function to generate unique test identifier
function generateUniqueId() {
  return crypto.randomUUID().replace(/-/g, '').substring(0, 8);
}

// Helper function to create test user
export const createTestUser = async (userData = {}) => {
  const uniqueId = generateUniqueId();

  const defaultUser = {
    username: `testuser${uniqueId}`,
    email: `test${uniqueId}@example.com`,
    password: 'password123',
    displayName: `Test User ${uniqueId}`,
    bio: 'Test bio',
    location: 'Test City'
  };

  const user = { ...defaultUser, ...userData };

  // Hash password
  const hashedPassword = await bcrypt.hash(user.password, 10);

  return await testPrisma.user.create({
    data: {
      ...user,
      password: hashedPassword
    }
  });
};

// Helper function to create test beverage
export const createTestBeverage = async (beverageData = {}) => {
  const uniqueId = generateUniqueId();

  const defaultBeverage = {
    name: `Test Beverage ${uniqueId}`,
    type: 'wine',
    description: 'Test description',
    abv: 12.5,
    region: 'Test Region',
    varietal: 'Test Varietal',
    isApproved: true
  };

  const beverage = { ...defaultBeverage, ...beverageData };

  // Get the wine category (should exist from setup)
  const category = await testPrisma.beverageCategory.findFirst({
    where: { slug: 'wine' }
  });

  if (!category) {
    throw new Error('Wine category not found. Test setup failed.');
  }

  return await testPrisma.beverage.create({
    data: {
      ...beverage,
      slug: beverage.name.toLowerCase().replace(/\s+/g, '-'),
      categoryId: category.id
    },
    include: {
      category: true
    }
  });
};

// Helper function to create test review
/**
 * Creates a test review with a fresh user and beverage unless explicitly provided.
 * Ensures user and beverage exist before review creation.
 */
export const createTestReview = async (reviewData = {}) => {
  // Always create a new user and beverage unless explicitly provided
  let user = reviewData.user;
  if (!user) {
    user = await createTestUser();
    if (!user || !user.id) {
      console.error('❌ Failed to create test user');
      throw new Error('Test user creation failed');
    }
  }

  let beverage = reviewData.beverage;
  if (!beverage) {
    beverage = await createTestBeverage();
    if (!beverage || !beverage.id) {
      console.error('❌ Failed to create test beverage');
      throw new Error('Test beverage creation failed');
    }
  }

  // Map 'content' to 'notes' if present
  let { user: _u, beverage: _b, content, ...rest } = reviewData;
  if (content) rest.notes = content;

  const defaultReview = {
    rating: 4,
    notes: 'Test review content',
    userId: user.id,
    beverageId: beverage.id
  };

  const review = { ...defaultReview, ...rest };

  // Defensive check: ensure user and beverage exist in DB
  const userExists = await testPrisma.user.findUnique({ where: { id: user.id } });
  const beverageExists = await testPrisma.beverage.findUnique({ where: { id: beverage.id } });
  if (!userExists) {
    console.error('❌ User does not exist in DB before review creation:', user.id);
    throw new Error('User does not exist in DB');
  }
  if (!beverageExists) {
    console.error('❌ Beverage does not exist in DB before review creation:', beverage.id);
    throw new Error('Beverage does not exist in DB');
  }

  return await testPrisma.review.create({
    data: review,
    include: {
      user: true,
      beverage: true
    }
  });
};

// Helper function to create test admin user
export const createTestAdmin = async (adminData = {}) => {
  const uniqueId = generateUniqueId();

  const defaultAdmin = {
    username: `admin${uniqueId}`,
    email: `admin${uniqueId}@example.com`,
    password: 'admin123',
    displayName: `Admin User ${uniqueId}`,
    isAdmin: true,
    isVerified: true
  };

  const admin = { ...defaultAdmin, ...adminData };

  // Hash password
  const hashedPassword = await bcrypt.hash(admin.password, 10);

  return await testPrisma.user.create({
    data: {
      ...admin,
      password: hashedPassword
    }
  });
};

// Helper function to generate JWT token
export const generateTestToken = (user) => {
  const secret = process.env.JWT_SECRET || 'test-secret';

  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
      isAdmin: user.isAdmin
    },
    secret,
    { expiresIn: '1h' }
  );
};

// Helper function to make authenticated request
export const makeAuthenticatedRequest = (app, method, url, data = {}, user = null) => {
  if (!user) {
    return request(app)[method.toLowerCase()](url).send(data);
  }

  const token = generateTestToken(user);

  return request(app)
    [method.toLowerCase()](url)
    .set('Authorization', `Bearer ${token}`)
    .send(data);
};

// Mock file upload for testing
export const mockFileUpload = () => {
  return {
    fieldname: 'photo',
    originalname: 'test.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('fake-image-data'),
    size: 1024
  };
};

// Export testPrisma for use in tests
export { testPrisma };

// Export cleanupTestDatabase for use in tests
export { cleanupTestDatabase };

// Helper function to create test venue
export const createTestVenue = async (venueData = {}) => {
  const uniqueId = generateUniqueId();

  const defaultVenue = {
    name: `Test Venue ${uniqueId}`,
    slug: `test-venue-${uniqueId}`,
    description: 'Test venue description',
    address: '123 Test Street',
    city: 'Test City',
    state: 'Test State',
    country: 'Test Country',
    latitude: 40.7128,
    longitude: -74.0060,
    website: 'https://testvenue.com',
    phone: '555-123-4567',
    isVerified: true
  };

  const venue = { ...defaultVenue, ...venueData };

  return await testPrisma.venue.create({
    data: venue
  });
};