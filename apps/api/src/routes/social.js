import { PrismaClient } from '@prisma/client';
import { createNotification } from './notifications.js';
import { authenticateToken } from '../middleware/auth.js';

const prisma = new PrismaClient();

/**
 * Social routes (follows, likes, comments)
 */
export default async function socialRoutes(fastify, options) {
  // Follow user
  fastify.post('/follow/:userId', { preHandler: authenticateToken }, async (request, reply) => {
    try {
      const { userId } = request.params;
      const currentUser = request.user;

      // Prevent self-following
      if (currentUser.userId === userId) {
        return reply.code(400).send({
          success: false,
          message: 'Cannot follow yourself'
        });
      }

      // Check if target user exists
      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true, displayName: true }
      });

      if (!targetUser) {
        return reply.code(404).send({
          success: false,
          message: 'User not found'
        });
      }

      // Check if already following
      const existingFollow = await prisma.follows.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUser.userId,
            followingId: userId
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
          followerId: currentUser.userId,
          followingId: userId
        }
      });

      // Create notification for followed user
      await createNotification({
        userId: userId,
        type: 'follow',
        title: 'New Follower',
        message: `${currentUser.username || 'Someone'} started following you`,
        data: {
          followerId: currentUser.userId,
          followerUsername: currentUser.username
        }
      });

      return reply.send({
        success: true,
        message: `Successfully followed ${targetUser.displayName || targetUser.username}`
      });
    } catch (error) {
      console.error('Follow error:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to follow user'
      });
    }
  });

  // Unfollow user
  fastify.delete('/follow/:userId', { preHandler: authenticateToken }, async (request, reply) => {
    try {
      const { userId } = request.params;
      const currentUser = request.user;

      // Check if following relationship exists
      const follow = await prisma.follows.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUser.userId,
            followingId: userId
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
            followerId: currentUser.userId,
            followingId: userId
          }
        }
      });

      return reply.send({
        success: true,
        message: 'User unfollowed successfully'
      });
    } catch (error) {
      console.error('Unfollow error:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to unfollow user'
      });
    }
  });

  // Get followers
  fastify.get('/followers/:userId', { preHandler: authenticateToken }, async (request, reply) => {
    try {
      const { userId } = request.params;
      const { page = 1, limit = 20 } = request.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const [followers, total] = await Promise.all([
        prisma.follows.findMany({
          where: { followingId: userId },
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
          orderBy: { createdAt: 'desc' },
          skip,
          take
        }),
        prisma.follows.count({ where: { followingId: userId } })
      ]);

      const totalPages = Math.ceil(total / take);

      return reply.send({
        success: true,
        followers: followers.map(f => f.follower),
        pagination: {
          page: parseInt(page),
          limit: take,
          total,
          totalPages
        }
      });
    } catch (error) {
      console.error('Get followers error:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to fetch followers'
      });
    }
  });

  // Get following
  fastify.get('/following/:userId', { preHandler: authenticateToken }, async (request, reply) => {
    try {
      const { userId } = request.params;
      const { page = 1, limit = 20 } = request.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const [following, total] = await Promise.all([
        prisma.follows.findMany({
          where: { followerId: userId },
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
          orderBy: { createdAt: 'desc' },
          skip,
          take
        }),
        prisma.follows.count({ where: { followerId: userId } })
      ]);

      const totalPages = Math.ceil(total / take);

      return reply.send({
        success: true,
        following: following.map(f => f.following),
        pagination: {
          page: parseInt(page),
          limit: take,
          total,
          totalPages
        }
      });
    } catch (error) {
      console.error('Get following error:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to fetch following'
      });
    }
  });

  // Like review
  fastify.post('/like/:reviewId', { preHandler: authenticateToken }, async (request, reply) => {
    try {
      const { reviewId } = request.params;
      const currentUser = request.user;

      if (!currentUser) {
        return reply.code(401).send({
          success: false,
          message: 'Authentication required'
        });
      }

      // Check if review exists
      const review = await prisma.review.findUnique({
        where: { id: reviewId },
        include: { user: true }
      });

      if (!review) {
        return reply.code(404).send({
          success: false,
          message: 'Review not found'
        });
      }

      // Check if already liked
      const existingLike = await prisma.like.findUnique({
        where: {
          userId_reviewId: {
            userId: currentUser.userId,
            reviewId: reviewId
          }
        }
      });

      if (existingLike) {
        return reply.code(400).send({
          success: false,
          message: 'Already liked this review'
        });
      }

      // Create like
      await prisma.like.create({
        data: {
          userId: currentUser.userId,
          reviewId: reviewId
        }
      });

      // Create notification for review author
      if (review.userId !== currentUser.userId) {
        await createNotification({
          userId: review.userId,
          type: 'like',
          title: 'New Like',
          message: `${currentUser.username || 'Someone'} liked your review`,
          data: {
            reviewId: reviewId,
            likerId: currentUser.userId,
            likerUsername: currentUser.username
          }
        });
      }

      return reply.send({
        success: true,
        message: 'Review liked successfully'
      });
    } catch (error) {
      console.error('Like error:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to like review'
      });
    }
  });

  // Unlike review
  fastify.delete('/like/:reviewId', { preHandler: authenticateToken }, async (request, reply) => {
    try {
      const { reviewId } = request.params;
      const currentUser = request.user;

      if (!currentUser) {
        return reply.code(401).send({
          success: false,
          message: 'Authentication required'
        });
      }

      // Check if like exists
      const like = await prisma.like.findUnique({
        where: {
          userId_reviewId: {
            userId: currentUser.userId,
            reviewId: reviewId
          }
        }
      });

      if (!like) {
        return reply.code(400).send({
          success: false,
          message: 'Not liked this review'
        });
      }

      // Remove like
      await prisma.like.delete({
        where: {
          userId_reviewId: {
            userId: currentUser.userId,
            reviewId: reviewId
          }
        }
      });

      return reply.send({
        success: true,
        message: 'Review unliked successfully'
      });
    } catch (error) {
      console.error('Unlike error:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to unlike review'
      });
    }
  });

  // Create comment
  fastify.post('/comment', { preHandler: authenticateToken }, async (request, reply) => {
    try {
      const { reviewId, content } = request.body;
      const currentUser = request.user;

      if (!currentUser) {
        return reply.code(401).send({
          success: false,
          message: 'Authentication required'
        });
      }

      // Validate required fields
      if (!reviewId) {
        return reply.code(400).send({
          success: false,
          message: 'Review ID is required'
        });
      }

      if (!content) {
        return reply.code(400).send({
          success: false,
          message: 'Comment content is required'
        });
      }

      // Validate content length
      if (content.trim().length === 0) {
        return reply.code(400).send({
          success: false,
          message: 'Comment content is required'
        });
      }

      if (content.length > 1000) {
        return reply.code(400).send({
          success: false,
          message: 'Comment too long (max 1000 characters)'
        });
      }

      // Check if review exists
      const review = await prisma.review.findUnique({
        where: { id: reviewId },
        include: { user: true }
      });

      if (!review) {
        return reply.code(404).send({
          success: false,
          message: 'Review not found'
        });
      }

      // Create comment
      const comment = await prisma.comment.create({
        data: {
          userId: currentUser.userId,
          reviewId: reviewId,
          content: content.trim()
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true
            }
          }
        }
      });

      // Create notification for review author
      if (review.userId !== currentUser.userId) {
        await createNotification({
          userId: review.userId,
          type: 'comment',
          title: 'New Comment',
          message: `${currentUser.username || 'Someone'} commented on your review`,
          data: {
            reviewId: reviewId,
            commentId: comment.id,
            commenterId: currentUser.userId,
            commenterUsername: currentUser.username
          }
        });
      }

      return reply.code(201).send({
        success: true,
        message: 'Comment created successfully',
        comment: comment
      });
    } catch (error) {
      console.error('Create comment error:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to create comment'
      });
    }
  });

  // Get comments for a review
  fastify.get('/comments/:reviewId', { preHandler: authenticateToken }, async (request, reply) => {
    try {
      const { reviewId } = request.params;
      const { page = 1, limit = 20 } = request.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      // Check if review exists
      const review = await prisma.review.findUnique({
        where: { id: reviewId }
      });

      if (!review) {
        return reply.code(404).send({
          success: false,
          message: 'Review not found'
        });
      }

      const [comments, total] = await Promise.all([
        prisma.comment.findMany({
          where: { reviewId },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take
        }),
        prisma.comment.count({ where: { reviewId } })
      ]);

      const totalPages = Math.ceil(total / take);

      return reply.send({
        success: true,
        comments: comments,
        pagination: {
          page: parseInt(page),
          limit: take,
          total,
          totalPages
        }
      });
    } catch (error) {
      console.error('Get comments error:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to fetch comments'
      });
    }
  });

  // Check follow status
  fastify.get('/follow/check/:userId', { preHandler: authenticateToken }, async (request, reply) => {
    try {
      const { userId } = request.params;
      const currentUser = request.user;

      if (!currentUser) {
        return reply.code(401).send({
          success: false,
          message: 'Authentication required'
        });
      }

      const follow = await prisma.follows.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUser.userId,
            followingId: userId
          }
        }
      });

      return reply.send({
        success: true,
        following: !!follow
      });
    } catch (error) {
      console.error('Check follow status error:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to check follow status'
      });
    }
  });

  // Check like status
  fastify.get('/like/check/:reviewId', { preHandler: authenticateToken }, async (request, reply) => {
    try {
      const { reviewId } = request.params;
      const currentUser = request.user;

      if (!currentUser) {
        return reply.code(401).send({
          success: false,
          message: 'Authentication required'
        });
      }

      const like = await prisma.like.findUnique({
        where: {
          userId_reviewId: {
            userId: currentUser.userId,
            reviewId: reviewId
          }
        }
      });

      return reply.send({
        success: true,
        liked: !!like
      });
    } catch (error) {
      console.error('Check like status error:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to check like status'
      });
    }
  });
}