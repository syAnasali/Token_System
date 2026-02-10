const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const orderRoutes = require('./routes/orders');
const displayRoutes = require('./routes/display');
const seed = require('./sampleData');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for MVP
    methods: ['GET', 'POST', 'PATCH']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Make io available in routes
app.set('io', io);

// Routes
app.use('/api/orders', orderRoutes);
app.use('/api/display', displayRoutes);

// Database client
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Menu Route
app.get('/menu-items', async (req, res) => {
  try {
    const items = await prisma.menuItem.findMany({
      where: { available: true }
    });
    res.json(items);
  } catch (error) {
    console.error('Failed to fetch menu:', error);
    res.status(500).json({ error: 'Failed to fetch menu', details: error.message });
  }
});



// Socket.IO Connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    
    // Optional: Seed data on start if DB matches
    try {
        await seed();
    } catch (e) {
        console.log("Seeding skipped or failed (likely DB not ready):", e.message);
    }
});
