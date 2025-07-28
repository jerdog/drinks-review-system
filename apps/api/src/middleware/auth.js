import jwt from 'jsonwebtoken';

/**
 * Authentication middleware
 * Verifies JWT token and adds user info to request
 */
const authenticateToken = async (req, reply) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return reply.code(401).send({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
    req.user = decoded;

    return;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return reply.code(401).send({
        success: false,
        message: 'Token expired'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return reply.code(401).send({
        success: false,
        message: 'Invalid token'
      });
    }

    console.error('Auth middleware error:', error);
    return reply.code(500).send({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Optional authentication middleware
 * Adds user info if token is present, but doesn't require it
 */
const optionalAuth = async (req, reply) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
        req.user = decoded;
      } catch (error) {
        // Token is invalid, but we don't fail the request
        console.warn('Invalid token in optional auth:', error.message);
      }
    }

    return;
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    return;
  }
};

export { authenticateToken, optionalAuth };