const express = require('express');
const router = express.Router();
const tokenService = require('../services/tokenService');

// GET /api/display/queue - Get the current queue
router.get('/queue', async (req, res) => {
  try {
    const queue = await tokenService.getQueue();
    // Parse items JSON for each order
    const parsedQueue = queue.map(token => {
      if (token.order) {
        if (typeof token.order.items === 'string') {
          try {
            token.order.items = JSON.parse(token.order.items);
          } catch (e) {
            console.error(`Failed to parse items for token ${token.id}`, e);
            token.order.items = [];
          }
        }
      }
      return token;
    });
    res.json(parsedQueue);
  } catch (error) {
    console.error('Error fetching queue:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
