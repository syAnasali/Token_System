const express = require('express');
const router = express.Router();
const tokenService = require('../services/tokenService');

// GET /api/display/queue - Get the current queue
router.get('/queue', async (req, res) => {
  try {
    const queue = await tokenService.getQueue();
    res.json(queue);
  } catch (error) {
    console.error('Error fetching queue:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
