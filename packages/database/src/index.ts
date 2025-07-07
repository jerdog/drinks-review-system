export { PrismaClient } from '@prisma/client'
export type * from '@prisma/client'

// Re-export commonly used types
export type {
  User,
  OAuthAccount,
  Session,
  Follows,
  BeverageCategory,
  Beverage,
  Venue,
  Review,
  CheckIn,
  Comment,
  Like,
  Photo,
  Badge,
  UserBadge,
  Achievement,
  UserAchievement,
  Notification,
  AuditLog,
} from '@prisma/client'

// Database client instance
import { PrismaClient } from '@prisma/client'

declare global {
  var __prisma: PrismaClient | undefined
}

export const prisma = globalThis.__prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}