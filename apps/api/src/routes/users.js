import { prisma } from 'database';

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
 * Update current user profile
 */
const updateCurrentUser = async (req, reply) => {
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
 * Get user profile by username
 */
const getUserByUsername = async (req, reply) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user?.userId;

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            beverage: true
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

    // Check if current user is following this user
    let isFollowing = false;
    if (currentUserId && currentUserId !== user.id) {
      const follow = await prisma.follows.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: user.id
          }
        }
      });
      isFollowing = !!follow;
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return reply.code(200).send({
      success: true,
      user: userWithoutPassword,
      isFollowing
    });
  } catch (error) {
    console.error('Get user by username error:', error);
    return reply.code(500).send({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Follow user
 */
const followUser = async (req, reply) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user.userId;

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { username }
    });

    if (!targetUser) {
      return reply.code(404).send({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent self-following
    if (currentUserId === targetUser.id) {
      return reply.code(400).send({
        success: false,
        message: 'Cannot follow yourself'
      });
    }

    // Check if already following
    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUser.id
        }
      }
    });

    if (existingFollow) {
      return reply.code(400).send({
        success: false,
        message: 'Already following this user'
      });
    }

    // Create follow relationship
    await prisma.follows.create({
      data: {
        followerId: currentUserId,
        followingId: targetUser.id
      }
    });

    return reply.code(200).send({
      success: true,
      message: `Successfully followed ${targetUser.displayName || targetUser.username}`
    });
  } catch (error) {
    console.error('Follow user error:', error);
    return reply.code(500).send({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Unfollow user
 */
const unfollowUser = async (req, reply) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user.userId;

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { username }
    });

    if (!targetUser) {
      return reply.code(404).send({
        success: false,
        message: 'User not found'
      });
    }

    // Check if following relationship exists
    const follow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUser.id
        }
      }
    });

    if (!follow) {
      return reply.code(400).send({
        success: false,
        message: 'Not following this user'
      });
    }

    // Remove follow relationship
    await prisma.follows.delete({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUser.id
        }
      }
    });

    return reply.code(200).send({
      success: true,
      message: 'Successfully unfollowed user'
    });
  } catch (error) {
    console.error('Unfollow user error:', error);
    return reply.code(500).send({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get user followers
 */
const getFollowers = async (req, reply) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return reply.code(404).send({
        success: false,
        message: 'User not found'
      });
    }

    const followers = await prisma.follows.findMany({
      where: {
        followingId: user.id
      },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            bio: true
          }
        }
      },
      skip: offset,
      take: parseInt(limit),
      orderBy: {
        createdAt: 'desc'
      }
    });

    const totalFollowers = await prisma.follows.count({
      where: {
        followingId: user.id
      }
    });

    return reply.code(200).send({
      success: true,
      followers: followers.map(f => f.follower),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalFollowers,
        pages: Math.ceil(totalFollowers / limit)
      }
    });
  } catch (error) {
    console.error('Get followers error:', error);
    return reply.code(500).send({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get user following
 */
const getFollowing = async (req, reply) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return reply.code(404).send({
        success: false,
        message: 'User not found'
      });
    }

    const following = await prisma.follows.findMany({
      where: {
        followerId: user.id
      },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            bio: true
          }
        }
      },
      skip: offset,
      take: parseInt(limit),
      orderBy: {
        createdAt: 'desc'
      }
    });

    const totalFollowing = await prisma.follows.count({
      where: {
        followerId: user.id
      }
    });

    return reply.code(200).send({
      success: true,
      following: following.map(f => f.following),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalFollowing,
        pages: Math.ceil(totalFollowing / limit)
      }
    });
  } catch (error) {
    console.error('Get following error:', error);
    return reply.code(500).send({
      success: false,
      message: 'Internal server error'
    });
  }
};

export default {
  getCurrentUser,
  updateCurrentUser,
  getUserByUsername,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing
};