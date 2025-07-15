import { PrismaClient } from 'database';

const prisma = new PrismaClient();

/**
 * Admin routes
 */
export default async function adminRoutes(fastify, options) {
  // Admin authentication middleware
  const requireAdmin = async (request, reply) => {
    if (!request.user) {
      return reply.code(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: request.user.id },
      select: { isAdmin: true }
    });

    if (!user || !user.isAdmin) {
      return reply.code(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
  };

  // Get admin dashboard stats
  fastify.get('/dashboard', {
    preHandler: [fastify.authenticateToken, requireAdmin]
  }, async (request, reply) => {
    try {
      const [
        totalUsers,
        totalReviews,
        totalBeverages,
        totalVenues,
        pendingBeverages,
        recentActivity
      ] = await Promise.all([
        prisma.user.count(),
        prisma.review.count(),
        prisma.beverage.count(),
        prisma.venue.count(),
        prisma.beverage.count({ where: { isApproved: false } }),
        prisma.auditLog.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            admin: {
              select: { username: true, displayName: true }
            }
          }
        })
      ]);

      return {
        success: true,
        data: {
          stats: {
            totalUsers,
            totalReviews,
            totalBeverages,
            totalVenues,
            pendingBeverages
          },
          recentActivity
        }
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard data'
      });
    }
  });

  // Get all users with pagination and search
  fastify.get('/users', {
    preHandler: [fastify.authenticateToken, requireAdmin]
  }, async (request, reply) => {
    try {
      const { page = 1, limit = 20, search = '', role = '' } = request.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const where = {};

      if (search) {
        where.OR = [
          { username: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { displayName: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (role === 'admin') {
        where.isAdmin = true;
      } else if (role === 'user') {
        where.isAdmin = false;
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          include: {
            _count: {
              select: {
                reviews: true,
                followers: true,
                following: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take
        }),
        prisma.user.count({ where })
      ]);

      const totalPages = Math.ceil(total / take);

      return {
        success: true,
        data: users,
        pagination: {
          page: parseInt(page),
          limit: take,
          total,
          totalPages
        }
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).json({
        success: false,
        message: 'Failed to fetch users'
      });
    }
  });

  // Update user (ban/unban, role changes)
  fastify.put('/users/:userId', {
    preHandler: [fastify.authenticateToken, requireAdmin]
  }, async (request, reply) => {
    try {
      const { userId } = request.params;
      const { isBanned, isAdmin, isVerified } = request.body;

      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return reply.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Prevent admin from demoting themselves
      if (user.isAdmin && request.user.id === userId && isAdmin === false) {
        return reply.status(400).json({
          success: false,
          message: 'Cannot demote yourself from admin'
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          isBanned: isBanned !== undefined ? isBanned : user.isBanned,
          isAdmin: isAdmin !== undefined ? isAdmin : user.isAdmin,
          isVerified: isVerified !== undefined ? isVerified : user.isVerified
        }
      });

      // Log admin action
      await prisma.auditLog.create({
        data: {
          action: 'user_updated',
          entityType: 'user',
          entityId: userId,
          adminId: request.user.id,
          data: {
            previous: {
              isBanned: user.isBanned,
              isAdmin: user.isAdmin,
              isVerified: user.isVerified
            },
            current: {
              isBanned: updatedUser.isBanned,
              isAdmin: updatedUser.isAdmin,
              isVerified: updatedUser.isVerified
            }
          }
        }
      });

      return {
        success: true,
        message: 'User updated successfully',
        data: updatedUser
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).json({
        success: false,
        message: 'Failed to update user'
      });
    }
  });

  // Get pending beverages for approval
  fastify.get('/beverages/pending', {
    preHandler: [fastify.authenticateToken, requireAdmin]
  }, async (request, reply) => {
    try {
      const { page = 1, limit = 20 } = request.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const [beverages, total] = await Promise.all([
        prisma.beverage.findMany({
          where: { isApproved: false },
          include: {
            category: true,
            suggestedBy: {
              select: { id: true, username: true, displayName: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take
        }),
        prisma.beverage.count({ where: { isApproved: false } })
      ]);

      const totalPages = Math.ceil(total / take);

      return {
        success: true,
        data: beverages,
        pagination: {
          page: parseInt(page),
          limit: take,
          total,
          totalPages
        }
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).json({
        success: false,
        message: 'Failed to fetch pending beverages'
      });
    }
  });

  // Approve/reject beverage
  fastify.put('/beverages/:beverageId/approve', {
    preHandler: [fastify.authenticateToken, requireAdmin]
  }, async (request, reply) => {
    try {
      const { beverageId } = request.params;
      const { approved, reason } = request.body;

      const beverage = await prisma.beverage.findUnique({
        where: { id: beverageId },
        include: {
          suggestedBy: {
            select: { id: true, username: true, displayName: true }
          }
        }
      });

      if (!beverage) {
        return reply.status(404).json({
          success: false,
          message: 'Beverage not found'
        });
      }

      if (beverage.isApproved) {
        return reply.status(400).json({
          success: false,
          message: 'Beverage already approved'
        });
      }

      const updatedBeverage = await prisma.beverage.update({
        where: { id: beverageId },
        data: {
          isApproved: approved
        }
      });

      // Log admin action
      await prisma.auditLog.create({
        data: {
          action: approved ? 'beverage_approved' : 'beverage_rejected',
          entityType: 'beverage',
          entityId: beverageId,
          adminId: request.user.id,
          data: {
            reason,
            suggestedBy: beverage.suggestedBy?.username
          }
        }
      });

      return {
        success: true,
        message: approved ? 'Beverage approved' : 'Beverage rejected',
        data: updatedBeverage
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).json({
        success: false,
        message: 'Failed to update beverage'
      });
    }
  });

  // Get audit logs
  fastify.get('/audit-logs', {
    preHandler: [fastify.authenticateToken, requireAdmin]
  }, async (request, reply) => {
    try {
      const { page = 1, limit = 20, action = '', entityType = '' } = request.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const where = {};

      if (action) {
        where.action = action;
      }

      if (entityType) {
        where.entityType = entityType;
      }

      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          include: {
            admin: {
              select: { username: true, displayName: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take
        }),
        prisma.auditLog.count({ where })
      ]);

      const totalPages = Math.ceil(total / take);

      return {
        success: true,
        data: logs,
        pagination: {
          page: parseInt(page),
          limit: take,
          total,
          totalPages
        }
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).json({
        success: false,
        message: 'Failed to fetch audit logs'
      });
    }
  });

  // Get content reports
  fastify.get('/reports', {
    preHandler: [fastify.authenticateToken, requireAdmin]
  }, async (request, reply) => {
    try {
      const { page = 1, limit = 20, status = '' } = request.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      // For now, return empty array as reports system not implemented yet
      // This would be implemented when user reporting is added
      return {
        success: true,
        data: [],
        pagination: {
          page: parseInt(page),
          limit: take,
          total: 0,
          totalPages: 0
        }
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).json({
        success: false,
        message: 'Failed to fetch reports'
      });
    }
  });

  // Delete content (reviews, comments, etc.)
  fastify.delete('/content/:type/:id', {
    preHandler: [fastify.authenticateToken, requireAdmin]
  }, async (request, reply) => {
    try {
      const { type, id } = request.params;
      const { reason } = request.body;

      let deletedContent;
      let action;

      switch (type) {
        case 'review':
          deletedContent = await prisma.review.findUnique({
            where: { id },
            include: {
              user: { select: { username: true } }
            }
          });
          if (deletedContent) {
            await prisma.review.delete({ where: { id } });
            action = 'review_deleted';
          }
          break;

        case 'comment':
          deletedContent = await prisma.comment.findUnique({
            where: { id },
            include: {
              user: { select: { username: true } }
            }
          });
          if (deletedContent) {
            await prisma.comment.delete({ where: { id } });
            action = 'comment_deleted';
          }
          break;

        case 'beverage':
          deletedContent = await prisma.beverage.findUnique({
            where: { id }
          });
          if (deletedContent) {
            await prisma.beverage.delete({ where: { id } });
            action = 'beverage_deleted';
          }
          break;

        default:
          return reply.status(400).json({
            success: false,
            message: 'Invalid content type'
          });
      }

      if (!deletedContent) {
        return reply.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }

      // Log admin action
      await prisma.auditLog.create({
        data: {
          action,
          entityType: type,
          entityId: id,
          adminId: request.user.id,
          data: {
            reason,
            contentOwner: deletedContent.user?.username || 'Unknown'
          }
        }
      });

      return {
        success: true,
        message: `${type} deleted successfully`
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).json({
        success: false,
        message: 'Failed to delete content'
      });
    }
  });

  // Get system statistics
  fastify.get('/stats', {
    preHandler: [fastify.authenticateToken, requireAdmin]
  }, async (request, reply) => {
    try {
      const [
        totalUsers,
        activeUsers,
        totalReviews,
        totalBeverages,
        totalVenues,
        pendingBeverages,
        recentRegistrations,
        recentReviews
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({
          where: {
            updatedAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          }
        }),
        prisma.review.count(),
        prisma.beverage.count(),
        prisma.venue.count(),
        prisma.beverage.count({ where: { isApproved: false } }),
        prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
            }
          }
        }),
        prisma.review.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
            }
          }
        })
      ]);

      return {
        success: true,
        data: {
          totalUsers,
          activeUsers,
          totalReviews,
          totalBeverages,
          totalVenues,
          pendingBeverages,
          recentRegistrations,
          recentReviews
        }
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).json({
        success: false,
        message: 'Failed to fetch statistics'
      });
    }
  });
}