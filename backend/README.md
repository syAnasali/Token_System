# TokenFlow Backend (MVP)

Node.js Backend for the TokenFlow Queue Management System.

## Stack
- Node.js
- Express
- Prisma (PostgreSQL)
- Socket.IO

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env` and update `DATABASE_URL`.
   ```bash
   cp .env.example .env
   ```

3. **Database Setup**
   Ensure PostgreSQL is running.
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run Server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Orders
- `POST /api/orders`
  - Body: `{ items: [], total: number }`
  - Returns: `{ id, number, status, ... }`
- `PATCH /api/orders/:id/status`
  - Body: `{ status: "PENDING" | "SERVING" | "COMPLETED" }`

### Display
- `GET /api/display/queue`
  - Returns list of active tokens.

## Events (Socket.IO)
- `order_created`: Emitted when a new token is generated.
- `status_updated`: Emitted when a token's status changes.
