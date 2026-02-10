const prisma = require('../db');

/**
 * Service to handle token generation and status updates.
 */
const tokenService = {
  /**
   * Generates a new token for an order.
   * Format: T-{ID} where ID is padded to 3 digits.
   * @param {Object} orderData - The order data to create.
   * @returns {Promise<Object>} The created token with order details.
   */
  async generateToken(orderData) {
    return await prisma.$transaction(async (tx) => {
      // 1. Create the Order
      const order = await tx.order.create({
        data: {
          items: JSON.stringify(orderData.items), // Expecting JSON structure
          total: orderData.total,
          status: 'PENDING',
        },
      });

      // 2. Generate Token Number (Simple auto-increment based or generic format)
      // Since ID is auto-increment, we can use it.
      const tokenNumber = `T-${String(order.id).padStart(3, '0')}`;

      // 3. Create the Token
      const token = await tx.token.create({
        data: {
          number: tokenNumber,
          status: 'PENDING',
          orderId: order.id,
        },
        include: {
          order: true,
        },
      });

      return token;
    });
  },

  /**
   * Updates the status of a token.
   * @param {number} tokenId 
   * @param {string} status - 'PENDING', 'SERVING', 'COMPLETED', 'CANCELLED'
   * @returns {Promise<Object>} Updated token.
   */
  async updateTokenStatus(tokenId, status) {
    const token = await prisma.token.update({
      where: { id: parseInt(tokenId) },
      data: { status },
      include: { order: true },
    });
    
    // Also update Order status if needed (optional based on strict requirements, but good for consistency)
    if (status === 'COMPLETED' || status === 'CANCELLED') {
        await prisma.order.update({
            where: { id: token.orderId },
            data: { status },
        });
    }

    return token;
  },

  /**
   * Gets the next token in the queue.
   * Logic: The oldest 'PENDING' token.
   * @returns {Promise<Object|null>}
   */
  async getNextToken() {
    return await prisma.token.findFirst({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      include: { order: true },
    });
  },

  /**
   * GetAllTokens for display
   */
  async getQueue() {
    return await prisma.token.findMany({
        where: {
            status: {
                in: ['PENDING', 'SERVING']
            }
        },
        orderBy: { createdAt: 'asc' },
        include: { order: true }
    });
  }
};

module.exports = tokenService;
