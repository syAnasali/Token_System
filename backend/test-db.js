const { PrismaClient } = require('@prisma/client');

console.log("Loading .env implicitly via Prisma...");
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  try {
    console.log("Testing connection...");
    // Force a query
    const items = await prisma.menuItem.findMany();
    console.log("Success! Found " + items.length + " items.");
    items.forEach(i => console.log(`- ${i.name} ($${i.price})`));
  } catch (error) {
    console.error("DB Error Found:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
