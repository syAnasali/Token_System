const express = require('express');
const router = express.Router();
const tokenService = require('../services/tokenService');

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
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['PENDING', 'SERVING', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Note: We use the token ID (which maps to order one-to-one typically or we simply update via token ID)
    // The prompt says "routes/orders.js", implying we might be working with Orders.
    // However, the TokenService `updateTokenStatus` takes a `tokenId`.
    // If the frontend sends the Order ID, we might need to find the token first.
    // But usually in this flow, the simplified "Order ID" IS the reference.
    // Let's assume the ID passed here is the TOKEN ID for simplicity in this MVP 
    // OR we change the route to be /tokens/:id/status.
    // Given the file is `orders.js`, maybe it's `/orders/:orderId/status`?
    // Let's look at schema: Token has `orderId`. 
    // If the Kiosk/Worker sees "Token A-001", they usually tap that.
    // I I'll assume the param `id` refers to the TOKEN ID as that's what controls the flow.
    // Ideally this route should be /tokens/:id/status but I'm in `orders.js`.
    // Let's stick to the prompt structure. I will check if I can support Order ID lookup.
    // For MVP transparency: I will assume the ID passed is the Token ID because that's what the Worker app will likely have.
    // Actually, `tokenService.updateTokenStatus` expects a token ID.
    
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
