import { PrismaClient } from 'database';

const prisma = new PrismaClient();

/**
 * Notification routes
 */
export default async function notificationRoutes(fastify, options) {
  // Get user's notifications
  fastify.get('/', {
    preHandler: fastify.authenticateToken
  }, async (request, reply) => {
    try {
      const { page = 1, limit = 20, unreadOnly = false } = request.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const where = {
        userId: request.user.id
      };

      if (unreadOnly === 'true') {
        where.isRead = false;
      }

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take
        }),
        prisma.notification.count({ where })
      ]);

      const totalPages = Math.ceil(total / take);

      return {
        success: true,
        data: notifications,
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
        message: 'Failed to fetch notifications'
      });
    }
  });

  // Mark notification as read
  fastify.put('/:id/read', {
    preHandler: fastify.authenticateToken
  }, async (request, reply) => {
    try {
      const { id } = request.params;

      const notification = await prisma.notification.findUnique({
        where: { id }
      });

      if (!notification) {
        return reply.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      if (notification.userId !== request.user.id) {
        return reply.status(403).json({
          success: false,
          message: 'Not authorized to modify this notification'
        });
      }

      await prisma.notification.update({
        where: { id },
        data: { isRead: true }
      });

      return {
        success: true,
        message: 'Notification marked as read'
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).json({
        success: false,
        message: 'Failed to update notification'
      });
    }
  });

  // Mark all notifications as read
  fastify.put('/read-all', {
    preHandler: fastify.authenticateToken
  }, async (request, reply) => {
    try {
      await prisma.notification.updateMany({
        where: {
          userId: request.user.id,
          isRead: false
        },
        data: { isRead: true }
      });

      return {
        success: true,
        message: 'All notifications marked as read'
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).json({
        success: false,
        message: 'Failed to mark notifications as read'
      });
    }
  });

  // Delete notification
  fastify.delete('/:id', {
    preHandler: fastify.authenticateToken
  }, async (request, reply) => {
    try {
      const { id } = request.params;

      const notification = await prisma.notification.findUnique({
        where: { id }
      });

      if (!notification) {
        return reply.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      if (notification.userId !== request.user.id) {
        return reply.status(403).json({
          success: false,
          message: 'Not authorized to delete this notification'
        });
      }

      await prisma.notification.delete({
        where: { id }
      });

      return {
        success: true,
        message: 'Notification deleted'
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).json({
        success: false,
        message: 'Failed to delete notification'
      });
    }
  });

  // Get notification count
  fastify.get('/count', {
    preHandler: fastify.authenticateToken
  }, async (request, reply) => {
    try {
      const { unreadOnly = false } = request.query;

      const where = {
        userId: request.user.id
      };

      if (unreadOnly === 'true') {
        where.isRead = false;
      }

      const count = await prisma.notification.count({ where });

      return {
        success: true,
        data: { count }
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).json({
        success: false,
        message: 'Failed to get notification count'
      });
    }
  });

  // Get notification preferences
  fastify.get('/preferences', {
    preHandler: fastify.authenticateToken
  }, async (request, reply) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: request.user.id },
        select: { preferences: true }
      });

      const preferences = user?.preferences?.notifications || {
        likes: true,
        comments: true,
        follows: true,
        mentions: true,
        achievements: true,
        email: false,
        push: false
      };

      return {
        success: true,
        data: preferences
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).json({
        success: false,
        message: 'Failed to get notification preferences'
      });
    }
  });

  // Update notification preferences
  fastify.put('/preferences', {
    preHandler: fastify.authenticateToken
  }, async (request, reply) => {
    try {
      const preferences = request.body;

      const currentUser = await prisma.user.findUnique({
        where: { id: request.user.id },
        select: { preferences: true }
      });

      const currentPreferences = currentUser?.preferences || {};
      const updatedPreferences = {
        ...currentPreferences,
        notifications: {
          ...currentPreferences.notifications,
          ...preferences
        }
      };

      await prisma.user.update({
        where: { id: request.user.id },
        data: {
          preferences: updatedPreferences
        }
      });

      return {
        success: true,
        message: 'Notification preferences updated',
        data: updatedPreferences.notifications
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).json({
        success: false,
        message: 'Failed to update notification preferences'
      });
    }
  });
}

// Helper function to create notifications (used by other routes)
export const createNotification = async (data) => {
  try {
    const { userId, type, title, message, data: notificationData } = data;

    // Check user's notification preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true }
    });

    const preferences = user?.preferences?.notifications || {};
    const typeKey = type.toLowerCase();

    // Check if user has disabled this type of notification
    if (preferences[typeKey] === false) {
      return null;
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: notificationData || {},
        isRead: false
      }
    });

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
};