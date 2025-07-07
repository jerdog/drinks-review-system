import fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';

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

start();