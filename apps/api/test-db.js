const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
    }
  }
});

async function setupTestDatabase() {
  try {
    console.log('Setting up test database...');

    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Create test categories
    const wineCategory = await prisma.beverageCategory.upsert({
      where: { slug: 'wine' },
      update: {},
      create: {
        name: 'Wine',
        slug: 'wine',
        description: 'Wine category for testing'
      }
    });

    const cocktailCategory = await prisma.beverageCategory.upsert({
      where: { slug: 'cocktail' },
      update: {},
      create: {
        name: 'Cocktail',
        slug: 'cocktail',
        description: 'Cocktail category for testing'
      }
    });

    const spiritCategory = await prisma.beverageCategory.upsert({
      where: { slug: 'spirit' },
      update: {},
      create: {
        name: 'Spirit',
        slug: 'spirit',
        description: 'Spirit category for testing'
      }
    });

    console.log('✅ Test categories created');

    // Create test beverages
    const testBeverages = [
      {
        name: 'Test Wine',
        slug: 'test-wine',
        type: 'wine',
        description: 'A test wine for testing',
        region: 'Test Region',
        varietal: 'Test Varietal',
        abv: 12.5,
        isApproved: true,
        categoryId: wineCategory.id
      },
      {
        name: 'Test Cocktail',
        slug: 'test-cocktail',
        type: 'cocktail',
        description: 'A test cocktail for testing',
        abv: 15.0,
        isApproved: true,
        categoryId: cocktailCategory.id
      },
      {
        name: 'Test Spirit',
        slug: 'test-spirit',
        type: 'spirit',
        description: 'A test spirit for testing',
        abv: 40.0,
        isApproved: true,
        categoryId: spiritCategory.id
      }
    ];

    for (const beverageData of testBeverages) {
      await prisma.beverage.upsert({
        where: { slug: beverageData.slug },
        update: {},
        create: beverageData
      });
    }

    console.log('✅ Test beverages created');

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
    console.log('✅ Test database setup complete');
  } catch (error) {
    console.error('❌ Test database setup failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

setupTestDatabase();