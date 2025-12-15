const supabase = require('../config/db');

// CREATE - New order with items
const createOrder = async (req, res) => {
  try {
    const { booking_id, items } = req.body; // items = [{menu_item_id, quantity}, ...]
    // Payment recording is handled separately via payment transaction API
    let userId = req.user.user_id || req.user.id;
    
    // console.log('=== createOrder called ===');
    // console.log('booking_id:', booking_id, 'items:', items);
    // console.log('userId:', userId);

    if (!booking_id || !items || items.length === 0) {
      return res.status(400).json({ error: 'Booking ID and items are required' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const bookingId = parseInt(booking_id, 10);
    const userIdInt = typeof userId === 'string' && /^\d+$/.test(userId) ? parseInt(userId, 10) : userId;

    // Verify booking exists and status is "checkin"
    // console.log('Verifying booking status...');
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('booking_id, status')
      .eq('booking_id', bookingId)
      .single();

    if (bookingError || !booking) {
      console.error('Booking not found:', bookingError);
      return res.status(404).json({ error: 'Booking not found' });
    }

    // console.log('Booking status:', booking.status);
    
    // Check if booking status is a checked-in status (handle multiple formats)
    const validStatuses = ['checkin', 'checked-in', 'checked in'];
    const isCheckedIn = validStatuses.includes(booking.status?.toLowerCase());
    
    if (!isCheckedIn) {
      console.warn(`⚠️  Cannot create food order - booking status is: ${booking.status}`);
      return res.status(400).json({ 
        error: `Food orders only available for checked-in bookings. Current status: ${booking.status}` 
      });
    }

    // Create order - Set amount_paid to 0 initially
    // Payment will be recorded separately via payment transaction API
    // console.log('Creating new order for booking:', bookingId);
    const { data: newOrder, error: createError } = await supabase
      .from('food_orders')
      .insert([
        {
          booking_id: bookingId,
          user_id: userIdInt,
          status: 'pending',
          total_amount: 0,
          amount_paid: 0,
          amount_due: 0
        }
      ])
      .select();

    if (createError || !newOrder || newOrder.length === 0) {
      console.error('❌ Error creating order:', createError);
      return res.status(500).json({ error: 'Failed to create order', details: createError?.message });
    }

    const orderId = newOrder[0].id;
    // console.log('✅ Order created:', orderId);

    // Add items to order
    let totalAmount = 0;
    const itemsToInsert = [];

    for (const item of items) {
      const { menu_item_id, quantity } = item;

      if (!menu_item_id || !quantity || quantity <= 0) {
        continue;
      }

      // Get menu item price
      const { data: menuItem, error: menuError } = await supabase
        .from('menu_items')
        .select('id, name, price')
        .eq('id', menu_item_id)
        .single();

      if (menuError || !menuItem) {
        console.warn('Menu item not found:', menu_item_id);
        continue;
      }

      const price = menuItem.price;
      const itemTotal = price * quantity;
      totalAmount += itemTotal;

      itemsToInsert.push({
        order_id: orderId,
        menu_item_id,
        quantity,
        price
      });

      // console.log('📝 Item:', menuItem.name, 'Qty:', quantity, 'Price:', price, 'Total:', itemTotal);
    }

    if (itemsToInsert.length === 0) {
      return res.status(400).json({ error: 'No valid items provided' });
    }

    // Insert all items
    const { data: orderItems, error: insertError } = await supabase
      .from('food_order_items')
      .insert(itemsToInsert)
      .select();

    if (insertError) {
      console.error('❌ Error inserting items:', insertError);
      return res.status(500).json({ error: 'Failed to add items', details: insertError.message });
    }

    // Update order total - amount_due equals total initially
    // Payment will be recorded separately via payment transaction API which will update amount_paid
    await supabase
      .from('food_orders')
      .update({ 
        total_amount: totalAmount,
        amount_due: totalAmount
      })
      .eq('id', orderId);

    // console.log('💰 Order total set:', { orderId, total_amount: totalAmount, amount_paid: 0, amount_due: totalAmount });
    
    // console.log('\n' + '='.repeat(70));
    // console.log('✅ NEW ORDER CREATED SUCCESSFULLY');
    // console.log('='.repeat(70));
    // console.log('Order ID:', orderId);
    // console.log('Booking ID:', bookingId);
    // console.log('Total Amount: ₹' + totalAmount.toFixed(2));
    // console.log('Amount Paid: ₹' + (amount_paid || 0).toFixed(2));
    // console.log('Amount Due: ₹' + finalAmountDue.toFixed(2));
    // console.log('Total Items:', orderItems?.length || 0);
    
    orderItems?.forEach((item, idx) => {
      // console.log(`  ${idx + 1}. Item ID: ${item.id} | Menu Item: ${item.menu_item_id} | Qty: ${item.quantity} | Price: ₹${item.price}`);
    });
    
    // console.log('='.repeat(70) + '\n');

    res.json({ 
      order: { ...newOrder[0], total_amount: totalAmount, amount_paid: 0, amount_due: totalAmount }, 
      items: orderItems, 
      total_amount: totalAmount,
      amount_paid: 0,
      amount_due: totalAmount
    });
  } catch (err) {
    console.error('❌ Error in createOrder:', err);
    res.status(500).json({ error: 'Failed to create order', details: err.message });
  }
};

// UPDATE - Modify existing order (add/update/remove items)
const updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { items } = req.body; // items = [{menu_item_id, quantity, itemId?}, ...] 
    // itemId exists for existing items, null for new items, quantity 0 = delete
    // Payment updates should be done separately via payment API

    // console.log('=== updateOrder called ===');
    // console.log('orderId:', orderId, 'items to update:', items);

    if (!orderId || !items || items.length === 0) {
      return res.status(400).json({ error: 'Order ID and items are required' });
    }

    // Verify order exists
    const { data: order, error: orderError } = await supabase
      .from('food_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Order not found:', orderError);
      return res.status(404).json({ error: 'Order not found' });
    }

    // console.log('✅ Order found:', orderId);

    // Verify booking status is "checkin"
    // console.log('Verifying booking status for booking_id:', order.booking_id);
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('booking_id, status')
      .eq('booking_id', order.booking_id)
      .single();

    if (bookingError || !booking) {
      console.error('Booking not found:', bookingError);
      return res.status(404).json({ error: 'Booking not found' });
    }

    // console.log('Booking status:', booking.status);
    
    // Check if booking status is a checked-in status (handle multiple formats)
    const validStatuses = ['checkin', 'checked-in', 'checked in'];
    const isCheckedIn = validStatuses.includes(booking.status?.toLowerCase());
    
    if (!isCheckedIn) {
      console.warn(`⚠️  Cannot update food order - booking status is: ${booking.status}`);
      return res.status(400).json({ 
        error: `Food orders can only be updated for checked-in bookings. Current status: ${booking.status}` 
      });
    }

    // Process items
    let totalAmount = 0;
    const itemsToInsert = [];
    const itemsToDelete = [];
    const itemsToUpdate = [];

    // console.log('🔍 Processing items:');
    for (const item of items) {
      const { menu_item_id, quantity, itemId } = item;

      // console.log(`  Item: menu_item_id=${menu_item_id}, quantity=${quantity}, itemId=${itemId}`);

      if (!menu_item_id) continue;

      // Check for deletion: quantity is 0 AND itemId exists (means existing DB item to delete)
      if (quantity === 0 && itemId) {
        // console.log(`  ❌ DELETE: Marking item ${itemId} for deletion`);
        itemsToDelete.push(itemId);
        continue;
      }

      // Skip items with quantity <= 0 (except deletion case handled above)
      if (quantity <= 0) {
        // console.log(`  ⏭️  SKIP: Invalid quantity ${quantity}`);
        continue;
      }

      // Get menu item price
      const { data: menuItem, error: menuError } = await supabase
        .from('menu_items')
        .select('id, name, price')
        .eq('id', menu_item_id)
        .single();

      if (menuError || !menuItem) {
        console.warn(`  ⚠️  SKIP: Menu item ${menu_item_id} not found`);
        continue;
      }

      const price = menuItem.price;
      const itemTotal = price * quantity;
      totalAmount += itemTotal;

      if (itemId) {
        // UPDATE existing item
        // console.log(`  ✏️  UPDATE: item ${itemId}, qty=${quantity}, price=${price}, total=${itemTotal}`);
        itemsToUpdate.push({ itemId, quantity, price });
      } else {
        // ADD new item (no itemId means it's a new item being added to order)
        // console.log(`  ➕ INSERT: menu_item_id=${menu_item_id}, qty=${quantity}, price=${price}, total=${itemTotal}`);
        itemsToInsert.push({
          order_id: orderId,
          menu_item_id,
          quantity,
          price
        });
      }
    }

    // console.log(`📊 Summary: ${itemsToUpdate.length} updates, ${itemsToInsert.length} inserts, ${itemsToDelete.length} deletes`);

    // UPDATE existing items
    for (const item of itemsToUpdate) {
      // console.log(`🔄 UPDATING item ${item.itemId}: qty=${item.quantity}, price=${item.price}`);
      const { error: updateError } = await supabase
        .from('food_order_items')
        .update({ quantity: item.quantity, price: item.price })
        .eq('id', item.itemId)
        .eq('order_id', orderId);
      
      if (updateError) {
        console.error(`❌ Error updating item ${item.itemId}:`, updateError);
      } else {
        // console.log(`✅ Item ${item.itemId} updated successfully`);
      }
    }
    if (itemsToUpdate.length > 0) {
      // console.log(`✅ TOTAL: ${itemsToUpdate.length} items updated`);
    }

    // Delete items marked for deletion
    if (itemsToDelete.length > 0) {
      // console.log(`\n🗑️  DELETING ${itemsToDelete.length} items:`, itemsToDelete);
      for (const itemId of itemsToDelete) {
        // console.log(`  ❌ Deleting item ID: ${itemId}`);
      }
      
      const { error: deleteError } = await supabase
        .from('food_order_items')
        .delete()
        .in('id', itemsToDelete)
        .eq('order_id', orderId);
      
      if (deleteError) {
        console.error(`❌ Error deleting items:`, deleteError);
      } else {
        // console.log(`✅ TOTAL: ${itemsToDelete.length} items deleted successfully\n`);
      }
    }

    // Insert new items
    if (itemsToInsert.length > 0) {
      // console.log(`\n➕ INSERTING ${itemsToInsert.length} new items:`);
      itemsToInsert.forEach(item => {
        // console.log(`  ➕ Adding: menu_item_id=${item.menu_item_id}, qty=${item.quantity}, price=${item.price}`);
      });
      
      const { data: insertedItems, error: insertError } = await supabase
        .from('food_order_items')
        .insert(itemsToInsert)
        .select();
      
      if (insertError) {
        console.error(`❌ Error inserting items:`, insertError);
      } else {
        // console.log(`✅ TOTAL: ${itemsToInsert.length} new items inserted successfully`);
        insertedItems?.forEach(item => {
          // console.log(`  ✅ Inserted with ID: ${item.id}`);
        });
      }
    }

    // Update order total and recalculate amount_due based on existing payments
    // Preserve the existing amount_paid as payments are tracked separately
    const currentAmountPaid = order.amount_paid || 0;
    const finalAmountDue = Math.max(0, totalAmount - currentAmountPaid);
    await supabase
      .from('food_orders')
      .update({ 
        total_amount: totalAmount,
        amount_due: finalAmountDue
      })
      .eq('id', orderId);

    // console.log('💰 Order total updated:', { orderId, total_amount: totalAmount, amount_paid: currentAmountPaid, amount_due: finalAmountDue });

    // Get updated order with items
    const { data: updatedItems } = await supabase
      .from('food_order_items')
      .select('*')
      .eq('order_id', orderId);

    // console.log('\n' + '='.repeat(70));
    // console.log('📊 FINAL ORDER STATE AFTER UPDATE:');
    // console.log('='.repeat(70));
    // console.log('Order ID:', orderId);
    // console.log('Total Amount: ₹' + totalAmount.toFixed(2));
    // console.log('Amount Paid: ₹' + (amount_paid || 0).toFixed(2));
    // console.log('Amount Due: ₹' + finalAmountDue.toFixed(2));
    // console.log('Total Items in Order:', updatedItems?.length || 0);
    
    updatedItems?.forEach((item, idx) => {
      console.log(`  ${idx + 1}. Item ID: ${item.id} | Menu Item: ${item.menu_item_id} | Qty: ${item.quantity} | Price: ₹${item.price}`);
    });
    
    // console.log('='.repeat(70) + '\n');

    res.json({ 
      message: 'Order updated', 
      order: { ...order, total_amount: totalAmount, amount_paid: currentAmountPaid, amount_due: finalAmountDue }, 
      items: updatedItems 
    });
  } catch (err) {
    console.error('❌ Error in updateOrder:', err);
    res.status(500).json({ error: 'Failed to update order', details: err.message });
  }
};

