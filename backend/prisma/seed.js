const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // 1. Clear existing generic data to ensure idempotency
  //    Note: In production, we might be more careful, but for MVP/Dev, this is fine.
  //    We won't delete Orders/Tokens here to avoid wiping operation history during dev restarts unless intended.
  await prisma.menuItem.deleteMany({});
  await prisma.tokenSequence.deleteMany({});

  // 2. Seed Menu Items
  const menuItems = [
    { name: 'Burger', price: 10.0, category: 'Food' },
    { name: 'Fries', price: 5.0, category: 'Food' },
    { name: 'Soda', price: 2.0, category: 'Drink' },
    { name: 'Ice Cream', price: 4.0, category: 'Dessert' },
  ];

  for (const item of menuItems) {
    const createdItem = await prisma.menuItem.create({
      data: item,
    });
    console.log(`Created menu item: ${createdItem.name}`);
  }

  // 3. Seed TokenSequence for "Today"
  //    We use a simple date string format YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  
  const tokenSequence = await prisma.tokenSequence.create({
    data: {
      date: today,
      currentSequence: 0
    }
  });
  console.log(`Initialized TokenSequence for ${today}: ${tokenSequence.currentSequence}`);

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
