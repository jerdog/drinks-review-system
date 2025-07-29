import fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import beverageRoutes from './routes/beverages.js';
import reviewRoutes from './routes/reviews.js';
import socialRoutes from './routes/social.js';
import uploadRoutes from './routes/upload.js';
import venueRoutes from './routes/venues.js';
import notificationRoutes from './routes/notifications.js';
import adminRoutes from './routes/admin.js';
import searchRoutes from './routes/search.js';

// Import middleware
import { authenticateToken, optionalAuth } from './middleware/auth.js';

dotenv.config();

const app = fastify({
  logger: {
    level: 'info'
  }
});

// Register CORS
app.register(cors, {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
});

// Register authentication middleware
app.addHook('preHandler', async (request, reply) => {
  // Add CORS headers
  reply.header('Access-Control-Allow-Origin', '*');
  reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
});

// Auth routes (no authentication required)
app.post('/auth/register', authRoutes.register);
app.post('/auth/login', authRoutes.login);
app.get('/auth/:provider', authRoutes.socialLogin);

// User routes (authentication required)
app.get('/users/me', { preHandler: authenticateToken }, userRoutes.getCurrentUser);
app.put('/users/me', { preHandler: authenticateToken }, userRoutes.updateCurrentUser);

// Public user routes (optional authentication)
app.get('/users/:username', { preHandler: optionalAuth }, userRoutes.getUserByUsername);
app.get('/users/:username/followers', { preHandler: optionalAuth }, userRoutes.getFollowers);
app.get('/users/:username/following', { preHandler: optionalAuth }, userRoutes.getFollowing);

// Protected user routes (authentication required)
app.post('/users/:username/follow', { preHandler: authenticateToken }, userRoutes.followUser);
app.delete('/users/:username/follow', { preHandler: authenticateToken }, userRoutes.unfollowUser);

// Beverage routes
app.get('/beverages', beverageRoutes.getBeverages);
app.get('/beverages/search', beverageRoutes.searchBeverages);
app.get('/beverages/categories', beverageRoutes.getCategories);
app.get('/beverages/:id', beverageRoutes.getBeverage);
app.post('/beverages', { preHandler: authenticateToken }, beverageRoutes.createBeverage);
app.put('/beverages/:id', { preHandler: authenticateToken }, beverageRoutes.updateBeverage);
app.delete('/beverages/:id', { preHandler: authenticateToken }, beverageRoutes.deleteBeverage);

// Review routes
app.get('/reviews', reviewRoutes.getReviews);
app.get('/reviews/:id', reviewRoutes.getReview);
app.post('/reviews', { preHandler: authenticateToken }, reviewRoutes.createReview);
app.put('/reviews/:id', { preHandler: authenticateToken }, reviewRoutes.updateReview);
app.delete('/reviews/:id', { preHandler: authenticateToken }, reviewRoutes.deleteReview);
app.get('/users/:userId/reviews', reviewRoutes.getUserReviews);
app.post('/reviews/:id/like', { preHandler: authenticateToken }, reviewRoutes.toggleReviewLike);

// Social routes
app.register(socialRoutes, { prefix: '/social' });

// Upload routes
app.register(uploadRoutes, { prefix: '/upload' });

// Venue routes
app.register(venueRoutes, { prefix: '/venues' });

// Notification routes
app.register(notificationRoutes, { prefix: '/notifications' });

// Admin routes
app.register(adminRoutes, { prefix: '/admin' });

// Search routes
app.register(searchRoutes, { prefix: '/search' });

// Health check
app.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Debug route to list all registered routes
app.get('/debug/routes', async (request, reply) => {
  const routes = [];
  app.routes.forEach(route => {
    routes.push({
      method: route.method,
      url: route.url
    });
  });
  return { routes };
});

// Error handler
app.setErrorHandler((error, request, reply) => {
  app.log.error(error);

  if (error.validation) {
    return reply.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.validation
    });
  }

  return reply.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
const start = async () => {
  try {
    const port = process.env.PORT || 3001;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 API server running on port ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

// Only start the server if this file is run directly (not when imported for testing)
if (import.meta.url === `file://${process.argv[1]}`) {
  start();
}

// Export the app for testing
export default app;