// GET - Order details for modal display (when clicking Order Food button)
const getOrderDetails = async (req, res) => {
  try {
    const { booking_id } = req.params;

    // console.log('=== getOrderDetails called ===');
    // console.log('booking_id:', booking_id);

    if (!booking_id) {
      return res.status(400).json({ error: 'Booking ID is required' });
    }

    const bookingId = parseInt(booking_id, 10);

    // Check if order exists for this booking
    const { data: order, error: orderError } = await supabase
      .from('food_orders')
      .select('*')
      .eq('booking_id', bookingId);

    if (orderError) {
      console.error('❌ Error fetching order:', orderError);
      return res.status(500).json({ error: 'Failed to fetch order', details: orderError.message });
    }

    if (!order || order.length === 0) {
      // console.log('ℹ️ No order found for booking:', bookingId);
      return res.json({ exists: false, order: null, items: [] });
    }

    const orderId = order[0].id;
    // console.log('✅ Order found:', orderId);

    // Get order items
    const { data: items, error: itemsError } = await supabase
      .from('food_order_items')
      .select('*')
      .eq('order_id', orderId);

    if (itemsError) {
      console.error('❌ Error fetching items:', itemsError);
      return res.status(500).json({ error: 'Failed to fetch items' });
    }

    // console.log('📦 Order has', items?.length || 0, 'items');
    res.json({ exists: true, order: order[0], items: items || [] });
  } catch (err) {
    console.error('❌ Error in getOrderDetails:', err);
    res.status(500).json({ error: 'Failed to get order details', details: err.message });
  }
};

