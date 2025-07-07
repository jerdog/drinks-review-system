import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import multipart from '@fastify/multipart'
import jwt from '@fastify/jwt'
import oauth2 from '@fastify/oauth2'
import { config } from 'dotenv'
import { prisma } from 'database'

// Load environment variables
config()

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    prettyPrint: process.env.NODE_ENV !== 'production'
  }
})

// Register plugins
async function registerPlugins() {
  // CORS
  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true
  })

  // Security headers
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    }
  })

  // Rate limiting
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute'
  })

  // Multipart for file uploads
  await fastify.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
      files: 5
    }
  })

  // JWT
  await fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'your-secret-key'
  })

  // OAuth2
  await fastify.register(oauth2, {
    name: 'googleOAuth2',
    scope: ['profile', 'email'],
    credentials: {
      client: {
        id: process.env.GOOGLE_CLIENT_ID || '',
        secret: process.env.GOOGLE_CLIENT_SECRET || ''
      },
      auth: {
        authorizeHost: 'https://accounts.google.com',
        authorizePath: '/o/oauth2/v2/auth',
        tokenHost: 'https://www.googleapis.com',
        tokenPath: '/oauth2/v4/token'
      }
    },
    startRedirectPath: '/auth/google',
    callbackUri: `${process.env.API_URL || 'http://localhost:3001'}/auth/google/callback`
  })

  await fastify.register(oauth2, {
    name: 'githubOAuth2',
    scope: ['user:email'],
    credentials: {
      client: {
        id: process.env.GITHUB_CLIENT_ID || '',
        secret: process.env.GITHUB_CLIENT_SECRET || ''
      },
      auth: {
        authorizeHost: 'https://github.com',
        authorizePath: '/login/oauth/authorize',
        tokenHost: 'https://github.com',
        tokenPath: '/login/oauth/access_token'
      }
    },
    startRedirectPath: '/auth/github',
    callbackUri: `${process.env.API_URL || 'http://localhost:3001'}/auth/github/callback`
  })
}

// Register routes
async function registerRoutes() {
  // Health check
  fastify.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })

  // Auth routes
  await fastify.register(import('./routes/auth'), { prefix: '/auth' })

  // User routes
  await fastify.register(import('./routes/users'), { prefix: '/users' })

  // Beverage routes
  await fastify.register(import('./routes/beverages'), { prefix: '/beverages' })

  // Review routes
  await fastify.register(import('./routes/reviews'), { prefix: '/reviews' })

  // Venue routes
  await fastify.register(import('./routes/venues'), { prefix: '/venues' })

  // Social routes
  await fastify.register(import('./routes/social'), { prefix: '/social' })

  // Search routes
  await fastify.register(import('./routes/search'), { prefix: '/search' })

  // Admin routes
  await fastify.register(import('./routes/admin'), { prefix: '/admin' })

  // File upload routes
  await fastify.register(import('./routes/upload'), { prefix: '/upload' })
}

// Error handling
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error)

  if (error.validation) {
    return reply.status(400).send({
      success: false,
      error: 'Validation Error',
      message: error.message
    })
  }

  return reply.status(500).send({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message
  })
})

// Graceful shutdown
async function gracefulShutdown() {
  fastify.log.info('Shutting down gracefully...')
  await fastify.close()
  await prisma.$disconnect()
  process.exit(0)
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

// Start server
async function start() {
  try {
    await registerPlugins()
    await registerRoutes()

    const port = parseInt(process.env.PORT || '3001')
    const host = process.env.HOST || '0.0.0.0'

    await fastify.listen({ port, host })
    fastify.log.info(`🚀 Server listening on ${host}:${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()