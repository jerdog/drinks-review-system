import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('Testing database connection...');

    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Count beverages
    const beverageCount = await prisma.beverage.count();
    console.log(`📊 Total beverages in database: ${beverageCount}`);

    // Get all beverages
    const beverages = await prisma.beverage.findMany({
      include: {
        category: true
      }
    });

    console.log('🍷 Beverages found:');
    beverages.forEach(beverage => {
      console.log(`  - ${beverage.name} (${beverage.type}) - Approved: ${beverage.isApproved}`);
    });

    // Count categories
    const categoryCount = await prisma.beverageCategory.count();
    console.log(`📂 Total categories in database: ${categoryCount}`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Database test failed:', error);
    await prisma.$disconnect();
  }
}

testDatabase();