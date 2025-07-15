import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Social routes (follows, likes, comments)
 */
export default async function socialRoutes(fastify, options) {
  // Follow user
  fastify.post('/follow/:userId', async (request, reply) => {
    try {
      const { userId } = request.params;
      const currentUser = request.user;

      if (!currentUser) {
        return reply.code(401).send({
          success: false,
          message: 'Authentication required'
        });
      }

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
      await prisma.notification.create({
        data: {
          type: 'follow',
          title: 'New Follower',
          message: `${currentUser.username || 'Someone'} started following you`,
          userId: userId,
          data: {
            followerId: currentUser.userId,
            followerUsername: currentUser.username
          }
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
  fastify.delete('/follow/:userId', async (request, reply) => {
    try {
      const { userId } = request.params;
      const currentUser = request.user;

      if (!currentUser) {
        return reply.code(401).send({
          success: false,
          message: 'Authentication required'
        });
      }

      // Check if following relationship exists
      const existingFollow = await prisma.follows.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUser.userId,
            followingId: userId
          }
        }
      });

      if (!existingFollow) {
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
        message: 'Successfully unfollowed user'
      });
    } catch (error) {
      console.error('Unfollow error:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to unfollow user'
      });
    }
  });

  // Like review
  fastify.post('/like/:reviewId', async (request, reply) => {
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
        include: {
          user: {
            select: { id: true, username: true, displayName: true }
          }
        }
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

      // Create notification for review author (if not own review)
      if (review.userId !== currentUser.userId) {
        await prisma.notification.create({
          data: {
            type: 'like',
            title: 'New Like',
            message: `${currentUser.username || 'Someone'} liked your review`,
            userId: review.userId,
            data: {
              likerId: currentUser.userId,
              likerUsername: currentUser.username,
              reviewId: reviewId
            }
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
  fastify.delete('/like/:reviewId', async (request, reply) => {
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
      const existingLike = await prisma.like.findUnique({
        where: {
          userId_reviewId: {
            userId: currentUser.userId,
            reviewId: reviewId
          }
        }
      });

      if (!existingLike) {
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

  // Comment on review
  fastify.post('/comment/:reviewId', async (request, reply) => {
    try {
      const { reviewId } = request.params;
      const { content } = request.body;
      const currentUser = request.user;

      if (!currentUser) {
        return reply.code(401).send({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!content || content.trim().length === 0) {
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
        include: {
          user: {
            select: { id: true, username: true, displayName: true }
          }
        }
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
          content: content.trim(),
          userId: currentUser.userId,
          reviewId: reviewId
        },
        include: {
          user: {
            select: { id: true, username: true, displayName: true, avatar: true }
          }
        }
      });

      // Create notification for review author (if not own review)
      if (review.userId !== currentUser.userId) {
        await prisma.notification.create({
          data: {
            type: 'comment',
            title: 'New Comment',
            message: `${currentUser.username || 'Someone'} commented on your review`,
            userId: review.userId,
            data: {
              commenterId: currentUser.userId,
              commenterUsername: currentUser.username,
              reviewId: reviewId,
              commentId: comment.id
            }
          }
        });
      }

      return reply.code(201).send({
        success: true,
        message: 'Comment added successfully',
        comment
      });
    } catch (error) {
      console.error('Comment error:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to add comment'
      });
    }
  });

  // Get user's followers
  fastify.get('/followers/:userId', async (request, reply) => {
    try {
      const { userId } = request.params;
      const { page = 1, limit = 20 } = request.query;
      const skip = (page - 1) * limit;

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true, displayName: true }
      });

      if (!user) {
        return reply.code(404).send({
          success: false,
          message: 'User not found'
        });
      }

      const [followers, total] = await Promise.all([
        prisma.follows.findMany({
          where: { followingId: userId },
          include: {
            follower: {
              select: { id: true, username: true, displayName: true, avatar: true }
            }
          },
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.follows.count({
          where: { followingId: userId }
        })
      ]);

      return reply.send({
        success: true,
        followers: followers.map(f => f.follower),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get followers error:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to get followers'
      });
    }
  });

  // Get user's following
  fastify.get('/following/:userId', async (request, reply) => {
    try {
      const { userId } = request.params;
      const { page = 1, limit = 20 } = request.query;
      const skip = (page - 1) * limit;

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true, displayName: true }
      });

      if (!user) {
        return reply.code(404).send({
          success: false,
          message: 'User not found'
        });
      }

      const [following, total] = await Promise.all([
        prisma.follows.findMany({
          where: { followerId: userId },
          include: {
            following: {
              select: { id: true, username: true, displayName: true, avatar: true }
            }
          },
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.follows.count({
          where: { followerId: userId }
        })
      ]);

      return reply.send({
        success: true,
        following: following.map(f => f.following),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get following error:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to get following'
      });
    }
  });

  // Check if current user is following another user
  fastify.get('/follow/check/:userId', async (request, reply) => {
    try {
      const { userId } = request.params;
      const currentUser = request.user;

      if (!currentUser) {
        return reply.code(401).send({
          success: false,
          message: 'Authentication required'
        });
      }

      const isFollowing = await prisma.follows.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUser.userId,
            followingId: userId
          }
        }
      });

      return reply.send({
        success: true,
        isFollowing: !!isFollowing
      });
    } catch (error) {
      console.error('Check follow error:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to check follow status'
      });
    }
  });

  // Check if current user has liked a review
  fastify.get('/like/check/:reviewId', async (request, reply) => {
    try {
      const { reviewId } = request.params;
      const currentUser = request.user;

      if (!currentUser) {
        return reply.code(401).send({
          success: false,
          message: 'Authentication required'
        });
      }

      const hasLiked = await prisma.like.findUnique({
        where: {
          userId_reviewId: {
            userId: currentUser.userId,
            reviewId: reviewId
          }
        }
      });

      return reply.send({
        success: true,
        hasLiked: !!hasLiked
      });
    } catch (error) {
      console.error('Check like error:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to check like status'
      });
    }
  });
}