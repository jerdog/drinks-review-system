import { PrismaClient } from 'database';

const prisma = new PrismaClient();

/**
 * Venue routes
 */
export default async function venueRoutes(fastify, options) {
  // Get all venues with pagination and search
  fastify.get('/', async (request, reply) => {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        city = '',
        state = '',
        country = ''
      } = request.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      // Build where clause
      const where = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (city) {
        where.city = { contains: city, mode: 'insensitive' };
      }

      if (state) {
        where.state = { contains: state, mode: 'insensitive' };
      }

      if (country) {
        where.country = { contains: country, mode: 'insensitive' };
      }

      const [venues, total] = await Promise.all([
        prisma.venue.findMany({
          where,
          include: {
            _count: {
              select: {
                reviews: true,
                checkIns: true
              }
            }
          },
          orderBy: {
            name: 'asc'
          },
          skip,
          take
        }),
        prisma.venue.count({ where })
      ]);

      const totalPages = Math.ceil(total / take);

      return {
        success: true,
        data: venues,
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
        message: 'Failed to fetch venues'
      });
    }
  });

  // Get venue by ID
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params;

      const venue = await prisma.venue.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              reviews: true,
              checkIns: true
            }
          }
        }
      });

      if (!venue) {
        return reply.status(404).json({
          success: false,
          message: 'Venue not found'
        });
      }

      return {
        success: true,
        data: venue
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).json({
        success: false,
        message: 'Failed to fetch venue'
      });
    }
  });

  // Create new venue
  fastify.post('/', {
    preHandler: fastify.authenticateToken
  }, async (request, reply) => {
    try {
      const {
        name,
        description,
        address,
        city,
        state,
        country,
        postalCode,
        phone,
        website,
        hours,
        coordinates
      } = request.body;

      // Validate required fields
      if (!name || !address || !city || !state || !country) {
        return reply.status(400).json({
          success: false,
          message: 'Name, address, city, state, and country are required'
        });
      }

      const venue = await prisma.venue.create({
        data: {
          name,
          description,
          address,
          city,
          state,
          country,
          postalCode,
          phone,
          website,
          hours,
          coordinates,
          createdBy: request.user.id
        }
      });

      return reply.status(201).json({
        success: true,
        message: 'Venue created successfully',
        data: venue
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).json({
        success: false,
        message: 'Failed to create venue'
      });
    }
  });

  // Update venue
  fastify.put('/:id', {
    preHandler: fastify.authenticateToken
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const updateData = request.body;

      // Check if venue exists
      const existingVenue = await prisma.venue.findUnique({
        where: { id }
      });

      if (!existingVenue) {
        return reply.status(404).json({
          success: false,
          message: 'Venue not found'
        });
      }

      // Check if user is authorized to update (admin or creator)
      if (existingVenue.createdBy !== request.user.id && request.user.role !== 'admin') {
        return reply.status(403).json({
          success: false,
          message: 'Not authorized to update this venue'
        });
      }

      const venue = await prisma.venue.update({
        where: { id },
        data: updateData
      });

      return {
        success: true,
        message: 'Venue updated successfully',
        data: venue
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).json({
        success: false,
        message: 'Failed to update venue'
      });
    }
  });

  // Delete venue
  fastify.delete('/:id', {
    preHandler: fastify.authenticateToken
  }, async (request, reply) => {
    try {
      const { id } = request.params;

      // Check if venue exists
      const existingVenue = await prisma.venue.findUnique({
        where: { id }
      });

      if (!existingVenue) {
        return reply.status(404).json({
          success: false,
          message: 'Venue not found'
        });
      }

      // Check if user is authorized to delete (admin or creator)
      if (existingVenue.createdBy !== request.user.id && request.user.role !== 'admin') {
        return reply.status(403).json({
          success: false,
          message: 'Not authorized to delete this venue'
        });
      }

      await prisma.venue.delete({
        where: { id }
      });

      return {
        success: true,
        message: 'Venue deleted successfully'
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).json({
        success: false,
        message: 'Failed to delete venue'
      });
    }
  });

  // Get venue reviews
  fastify.get('/:id/reviews', async (request, reply) => {
    try {
      const { id } = request.params;
      const { page = 1, limit = 20 } = request.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      // Check if venue exists
      const venue = await prisma.venue.findUnique({
        where: { id }
      });

      if (!venue) {
        return reply.status(404).json({
          success: false,
          message: 'Venue not found'
        });
      }

      const [reviews, total] = await Promise.all([
        prisma.review.findMany({
          where: { venueId: id },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true
              }
            },
            beverage: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take
        }),
        prisma.review.count({
          where: { venueId: id }
        })
      ]);

      const totalPages = Math.ceil(total / take);

      return {
        success: true,
        data: reviews,
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
        message: 'Failed to fetch reviews'
      });
    }
  });

  // Get venue check-ins
  fastify.get('/:id/check-ins', async (request, reply) => {
    try {
      const { id } = request.params;
      const { page = 1, limit = 20 } = request.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      // Check if venue exists
      const venue = await prisma.venue.findUnique({
        where: { id }
      });

      if (!venue) {
        return reply.status(404).json({
          success: false,
          message: 'Venue not found'
        });
      }

      const [checkIns, total] = await Promise.all([
        prisma.checkIn.findMany({
          where: { venueId: id },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true
              }
            },
            review: {
              include: {
                beverage: {
                  select: {
                    id: true,
                    name: true,
                    type: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take
        }),
        prisma.checkIn.count({
          where: { venueId: id }
        })
      ]);

      const totalPages = Math.ceil(total / take);

      return {
        success: true,
        data: checkIns,
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
        message: 'Failed to fetch check-ins'
      });
    }
  });

  // Search venues
  fastify.get('/search', async (request, reply) => {
    try {
      const { q = '', city = '', state = '', country = '' } = request.query;

      const where = {};

      if (q) {
        where.OR = [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { address: { contains: q, mode: 'insensitive' } }
        ];
      }

      if (city) {
        where.city = { contains: city, mode: 'insensitive' };
      }

      if (state) {
        where.state = { contains: state, mode: 'insensitive' };
      }

      if (country) {
        where.country = { contains: country, mode: 'insensitive' };
      }

      const venues = await prisma.venue.findMany({
        where,
        include: {
          _count: {
            select: {
              reviews: true,
              checkIns: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        },
        take: 10
      });

      return {
        success: true,
        data: venues
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).json({
        success: false,
        message: 'Failed to search venues'
      });
    }
  });
}