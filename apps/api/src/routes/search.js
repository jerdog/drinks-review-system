import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Comprehensive search routes for the platform
 */
export default async function searchRoutes(fastify, options) {

  // Search beverages with advanced filters
  fastify.get('/beverages', async (request, reply) => {
    try {
      const {
        q = '',
        type,
        category,
        region,
        varietal,
        abv_min,
        abv_max,
        vintage_min,
        vintage_max,
        rating_min,
        rating_max,
        price_min,
        price_max,
        sort_by = 'name',
        sort_order = 'asc',
        page = 1,
        limit = 20
      } = request.query;

      // Validate and parse pagination parameters
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      // Use defaults for invalid parameters instead of returning error
      const validPage = (isNaN(pageNum) || pageNum < 1) ? 1 : pageNum;
      const validLimit = (isNaN(limitNum) || limitNum < 1 || limitNum > 100) ? 20 : limitNum;

      const skip = (validPage - 1) * validLimit;
      const take = validLimit;

      // Build where clause for beverages
      const where = {
        isApproved: true
      };

      // Text search
      if (q) {
        where.OR = [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { region: { contains: q, mode: 'insensitive' } },
          { varietal: { contains: q, mode: 'insensitive' } }
        ];
      }

      // Filters
      if (type) where.type = type;
      if (category) where.categoryId = category;
      if (region) where.region = { contains: region, mode: 'insensitive' };
      if (varietal) where.varietal = { contains: varietal, mode: 'insensitive' };

      // Numeric ranges with validation
      if (abv_min || abv_max) {
        const abvMin = parseFloat(abv_min);
        const abvMax = parseFloat(abv_max);

        if (!isNaN(abvMin) || !isNaN(abvMax)) {
          where.abv = {};
          if (!isNaN(abvMin)) where.abv.gte = abvMin;
          if (!isNaN(abvMax)) where.abv.lte = abvMax;
        }
      }

      if (vintage_min || vintage_max) {
        const vintageMin = parseInt(vintage_min);
        const vintageMax = parseInt(vintage_max);

        if (!isNaN(vintageMin) || !isNaN(vintageMax)) {
          where.vintage = {};
          if (!isNaN(vintageMin)) where.vintage.gte = vintageMin;
          if (!isNaN(vintageMax)) where.vintage.lte = vintageMax;
        }
      }

      // Rating filter (requires join with reviews)
      let ratingFilter = null;
      if (rating_min || rating_max) {
        const ratingMin = parseInt(rating_min);
        const ratingMax = parseInt(rating_max);

        if (!isNaN(ratingMin) || !isNaN(ratingMax)) {
          ratingFilter = {
            reviews: {
              some: {
                rating: {
                  ...(!isNaN(ratingMin) && { gte: ratingMin }),
                  ...(!isNaN(ratingMax) && { lte: ratingMax })
                }
              }
            }
          };
        }
      }

      // Price filter (requires join with reviews)
      let priceFilter = null;
      if (price_min || price_max) {
        const priceMin = parseFloat(price_min);
        const priceMax = parseFloat(price_max);

        if (!isNaN(priceMin) || !isNaN(priceMax)) {
          priceFilter = {
            reviews: {
              some: {
                price: {
                  ...(!isNaN(priceMin) && { gte: priceMin }),
                  ...(!isNaN(priceMax) && { lte: priceMax })
                }
              }
            }
          };
        }
      }

      // Combine filters
      const finalWhere = {
        ...where,
        ...(ratingFilter && ratingFilter),
        ...(priceFilter && priceFilter)
      };

      // Validate sort parameters
      const validSortBy = ['name', 'type', 'region', 'abv', 'vintage', 'rating', 'reviews', 'createdAt'].includes(sort_by) ? sort_by : 'name';
      const validSortOrder = ['asc', 'desc'].includes(sort_order) ? sort_order : 'asc';

      // Determine sort order
      const orderBy = {};
      if (validSortBy === 'rating') {
        orderBy.reviews = { _count: validSortOrder };
      } else if (validSortBy === 'reviews') {
        orderBy.reviews = { _count: validSortOrder };
      } else {
        orderBy[validSortBy] = validSortOrder;
      }

      const [beverages, total] = await Promise.all([
        prisma.beverage.findMany({
          where: finalWhere,
          include: {
            category: true,
            _count: {
              select: { reviews: true }
            },
            reviews: {
              select: {
                rating: true,
                price: true
              }
            }
          },
          skip,
          take,
          orderBy
        }),
        prisma.beverage.count({ where: finalWhere })
      ]);

      // Calculate average ratings and prices
      const beveragesWithStats = beverages.map(beverage => {
        const ratings = beverage.reviews.map(r => r.rating).filter(r => r);
        const prices = beverage.reviews.map(r => r.price).filter(p => p);

        return {
          ...beverage,
          averageRating: ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null,
          averagePrice: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : null,
          reviews: undefined // Remove reviews array from response
        };
      });

      return reply.send({
        success: true,
        beverages: beveragesWithStats,
        pagination: {
          page: validPage,
          limit: take,
          total,
          totalPages: Math.ceil(total / take)
        }
      });
    } catch (error) {
      console.error('Error searching beverages:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to search beverages'
      });
    }
  });

  // Search venues with location and filters
  fastify.get('/venues', async (request, reply) => {
    try {
      const {
        q = '',
        city,
        state,
        country,
        rating_min,
        rating_max,
        sort_by = 'name',
        sort_order = 'asc',
        page = 1,
        limit = 20
      } = request.query;

      // Validate and parse pagination parameters
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      // Use defaults for invalid parameters instead of returning error
      const validPage = (isNaN(pageNum) || pageNum < 1) ? 1 : pageNum;
      const validLimit = (isNaN(limitNum) || limitNum < 1 || limitNum > 100) ? 20 : limitNum;

      const skip = (validPage - 1) * validLimit;
      const take = validLimit;

      const where = {};

      // Text search
      if (q) {
        where.OR = [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { address: { contains: q, mode: 'insensitive' } }
        ];
      }

      // Location filters
      if (city) where.city = { contains: city, mode: 'insensitive' };
      if (state) where.state = { contains: state, mode: 'insensitive' };
      if (country) where.country = { contains: country, mode: 'insensitive' };

      // Rating filter
      let ratingFilter = null;
      if (rating_min || rating_max) {
        ratingFilter = {
          reviews: {
            some: {
              rating: {
                ...(rating_min && { gte: parseInt(rating_min) }),
                ...(rating_max && { lte: parseInt(rating_max) })
              }
            }
          }
        };
      }

      const finalWhere = {
        ...where,
        ...(ratingFilter && ratingFilter)
      };

      const orderBy = {};
      orderBy[sort_by] = sort_order;

      const [venues, total] = await Promise.all([
        prisma.venue.findMany({
          where: finalWhere,
          include: {
            _count: {
              select: {
                reviews: true,
                checkIns: true
              }
            },
            reviews: {
              select: {
                rating: true
              }
            }
          },
          skip,
          take,
          orderBy
        }),
        prisma.venue.count({ where: finalWhere })
      ]);

      // Calculate average ratings
      const venuesWithStats = venues.map(venue => {
        const ratings = venue.reviews.map(r => r.rating).filter(r => r);

        return {
          ...venue,
          averageRating: ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null,
          reviews: undefined // Remove reviews array from response
        };
      });

      return reply.send({
        success: true,
        venues: venuesWithStats,
        pagination: {
          page: validPage,
          limit: take,
          total,
          totalPages: Math.ceil(total / take)
        }
      });
    } catch (error) {
      console.error('Error searching venues:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to search venues'
      });
    }
  });

  // Search reviews with filters
  fastify.get('/reviews', async (request, reply) => {
    try {
      const {
        q = '',
        rating_min,
        rating_max,
        price_min,
        price_max,
        beverage_type,
        beverage_category,
        user_id,
        venue_id,
        has_photos,
        sort_by = 'createdAt',
        sort_order = 'desc',
        page = 1,
        limit = 20
      } = request.query;

      // Validate and parse pagination parameters
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      // Use defaults for invalid parameters instead of returning error
      const validPage = (isNaN(pageNum) || pageNum < 1) ? 1 : pageNum;
      const validLimit = (isNaN(limitNum) || limitNum < 1 || limitNum > 100) ? 20 : limitNum;

      const skip = (validPage - 1) * validLimit;
      const take = validLimit;

      const where = {
        isPublic: true
      };

      // Text search
      if (q) {
        where.OR = [
          { notes: { contains: q, mode: 'insensitive' } },
          { beverage: { name: { contains: q, mode: 'insensitive' } } },
          { beverage: { description: { contains: q, mode: 'insensitive' } } }
        ];
      }

      // Filters
      if (rating_min || rating_max) {
        where.rating = {
          ...(rating_min && { gte: parseInt(rating_min) }),
          ...(rating_max && { lte: parseInt(rating_max) })
        };
      }

      if (price_min || price_max) {
        where.price = {
          ...(price_min && { gte: parseFloat(price_min) }),
          ...(price_max && { lte: parseFloat(price_max) })
        };
      }

      if (beverage_type) {
        where.beverage = { type: beverage_type };
      }

      if (beverage_category) {
        where.beverage = { categoryId: beverage_category };
      }

      if (user_id) {
        where.userId = user_id;
      }

      if (venue_id) {
        where.venueId = venue_id;
      }

      if (has_photos === 'true') {
        where.photos = { some: {} };
      }

      const orderBy = {};
      orderBy[sort_by] = sort_order;

      const [reviews, total] = await Promise.all([
        prisma.review.findMany({
          where,
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
              include: {
                category: true
              }
            },
            venue: true,
            _count: {
              select: {
                likes: true,
                comments: true,
                photos: true
              }
            }
          },
          skip,
          take,
          orderBy
        }),
        prisma.review.count({ where })
      ]);

      return reply.send({
        success: true,
        reviews,
        pagination: {
          page: validPage,
          limit: take,
          total,
          totalPages: Math.ceil(total / take)
        }
      });
    } catch (error) {
      console.error('Error searching reviews:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to search reviews'
      });
    }
  });

  // Search users with filters
  fastify.get('/users', async (request, reply) => {
    try {
      const {
        q = '',
        has_reviews,
        has_followers,
        is_verified,
        sort_by = 'username',
        sort_order = 'asc',
        page = 1,
        limit = 20
      } = request.query;

      // Validate and parse pagination parameters
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      // Use defaults for invalid parameters instead of returning error
      const validPage = (isNaN(pageNum) || pageNum < 1) ? 1 : pageNum;
      const validLimit = (isNaN(limitNum) || limitNum < 1 || limitNum > 100) ? 20 : limitNum;

      const skip = (validPage - 1) * validLimit;
      const take = validLimit;

      const where = {
        isPrivate: false
      };

      // Text search
      if (q) {
        where.OR = [
          { username: { contains: q, mode: 'insensitive' } },
          { displayName: { contains: q, mode: 'insensitive' } },
          { bio: { contains: q, mode: 'insensitive' } },
          { location: { contains: q, mode: 'insensitive' } }
        ];
      }

      // Filters
      if (has_reviews === 'true') {
        where.reviews = { some: {} };
      }

      if (has_followers === 'true') {
        where.followers = { some: {} };
      }

      if (is_verified === 'true') {
        where.isVerified = true;
      }

      const orderBy = {};
      orderBy[sort_by] = sort_order;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            username: true,
            displayName: true,
            bio: true,
            location: true,
            avatar: true,
            isVerified: true,
            createdAt: true,
            _count: {
              select: {
                reviews: true,
                followers: true,
                following: true
              }
            }
          },
          skip,
          take,
          orderBy
        }),
        prisma.user.count({ where })
      ]);

      return reply.send({
        success: true,
        users,
        pagination: {
          page: validPage,
          limit: take,
          total,
          totalPages: Math.ceil(total / take)
        }
      });
    } catch (error) {
      console.error('Error searching users:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to search users'
      });
    }
  });

  // Global search across all content types
  fastify.get('/global', async (request, reply) => {
    try {
      const { q = '', limit = 10 } = request.query;

      if (!q) {
        return reply.code(400).send({
          success: false,
          message: 'Search query required'
        });
      }

      // Search beverages
      const beverages = await prisma.beverage.findMany({
        where: {
          isApproved: true,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { region: { contains: q, mode: 'insensitive' } },
            { varietal: { contains: q, mode: 'insensitive' } }
          ]
        },
        include: {
          category: true,
          _count: { select: { reviews: true } }
        },
        take: Math.ceil(limit / 4),
        orderBy: { name: 'asc' }
      });

      // Search venues
      const venues = await prisma.venue.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { address: { contains: q, mode: 'insensitive' } }
          ]
        },
        include: {
          _count: { select: { reviews: true, checkIns: true } }
        },
        take: Math.ceil(limit / 4),
        orderBy: { name: 'asc' }
      });

      // Search users
      const users = await prisma.user.findMany({
        where: {
          isPrivate: false,
          OR: [
            { username: { contains: q, mode: 'insensitive' } },
            { displayName: { contains: q, mode: 'insensitive' } },
            { bio: { contains: q, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          isVerified: true,
          _count: {
            select: {
              reviews: true,
              followers: true
            }
          }
        },
        take: Math.ceil(limit / 4),
        orderBy: { username: 'asc' }
      });

      // Search reviews
      const reviews = await prisma.review.findMany({
        where: {
          isPublic: true,
          OR: [
            { notes: { contains: q, mode: 'insensitive' } },
            { beverage: { name: { contains: q, mode: 'insensitive' } } }
          ]
        },
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
            include: { category: true }
          },
          _count: {
            select: {
              likes: true,
              comments: true
            }
          }
        },
        take: Math.ceil(limit / 4),
        orderBy: { createdAt: 'desc' }
      });

      return reply.send({
        success: true,
        results: {
          beverages,
          venues,
          users,
          reviews
        },
        summary: {
          beverages: beverages.length,
          venues: venues.length,
          users: users.length,
          reviews: reviews.length
        }
      });
    } catch (error) {
      console.error('Error in global search:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to perform global search'
      });
    }
  });
}