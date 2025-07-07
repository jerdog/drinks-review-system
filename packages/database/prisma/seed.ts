import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create beverage categories
  const wineCategory = await prisma.beverageCategory.upsert({
    where: { slug: 'wine' },
    update: {},
    create: {
      name: 'Wine',
      slug: 'wine',
      description: 'Alcoholic beverages made from fermented grapes or other fruits'
    }
  })

  const cocktailCategory = await prisma.beverageCategory.upsert({
    where: { slug: 'cocktails' },
    update: {},
    create: {
      name: 'Cocktails',
      slug: 'cocktails',
      description: 'Mixed drinks made with spirits and other ingredients'
    }
  })

  const liquorCategory = await prisma.beverageCategory.upsert({
    where: { slug: 'liquor' },
    update: {},
    create: {
      name: 'Liquor',
      slug: 'liquor',
      description: 'Distilled alcoholic beverages'
    }
  })

  // Create wine subcategories
  const redWineCategory = await prisma.beverageCategory.upsert({
    where: { slug: 'red-wine' },
    update: {},
    create: {
      name: 'Red Wine',
      slug: 'red-wine',
      description: 'Wines made from red grape varieties',
      parentId: wineCategory.id
    }
  })

  const whiteWineCategory = await prisma.beverageCategory.upsert({
    where: { slug: 'white-wine' },
    update: {},
    create: {
      name: 'White Wine',
      slug: 'white-wine',
      description: 'Wines made from white grape varieties',
      parentId: wineCategory.id
    }
  })

  const sparklingWineCategory = await prisma.beverageCategory.upsert({
    where: { slug: 'sparkling-wine' },
    update: {},
    create: {
      name: 'Sparkling Wine',
      slug: 'sparkling-wine',
      description: 'Wines with significant levels of carbon dioxide',
      parentId: wineCategory.id
    }
  })

  // Create cocktail subcategories
  const classicCocktailsCategory = await prisma.beverageCategory.upsert({
    where: { slug: 'classic-cocktails' },
    update: {},
    create: {
      name: 'Classic Cocktails',
      slug: 'classic-cocktails',
      description: 'Traditional and time-tested cocktail recipes',
      parentId: cocktailCategory.id
    }
  })

  const modernCocktailsCategory = await prisma.beverageCategory.upsert({
    where: { slug: 'modern-cocktails' },
    update: {},
    create: {
      name: 'Modern Cocktails',
      slug: 'modern-cocktails',
      description: 'Contemporary and innovative cocktail creations',
      parentId: cocktailCategory.id
    }
  })

  // Create liquor subcategories
  const whiskeyCategory = await prisma.beverageCategory.upsert({
    where: { slug: 'whiskey' },
    update: {},
    create: {
      name: 'Whiskey',
      slug: 'whiskey',
      description: 'Distilled grain spirits aged in wooden casks',
      parentId: liquorCategory.id
    }
  })

  const vodkaCategory = await prisma.beverageCategory.upsert({
    where: { slug: 'vodka' },
    update: {},
    create: {
      name: 'Vodka',
      slug: 'vodka',
      description: 'Clear distilled spirit typically made from grains or potatoes',
      parentId: liquorCategory.id
    }
  })

  const ginCategory = await prisma.beverageCategory.upsert({
    where: { slug: 'gin' },
    update: {},
    create: {
      name: 'Gin',
      slug: 'gin',
      description: 'Distilled spirit flavored with juniper berries and other botanicals',
      parentId: liquorCategory.id
    }
  })

  const rumCategory = await prisma.beverageCategory.upsert({
    where: { slug: 'rum' },
    update: {},
    create: {
      name: 'Rum',
      slug: 'rum',
      description: 'Distilled spirit made from sugarcane byproducts',
      parentId: liquorCategory.id
    }
  })

  const tequilaCategory = await prisma.beverageCategory.upsert({
    where: { slug: 'tequila' },
    update: {},
    create: {
      name: 'Tequila',
      slug: 'tequila',
      description: 'Distilled spirit made from blue agave',
      parentId: liquorCategory.id
    }
  })

  // Create sample beverages
  const sampleBeverages = [
    // Wines
    {
      name: 'Château Margaux 2015',
      slug: 'chateau-margaux-2015',
      description: 'Premium Bordeaux red wine from the Margaux appellation',
      type: 'wine',
      region: 'Bordeaux, France',
      varietal: 'Cabernet Sauvignon',
      abv: 13.5,
      vintage: 2015,
      isApproved: true,
      categoryId: redWineCategory.id
    },
    {
      name: 'Dom Pérignon 2012',
      slug: 'dom-perignon-2012',
      description: 'Prestigious Champagne from Moët & Chandon',
      type: 'wine',
      region: 'Champagne, France',
      varietal: 'Chardonnay',
      abv: 12.5,
      vintage: 2012,
      isApproved: true,
      categoryId: sparklingWineCategory.id
    },
    {
      name: 'Sancerre Blanc 2022',
      slug: 'sancerre-blanc-2022',
      description: 'Crisp white wine from the Loire Valley',
      type: 'wine',
      region: 'Loire Valley, France',
      varietal: 'Sauvignon Blanc',
      abv: 12.5,
      vintage: 2022,
      isApproved: true,
      categoryId: whiteWineCategory.id
    },
    // Cocktails
    {
      name: 'Classic Martini',
      slug: 'classic-martini',
      description: 'Gin and dry vermouth cocktail, stirred with ice',
      type: 'cocktail',
      abv: 30.0,
      isApproved: true,
      categoryId: classicCocktailsCategory.id
    },
    {
      name: 'Negroni',
      slug: 'negroni',
      description: 'Equal parts gin, vermouth rosso, and Campari',
      type: 'cocktail',
      abv: 24.0,
      isApproved: true,
      categoryId: classicCocktailsCategory.id
    },
    {
      name: 'Old Fashioned',
      slug: 'old-fashioned',
      description: 'Whiskey, sugar, bitters, and water',
      type: 'cocktail',
      abv: 35.0,
      isApproved: true,
      categoryId: classicCocktailsCategory.id
    },
    // Liquors
    {
      name: 'Macallan 18 Year',
      slug: 'macallan-18-year',
      description: 'Single malt Scotch whisky aged 18 years',
      type: 'liquor',
      region: 'Speyside, Scotland',
      abv: 43.0,
      isApproved: true,
      categoryId: whiskeyCategory.id
    },
    {
      name: 'Grey Goose Vodka',
      slug: 'grey-goose-vodka',
      description: 'Premium French vodka made from wheat',
      type: 'liquor',
      region: 'France',
      abv: 40.0,
      isApproved: true,
      categoryId: vodkaCategory.id
    },
    {
      name: 'Bombay Sapphire Gin',
      slug: 'bombay-sapphire-gin',
      description: 'Premium London dry gin with 10 botanicals',
      type: 'liquor',
      region: 'England',
      abv: 47.0,
      isApproved: true,
      categoryId: ginCategory.id
    }
  ]

  for (const beverage of sampleBeverages) {
    await prisma.beverage.upsert({
      where: { slug: beverage.slug },
      update: {},
      create: beverage
    })
  }

  // Create sample badges
  const badges = [
    {
      name: 'First Review',
      slug: 'first-review',
      description: 'Posted your first review',
      icon: '🍷',
      color: '#4CAF50'
    },
    {
      name: 'Wine Connoisseur',
      slug: 'wine-connoisseur',
      description: 'Reviewed 50 different wines',
      icon: '🍇',
      color: '#9C27B0'
    },
    {
      name: 'Cocktail Explorer',
      slug: 'cocktail-explorer',
      description: 'Reviewed 25 different cocktails',
      icon: '🍸',
      color: '#FF9800'
    },
    {
      name: 'Social Butterfly',
      slug: 'social-butterfly',
      description: 'Gained 100 followers',
      icon: '🦋',
      color: '#E91E63'
    },
    {
      name: 'Check-in Master',
      slug: 'checkin-master',
      description: 'Checked in at 50 different venues',
      icon: '📍',
      color: '#2196F3'
    }
  ]

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { slug: badge.slug },
      update: {},
      create: badge
    })
  }

  // Create sample achievements
  const achievements = [
    {
      name: 'Review Master',
      slug: 'review-master',
      description: 'Complete 100 reviews',
      icon: '🏆',
      points: 100,
      criteria: { type: 'review_count', count: 100 }
    },
    {
      name: 'Diversity Drinker',
      slug: 'diversity-drinker',
      description: 'Review beverages from 10 different categories',
      icon: '🌈',
      points: 50,
      criteria: { type: 'category_diversity', count: 10 }
    },
    {
      name: 'Photographer',
      slug: 'photographer',
      description: 'Upload 25 photos with reviews',
      icon: '📸',
      points: 25,
      criteria: { type: 'photo_count', count: 25 }
    }
  ]

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { slug: achievement.slug },
      update: {},
      create: achievement
    })
  }

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })