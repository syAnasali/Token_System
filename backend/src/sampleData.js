const prisma = require('./db');

async function seed() {
  const count = await prisma.order.count();
  if (count > 0) return;

  console.log('Seeding sample data...');

  const items = JSON.stringify([{ name: 'Burger', price: 10, quantity: 1 }, { name: 'Fries', price: 5, quantity: 1 }]);

  // Seed Menu Items
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

  // Create a few completed orders
  await prisma.order.create({
    data: {
        items,
        total: 15.0,
        status: 'COMPLETED',
        Token: {
            create: {
                number: 'T-001',
                status: 'COMPLETED'
            }
        }
    }
  });

   // Create a few pending orders
   await prisma.order.create({
    data: {
        items,
        total: 15.0,
        status: 'PENDING',
        Token: {
            create: {
                number: 'T-002',
                status: 'PENDING'
            }
        }
    }
  });

  console.log('Seeding complete.');
}

module.exports = seed;