// DELETE - Cancel entire order
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    // console.log('=== cancelOrder called ===');
    // console.log('Cancelling order:', orderId);

    // Delete all items first
    const { error: deleteItemsError } = await supabase
      .from('food_order_items')
      .delete()
      .eq('order_id', orderId);

    if (deleteItemsError) {
      console.error('❌ Error deleting order items:', deleteItemsError);
    }

    // Update order status to cancelled
    const { data: cancelledOrder, error: updateError } = await supabase
      .from('food_orders')
      .update({ status: 'cancelled', total_amount: 0 })
      .eq('id', orderId)
      .select();

    if (updateError || !cancelledOrder || cancelledOrder.length === 0) {
      console.error('❌ Error updating order:', updateError);
      return res.status(500).json({ error: 'Failed to cancel order' });
    }

    // console.log('✅ Order cancelled:', cancelledOrder[0].id);
    res.json({ message: 'Order cancelled', order: cancelledOrder[0] });
  } catch (err) {
    console.error('❌ Error in cancelOrder:', err);
    res.status(500).json({ error: 'Failed to cancel order', details: err.message });
  }
};

// Check if order exists for a booking (without creating)
const checkOrderExists = async (req, res) => {
  try {
    const { booking_id } = req.params;
    
    // console.log('=== checkOrderExists called ===');
    // console.log('booking_id:', booking_id);

    if (!booking_id) {
      return res.status(400).json({ error: 'Booking ID is required' });
    }

    const bookingId = parseInt(booking_id, 10);

    // Check if order exists for this booking
    const { data: existingOrders, error: checkError } = await supabase
      .from('food_orders')
      .select('*')
      .eq('booking_id', bookingId);

    if (checkError) {
      console.error('❌ Error checking order:', checkError);
      return res.status(500).json({ error: 'Failed to check order', details: checkError.message });
    }

    if (existingOrders && existingOrders.length > 0) {
      // console.log('✅ Order exists:', existingOrders[0].id);
      return res.json({ exists: true, order: existingOrders[0] });
    }

    // console.log('ℹ️ No existing order for booking:', bookingId);
    res.json({ exists: false, order: null });
  } catch (err) {
    console.error('❌ Error in checkOrderExists:', err);
    res.status(500).json({ error: 'Failed to check order', details: err.message });
  }
};

module.exports = {
  createOrder,
  updateOrder,
  getOrderDetails,
  cancelOrder,
  checkOrderExists
};
