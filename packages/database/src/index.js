// Database client instance
import { PrismaClient } from '@prisma/client'

const prisma = globalThis.__prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}

export { prisma }
export { PrismaClient } from '@prisma/client'