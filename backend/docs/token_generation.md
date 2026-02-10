# Token Generation & Migration Strategy

## Token Generation Logic

To ensure unique, sequential token numbers (e.g., A-001, A-002) without race conditions, we use an atomic database transaction approach with Prisma.

### The Algorithm

1. **Start Transaction**: Wrap the following steps in `prisma.$transaction`.
2. **Fetch and Increment Sequence**:
   - Find the `TokenSequence` record for the current date (`YYYY-MM-DD`).
   - If it doesn't exist, create it with `currentSequence = 1`.
   - If it exists, update it by incrementing `currentSequence` by 1.
   - **Critical**: This update operation locks the row (in PostgreSQL), preventing other requests from reading the old sequence number until this transaction commits.
3. **Format Token**:
   - Pad the sequence number (e.g., 1 -> "001").
   - Prefix with a specific identifier if needed (e.g., "A-").
   - Result: "A-001".
4. **Create Order & Token**:
   - Create the `Order` record.
   - Create the `Token` record linked to the order, using the formatted token number.
5. **Commit**: The transaction commits, releasing the lock on `TokenSequence`.

### Race Condition Prevention

By performing the increment update *within* the transaction, we utilize the database's distinct row locking mechanisms.
- **PostgreSQL**: The `UPDATE` locks the row. Concurrent transactions attempting to update the same `TokenSequence` row will wait.

```javascript
const result = await prisma.$transaction(async (tx) => {
  const date = new Date().toISOString().split('T')[0];

  // Atomic increment (upsert-like logic)
  let seq = await tx.tokenSequence.findUnique({ where: { date } });
  
  if (!seq) {
    seq = await tx.tokenSequence.create({
      data: { date, currentSequence: 1 }
    });
  } else {
    seq = await tx.tokenSequence.update({
      where: { date },
      data: { currentSequence: { increment: 1 } }
    });
  }

  const tokenNumber = \`A-\${String(seq.currentSequence).padStart(3, '0')}\`;

  // Create Order + Token
  const order = await tx.order.create({
    data: {
      total: orderData.total,
      items: orderData.items,
      Token: {
        create: {
          number: tokenNumber,
          status: 'PENDING'
        }
      }
    },
    include: { Token: true }
  });

  return order;
});
```

## Migration Strategy

### Dev Environment (SQLite/Postgres)
For the MVP stage, we rely on `prisma db push` for rapid iteration. This synchronizes the schema without creating formal migration history files.

### Production (Postgres)
1. **Initial Setup**: `prisma migrate dev --name init` to create the baseline migration.
2. **Changes**:
   - Modify `schema.prisma`.
   - Run `prisma migrate dev --name <descriptive-name>`.
   - This generates SQL migration files to be applied safely in production.

### Backup & Fallback
- **SQLite Fallback**: If PostgreSQL is unavailable, we can switch the provider in `schema.prisma` to `sqlite` and valid `DATABASE_URL` to a file path.
- **Data Preservation**: Regular `pg_dump` backups should be scheduled if data persistence is critical (though for a daily queue system, historical data is less critical than real-time state).
