const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding menu items...');

  const menuItems = [
    { name: 'Classic Burger', price: 9.99, category: 'Main', available: true },
    { name: 'Cheese Burger', price: 10.99, category: 'Main', available: true },
    { name: 'Chicken Sandwich', price: 8.99, category: 'Main', available: true },
    { name: 'French Fries', price: 3.99, category: 'Side', available: true },
    { name: 'Onion Rings', price: 4.49, category: 'Side', available: true },
    { name: 'Soda', price: 1.99, category: 'Drink', available: true },
    { name: 'Milkshake', price: 4.99, category: 'Drink', available: true },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.create({
      data: item,
    });
  }

  console.log(`Seeded ${menuItems.length} menu items.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
