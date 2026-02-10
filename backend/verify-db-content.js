const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.menuItem.count();
    console.log(`Total MenuItems: ${count}`);
    if (count > 0) {
      const items = await prisma.menuItem.findMany();
      console.log('Items:', items);
    } else {
      console.log('No items found in MenuItem table.');
    }
  } catch (e) {
    console.error('Error querying database:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
