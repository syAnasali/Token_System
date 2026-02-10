# SQLite Fallback Strategy

If a PostgreSQL database is not available, you can switch the backend to use SQLite for development.

## Steps

1. **Modify `prisma/schema.prisma`**
   Change the `datasource` block:
   ```prisma
   // prisma/schema.prisma
   datasource db {
     provider = "sqlite"
     url      = "file:./dev.db"
   }
   ```

2. **Update Environment**
   No `.env` change is strictly needed if you hardcode the URL as above, but you can also set `DATABASE_URL="file:./dev.db"` in `.env`.

3. **Initialize Database**
   Run the following commands:
   ```bash
   # Remove the old migrations folder if it exists and conflicts
   rm -rf prisma/migrations

   # Push schema to SQLite
   npx prisma db push

   # Seed the database
   node prisma/seed.js
   ```

## Differences
- **Concurrency**: SQLite does not support the same level of concurrency as PostgreSQL. The `TokenSequence` locking logic in `docs/token_generation.md` works best with Postgres row-level locks, but `prisma.$transaction` will still enforce serial execution in SQLite (which locks the whole DB).
- **Production**: Do NOT use SQLite for the production build if multiple workers are accessing the DB simultaneously under load.
