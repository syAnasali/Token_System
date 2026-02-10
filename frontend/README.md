# TokenFlow Frontend

React + Vite frontend for the TokenFlow MVP.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Configuration

- Backend URL is set to `http://localhost:3000` in `src/socket.js` and `src/api.js`.
- Port: Default is 5173.

## Pages

- **/**: Customer View. Create orders and track token status.
- **/worker**: Worker Dashboard. View active tokens and update status (PENDING -> SERVING -> COMPLETED).
- **/display**: Public Token Display. Shows "Now Serving" and "Upcoming" queue.

## Tech Stack

- React
- Vite
- Tailwind CSS
- Socket.IO Client
