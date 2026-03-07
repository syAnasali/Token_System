const express = require('express');
const router = express.Router();
const tokenService = require('../services/tokenService');
const authMiddleware = require('../middleware/auth');

// POST /api/orders - Create a new order
router.post('/', async (req, res) => {
  try {
    const { items, total } = req.body;
    
    // Validate input logic could go here
    if (!items || !total) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const token = await tokenService.generateToken({ items, total });

    // Emit event for real-time updates
    const io = req.app.get('io');
    io.emit('order_created', token);

    res.status(201).json(token);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PATCH /api/orders/:id/status - Update order/token status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['PENDING', 'SERVING', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const updatedToken = await tokenService.updateTokenStatus(id, status);

    const io = req.app.get('io');
    io.emit('status_updated', updatedToken);

    res.json(updatedToken);
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
