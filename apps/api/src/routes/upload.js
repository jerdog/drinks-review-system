import { PrismaClient } from 'database';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';

const prisma = new PrismaClient();

/**
 * File upload routes
 */
export default async function uploadRoutes(fastify, options) {
  // Register multipart support
  await fastify.register(import('@fastify/multipart'), {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
      files: 5 // Max 5 files per request
    }
  });

  // Upload single image for review
  fastify.post('/image', {
    preHandler: fastify.authenticateToken
  }, async (request, reply) => {
    try {
      const data = await request.file();

      if (!data) {
        return reply.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(data.mimetype)) {
        return reply.status(400).json({
          success: false,
          message: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.'
        });
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024;
      if (data.file.bytesRead > maxSize) {
        return reply.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 5MB.'
        });
      }

      // Generate unique filename
      const fileId = uuidv4();
      const extension = path.extname(data.filename);
      const filename = `${fileId}${extension}`;

      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });

      // Process and save image
      const buffer = await data.toBuffer();
      const processedBuffer = await sharp(buffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();

      const filePath = path.join(uploadDir, filename);
      await fs.writeFile(filePath, processedBuffer);

      // Save to database
      const photo = await prisma.photo.create({
        data: {
          url: `/uploads/${filename}`,
          altText: data.fields?.altText?.value || '',
          userId: request.user.id,
          reviewId: data.fields?.reviewId?.value || null,
          beverageId: data.fields?.beverageId?.value || null
        }
      });

      return {
        success: true,
        message: 'Image uploaded successfully',
        data: {
          id: photo.id,
          url: photo.url,
          altText: photo.altText
        }
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).json({
        success: false,
        message: 'Upload failed'
      });
    }
  });

  // Upload multiple images for review
  fastify.post('/images', {
    preHandler: fastify.authenticateToken
  }, async (request, reply) => {
    try {
      const files = request.files();
      const uploadedPhotos = [];

      for await (const file of files) {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
          continue; // Skip invalid files
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024;
        if (file.file.bytesRead > maxSize) {
          continue; // Skip oversized files
        }

        // Generate unique filename
        const fileId = uuidv4();
        const extension = path.extname(file.filename);
        const filename = `${fileId}${extension}`;

        // Create uploads directory if it doesn't exist
        const uploadDir = path.join(process.cwd(), 'uploads');
        await fs.mkdir(uploadDir, { recursive: true });

        // Process and save image
        const buffer = await file.toBuffer();
        const processedBuffer = await sharp(buffer)
          .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer();

        const filePath = path.join(uploadDir, filename);
        await fs.writeFile(filePath, processedBuffer);

        // Save to database
        const photo = await prisma.photo.create({
          data: {
            url: `/uploads/${filename}`,
            altText: file.fields?.altText?.value || '',
            userId: request.user.id,
            reviewId: file.fields?.reviewId?.value || null,
            beverageId: file.fields?.beverageId?.value || null
          }
        });

        uploadedPhotos.push({
          id: photo.id,
          url: photo.url,
          altText: photo.altText
        });
      }

      return {
        success: true,
        message: `${uploadedPhotos.length} images uploaded successfully`,
        data: uploadedPhotos
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).json({
        success: false,
        message: 'Upload failed'
      });
    }
  });

  // Get photos for a review
  fastify.get('/photos/review/:reviewId', async (request, reply) => {
    try {
      const { reviewId } = request.params;

      const photos = await prisma.photo.findMany({
        where: {
          reviewId: reviewId
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
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      return {
        success: true,
        data: photos
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).json({
        success: false,
        message: 'Failed to fetch photos'
      });
    }
  });

  // Delete photo
  fastify.delete('/photos/:photoId', {
    preHandler: fastify.authenticateToken
  }, async (request, reply) => {
    try {
      const { photoId } = request.params;

      // Check if photo exists and user owns it
      const photo = await prisma.photo.findUnique({
        where: { id: photoId },
        include: { user: true }
      });

      if (!photo) {
        return reply.status(404).json({
          success: false,
          message: 'Photo not found'
        });
      }

      if (photo.userId !== request.user.id) {
        return reply.status(403).json({
          success: false,
          message: 'Not authorized to delete this photo'
        });
      }

      // Delete file from filesystem
      const filePath = path.join(process.cwd(), photo.url);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        // File might not exist, continue with database deletion
        fastify.log.warn(`File not found: ${filePath}`);
      }

      // Delete from database
      await prisma.photo.delete({
        where: { id: photoId }
      });

      return {
        success: true,
        message: 'Photo deleted successfully'
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).json({
        success: false,
        message: 'Failed to delete photo'
      });
    }
  });

  // Serve uploaded files
  fastify.get('/uploads/*', async (request, reply) => {
    const filePath = path.join(process.cwd(), request.url);

    try {
      const stat = await fs.stat(filePath);
      if (!stat.isFile()) {
        return reply.status(404).send('File not found');
      }

      return reply.sendFile(request.url.replace('/uploads/', ''));
    } catch (error) {
      return reply.status(404).send('File not found');
    }
  });
}