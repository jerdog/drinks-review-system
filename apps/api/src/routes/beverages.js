import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all beverages (with pagination and filters)
export const getBeverages = async (request, reply) => {
  try {
    const { page = 1, limit = 20, type, category, search, approved = true } = request.query;
    const skip = (page - 1) * limit;

    const where = {
      isApproved: approved === 'true' || approved === true,
      ...(type && { type }),
      ...(category && { categoryId: category }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { region: { contains: search, mode: 'insensitive' } },
          { varietal: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [beverages, total] = await Promise.all([
      prisma.beverage.findMany({
        where,
        include: {
          category: true,
          _count: {
            select: { reviews: true }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.beverage.count({ where })
    ]);

    return reply.send({
      beverages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching beverages:', error);
    return reply.code(500).send({ error: 'Failed to fetch beverages' });
  }
};

// Get a single beverage by ID
export const getBeverage = async (request, reply) => {
  try {
    const { id } = request.params;

    const beverage = await prisma.beverage.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: {
          include: {
            user: {
              select: { id: true, username: true, displayName: true, avatar: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { reviews: true }
        }
      }
    });

    if (!beverage) {
      return reply.code(404).send({ error: 'Beverage not found' });
    }

    return reply.send({ beverage });
  } catch (error) {
    console.error('Error fetching beverage:', error);
    return reply.code(500).send({ error: 'Failed to fetch beverage' });
  }
};

// Create a new beverage (admin only or user suggestion)
export const createBeverage = async (request, reply) => {
  try {
    const { name, description, type, region, varietal, abv, vintage, categoryId } = request.body;
    const user = request.user;

    if (!user) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    // Check if user is admin or if this is a suggestion
    const isApproved = user.isAdmin;
    const suggestedBy = user.isAdmin ? null : user.id;

    const beverage = await prisma.beverage.create({
      data: {
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description,
        type,
        region,
        varietal,
        abv: abv ? parseFloat(abv) : null,
        vintage: vintage ? parseInt(vintage) : null,
        categoryId,
        isApproved,
        suggestedBy
      },
      include: {
        category: true
      }
    });

    return reply.code(201).send({ beverage });
  } catch (error) {
    console.error('Error creating beverage:', error);
    return reply.code(500).send({ error: 'Failed to create beverage' });
  }
};

// Update a beverage (admin only)
export const updateBeverage = async (request, reply) => {
  try {
    const { id } = request.params;
    const updateData = request.body;
    const user = request.user;

    if (!user || !user.isAdmin) {
      return reply.code(403).send({ error: 'Admin access required' });
    }

    const beverage = await prisma.beverage.update({
      where: { id },
      data: updateData,
      include: {
        category: true
      }
    });

    return reply.send({ beverage });
  } catch (error) {
    console.error('Error updating beverage:', error);
    return reply.code(500).send({ error: 'Failed to update beverage' });
  }
};

// Delete a beverage (admin only)
export const deleteBeverage = async (request, reply) => {
  try {
    const { id } = request.params;
    const user = request.user;

    if (!user || !user.isAdmin) {
      return reply.code(403).send({ error: 'Admin access required' });
    }

    await prisma.beverage.delete({
      where: { id }
    });

    return reply.send({ message: 'Beverage deleted successfully' });
  } catch (error) {
    console.error('Error deleting beverage:', error);
    return reply.code(500).send({ error: 'Failed to delete beverage' });
  }
};

// Get beverage categories
export const getCategories = async (request, reply) => {
  try {
    const categories = await prisma.beverageCategory.findMany({
      include: {
        children: true,
        _count: {
          select: { beverages: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return reply.send({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return reply.code(500).send({ error: 'Failed to fetch categories' });
  }
};

// Search beverages
export const searchBeverages = async (request, reply) => {
  try {
    const { q, type, category, limit = 10 } = request.query;

    if (!q) {
      return reply.code(400).send({ error: 'Search query required' });
    }

    const where = {
      isApproved: true,
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { region: { contains: q, mode: 'insensitive' } },
        { varietal: { contains: q, mode: 'insensitive' } }
      ],
      ...(type && { type }),
      ...(category && { categoryId: category })
    };

    const beverages = await prisma.beverage.findMany({
      where,
      include: {
        category: true,
        _count: {
          select: { reviews: true }
        }
      },
      take: parseInt(limit),
      orderBy: { name: 'asc' }
    });

    return reply.send({ beverages });
  } catch (error) {
    console.error('Error searching beverages:', error);
    return reply.code(500).send({ error: 'Failed to search beverages' });
  }
};