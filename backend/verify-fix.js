const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
    try {
        await prisma.$connect();
        const keys = Object.keys(prisma);
        const hasMenuItem = !!prisma.menuItem;
        const output = JSON.stringify({ keys, hasMenuItem }, null, 2);
        fs.writeFileSync('debug-output.txt', output);
        console.log("Written to debug-output.txt");
    } catch (e) {
        fs.writeFileSync('debug-output.txt', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
