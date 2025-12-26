const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createOrder,
  updateOrder,
  getOrderDetails,
  cancelOrder,
  checkOrderExists,
  printKOT,
  getKOTHistory
} = require('../controllers/foodOrderController');

// Check if order exists (for button display)
router.get('/check/:booking_id', auth, checkOrderExists);

// Get order details for modal (when clicking Order Food button)
router.get('/booking/:booking_id/details', auth, getOrderDetails);

// Get KOT history for a booking
router.get('/history/:booking_id', auth, getKOTHistory);

// Create new order with items
router.post('/create', auth, createOrder);

// Print KOT (create KOT snapshot in history)
router.post('/:orderId/print-kot', auth, printKOT);

// Update existing order (add/remove/modify items)
router.put('/:orderId', auth, updateOrder);

// Update order status
router.patch('/:orderId/status', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const { supabase } = require('../config/supabase');

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['pending', 'preparing', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const { data, error } = await supabase
      .from('food_orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    res.json({ 
      success: true,
      order: data,
      message: `Order status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Cancel order
router.delete('/:orderId', auth, cancelOrder);

module.exports = router;
