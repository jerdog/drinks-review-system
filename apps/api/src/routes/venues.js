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
          },
          reviews: {
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
            take: 10
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

  // Create venue
  fastify.post('/', {
    preHandler: fastify.authenticateToken
  }, async (request, reply) => {
    try {
      const venueData = request.body;

      // Validate required fields
      if (!venueData.name) {
        return reply.status(400).json({
          success: false,
          message: 'Venue name is required'
        });
      }

      // Generate slug from name
      const slug = venueData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const venue = await prisma.venue.create({
        data: {
          name: venueData.name,
          slug,
          description: venueData.description || null,
          address: venueData.address || null,
          city: venueData.city || null,
          state: venueData.state || null,
          country: venueData.country || null,
          latitude: venueData.latitude ? parseFloat(venueData.latitude) : null,
          longitude: venueData.longitude ? parseFloat(venueData.longitude) : null,
          website: venueData.website || null,
          phone: venueData.phone || null
        }
      });

      return {
        success: true,
        message: 'Venue created successfully',
        data: venue
      };
    } catch (error) {
      fastify.log.error(error);

      if (error.code === 'P2002') {
        return reply.status(400).json({
          success: false,
          message: 'A venue with this name already exists'
        });
      }

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
      const venueData = request.body;

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

      // Generate new slug if name changed
      let slug = existingVenue.slug;
      if (venueData.name && venueData.name !== existingVenue.name) {
        slug = venueData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }

      const venue = await prisma.venue.update({
        where: { id },
        data: {
          name: venueData.name || existingVenue.name,
          slug,
          description: venueData.description !== undefined ? venueData.description : existingVenue.description,
          address: venueData.address !== undefined ? venueData.address : existingVenue.address,
          city: venueData.city !== undefined ? venueData.city : existingVenue.city,
          state: venueData.state !== undefined ? venueData.state : existingVenue.state,
          country: venueData.country !== undefined ? venueData.country : existingVenue.country,
          latitude: venueData.latitude !== undefined ? parseFloat(venueData.latitude) : existingVenue.latitude,
          longitude: venueData.longitude !== undefined ? parseFloat(venueData.longitude) : existingVenue.longitude,
          website: venueData.website !== undefined ? venueData.website : existingVenue.website,
          phone: venueData.phone !== undefined ? venueData.phone : existingVenue.phone
        }
      });

      return {
        success: true,
        message: 'Venue updated successfully',
        data: venue
      };
    } catch (error) {
      fastify.log.error(error);

      if (error.code === 'P2002') {
        return reply.status(400).json({
          success: false,
          message: 'A venue with this name already exists'
        });
      }

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
      const venue = await prisma.venue.findUnique({
        where: { id }
      });

      if (!venue) {
        return reply.status(404).json({
          success: false,
          message: 'Venue not found'
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

  // Check-in to venue
  fastify.post('/:id/checkin', {
    preHandler: fastify.authenticateToken
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const { reviewId } = request.body;

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

      // Check if review exists if provided
      if (reviewId) {
        const review = await prisma.review.findUnique({
          where: { id: reviewId }
        });

        if (!review) {
          return reply.status(404).json({
            success: false,
            message: 'Review not found'
          });
        }
      }

      const checkIn = await prisma.checkIn.create({
        data: {
          userId: request.user.id,
          venueId: id,
          reviewId: reviewId || null
        },
        include: {
          venue: true,
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
        }
      });

      return {
        success: true,
        message: 'Check-in successful',
        data: checkIn
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).json({
        success: false,
        message: 'Failed to check-in'
      });
    }
  });

  // Get check-ins for venue
  fastify.get('/:id/checkins', async (request, reply) => {
    try {
      const { id } = request.params;
      const { page = 1, limit = 20 } = request.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

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