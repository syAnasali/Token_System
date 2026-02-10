const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Connect...");
    await prisma.$connect();
    console.log("Prisma Client Keys:", Object.keys(prisma));
    
    // Check specific variations
    console.log("prisma.menuItem:", !!prisma.menuItem);
    console.log("prisma.MenuItem:", !!prisma.MenuItem);
    console.log("prisma.menuitem:", !!prisma.menuitem);
    
    // Log internal dmmf if possible to see what models it thinks it has
    if (prisma._dmmf) {
        console.log("Models in DMMF:", prisma._dmmf.datamodel.models.map(m => m.name));
    }
    
    await prisma.$disconnect();
}

main().catch(console.error);
