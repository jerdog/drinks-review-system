import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from 'database';

/**
 * Generate JWT token
 * @param {Object} payload - Token payload
 * @returns {string} JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'test-secret', {
    expiresIn: '7d'
  });
};

/**
 * Register new user
 */
const register = async (req, reply) => {
  try {
    const { name, email, password, username } = req.body;

    // Validate required fields
    if (!name || !email || !password || !username) {
      return reply.code(400).send({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    });

    if (existingEmail) {
      return reply.code(400).send({
        success: false,
        message: 'Email already registered'
      });
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUsername) {
      return reply.code(400).send({
        success: false,
        message: 'Username already taken'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        displayName: name,
        email,
        username,
        password: hashedPassword
      }
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return reply.code(201).send({
      success: true,
      message: 'User registered successfully',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Registration error:', error);
    return reply.code(500).send({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Login user
 */
const login = async (req, reply) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return reply.code(400).send({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username: email } // Allow login with username
        ]
      }
    });

    if (!user) {
      return reply.code(401).send({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return reply.code(401).send({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return reply.code(200).send({
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    return reply.code(500).send({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get current user profile
 */
const getCurrentUser = async (req, reply) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            beverage: true
          }
        },
        followers: {
          take: 5,
          include: {
            follower: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true
              }
            }
          }
        },
        following: {
          take: 5,
          include: {
            following: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true
              }
            }
          }
        },
        _count: {
          select: {
            reviews: true,
            followers: true,
            following: true
          }
        }
      }
    });

    if (!user) {
      return reply.code(404).send({
        success: false,
        message: 'User not found'
      });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return reply.code(200).send({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return reply.code(500).send({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, reply) => {
  try {
    const userId = req.user.userId;
    const { name, bio, avatar, preferences } = req.body;

    const updateData = {};
    if (name) updateData.displayName = name;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (preferences) updateData.preferences = preferences;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return reply.code(200).send({
      success: true,
      message: 'Profile updated successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return reply.code(500).send({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Social login (placeholder for OAuth implementation)
 */
const socialLogin = async (req, reply) => {
  try {
    const { provider } = req.params;

    // TODO: Implement OAuth flow
    return reply.code(501).send({
      success: false,
      message: `${provider} login not implemented yet`
    });
  } catch (error) {
    console.error('Social login error:', error);
    return reply.code(500).send({
      success: false,
      message: 'Internal server error'
    });
  }
};

export default {
  register,
  login,
  getCurrentUser,
  updateProfile,
  socialLogin
};