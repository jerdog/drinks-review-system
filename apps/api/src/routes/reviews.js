import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all reviews (with pagination and filters)
const getReviews = async (request, reply) => {
  try {
    const { page = 1, limit = 20, beverageId, userId, rating, sort = 'newest' } = request.query;
    const skip = (page - 1) * limit;

    const where = {
      isPublic: true,
      ...(beverageId && { beverageId }),
      ...(userId && { userId }),
      ...(rating && { rating: parseInt(rating) })
    };

    const orderBy = {
      newest: { createdAt: 'desc' },
      oldest: { createdAt: 'asc' },
      rating: { rating: 'desc' },
      popular: { likes: { _count: 'desc' } }
    }[sort] || { createdAt: 'desc' };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: { id: true, username: true, displayName: true, avatar: true }
          },
          beverage: {
            select: { id: true, name: true, type: true, region: true }
          },
          venue: {
            select: { id: true, name: true, city: true }
          },
          _count: {
            select: { likes: true, comments: true }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy
      }),
      prisma.review.count({ where })
    ]);

    return reply.send({
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return reply.code(500).send({ error: 'Failed to fetch reviews' });
  }
};

// Get a single review by ID
const getReview = async (request, reply) => {
  try {
    const { id } = request.params;

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, username: true, displayName: true, avatar: true }
        },
        beverage: {
          select: { id: true, name: true, type: true, region: true, varietal: true }
        },
        venue: {
          select: { id: true, name: true, city: true, state: true }
        },
        comments: {
          include: {
            user: {
              select: { id: true, username: true, displayName: true, avatar: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: { likes: true, comments: true }
        }
      }
    });

    if (!review) {
      return reply.code(404).send({ error: 'Review not found' });
    }

    return reply.send({ review });
  } catch (error) {
    console.error('Error fetching review:', error);
    return reply.code(500).send({ error: 'Failed to fetch review' });
  }
};

// Create a new review
const createReview = async (request, reply) => {
  try {
    const { beverageId, venueId, rating, title, content, price, servingSize, servingType } = request.body;
    const user = request.user;

    if (!user) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    // Validate required fields
    if (!beverageId || !rating || !title || !content) {
      return reply.code(400).send({ error: 'Beverage ID, rating, title, and content are required' });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return reply.code(400).send({ error: 'Rating must be between 1 and 5' });
    }

    // Check if beverage exists
    const beverage = await prisma.beverage.findUnique({
      where: { id: beverageId }
    });

    if (!beverage) {
      return reply.code(404).send({ error: 'Beverage not found' });
    }

    // Check if venue exists if provided
    if (venueId) {
      const venue = await prisma.venue.findUnique({
        where: { id: venueId }
      });

      if (!venue) {
        return reply.code(404).send({ error: 'Venue not found' });
      }
    }

    const review = await prisma.review.create({
      data: {
        beverageId,
        venueId,
        userId: user.userId,
        rating: parseInt(rating),
        title,
        content,
        price: price ? parseFloat(price) : null,
        servingSize: servingSize ? parseFloat(servingSize) : null,
        servingType,
        isPublic: true
      },
      include: {
        user: {
          select: { id: true, username: true, displayName: true, avatar: true }
        },
        beverage: {
          select: { id: true, name: true, type: true, region: true }
        },
        venue: {
          select: { id: true, name: true, city: true }
        }
      }
    });

    return reply.code(201).send({ review });
  } catch (error) {
    console.error('Error creating review:', error);
    return reply.code(500).send({ error: 'Failed to create review' });
  }
};

// Update a review
const updateReview = async (request, reply) => {
  try {
    const { id } = request.params;
    const { rating, title, content, price, servingSize, servingType, isPublic } = request.body;
    const user = request.user;

    if (!user) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    // Check if review exists
    const existingReview = await prisma.review.findUnique({
      where: { id }
    });

    if (!existingReview) {
      return reply.code(404).send({ error: 'Review not found' });
    }

    // Check if user owns the review
    if (existingReview.userId !== user.userId) {
      return reply.code(403).send({ error: 'Not authorized to update this review' });
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return reply.code(400).send({ error: 'Rating must be between 1 and 5' });
    }

    const review = await prisma.review.update({
      where: { id },
      data: {
        ...(rating && { rating: parseInt(rating) }),
        ...(title && { title }),
        ...(content && { content }),
        ...(price !== undefined && { price: price ? parseFloat(price) : null }),
        ...(servingSize !== undefined && { servingSize: servingSize ? parseFloat(servingSize) : null }),
        ...(servingType && { servingType }),
        ...(isPublic !== undefined && { isPublic })
      },
      include: {
        user: {
          select: { id: true, username: true, displayName: true, avatar: true }
        },
        beverage: {
          select: { id: true, name: true, type: true, region: true }
        },
        venue: {
          select: { id: true, name: true, city: true }
        }
      }
    });

    return reply.send({ review });
  } catch (error) {
    console.error('Error updating review:', error);
    return reply.code(500).send({ error: 'Failed to update review' });
  }
};

// Delete a review
const deleteReview = async (request, reply) => {
  try {
    const { id } = request.params;
    const user = request.user;

    if (!user) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id }
    });

    if (!review) {
      return reply.code(404).send({ error: 'Review not found' });
    }

    // Check if user owns the review
    if (review.userId !== user.userId) {
      return reply.code(403).send({ error: 'Not authorized to delete this review' });
    }

    await prisma.review.delete({
      where: { id }
    });

    return reply.send({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return reply.code(500).send({ error: 'Failed to delete review' });
  }
};

// Get user's reviews
const getUserReviews = async (request, reply) => {
  try {
    const { userId } = request.params;
    const { page = 1, limit = 20 } = request.query;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      isPublic: true
    };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          beverage: {
            select: { id: true, name: true, type: true, region: true }
          },
          venue: {
            select: { id: true, name: true, city: true }
          },
          _count: {
            select: { likes: true, comments: true }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.review.count({ where })
    ]);

    return reply.send({
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    return reply.code(500).send({ error: 'Failed to fetch user reviews' });
  }
};

// Like/unlike a review
const toggleReviewLike = async (request, reply) => {
  try {
    const { id } = request.params;
    const user = request.user;

    if (!user) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id }
    });

    if (!review) {
      return reply.code(404).send({ error: 'Review not found' });
    }

    // Check if user already liked this review
    const existingLike = await prisma.like.findFirst({
      where: {
        userId: user.userId,
        reviewId: id
      }
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { id: existingLike.id }
      });
      return reply.send({ liked: false, message: 'Review unliked' });
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId: user.userId,
          reviewId: id
        }
      });
      return reply.send({ liked: true, message: 'Review liked' });
    }
  } catch (error) {
    console.error('Error toggling review like:', error);
    return reply.code(500).send({ error: 'Failed to toggle like' });
  }
};

export default {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  getUserReviews,
  toggleReviewLike
};