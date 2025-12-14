const { supabase } = require('../config/supabase');
const moment = require('moment-timezone');

// Record food order payment
const recordFoodPayment = async (req, res) => {
  try {
    const { food_order_id, amount, payment_mode, notes } = req.body;
    const userId = req.user.user_id;

    // console.log('🍽️ Recording food payment:', {
    //   food_order_id,
    //   amount,
    //   payment_mode,
    //   userId
    // });

    // Validate input
    if (!food_order_id || !amount || !payment_mode) {
      return res.status(400).json({
        message: 'Missing required fields: food_order_id, amount, payment_mode'
      });
    }

    if (parseFloat(amount) <= 0) {
      return res.status(400).json({
        message: 'Amount must be greater than 0'
      });
    }

    // Fetch food order details
    const { data: foodOrder, error: orderError } = await supabase
      .from('food_orders')
      .select('*')
      .eq('id', food_order_id)
      .single();

    if (orderError || !foodOrder) {
      console.error('Food order not found:', orderError);
      return res.status(404).json({ message: 'Food order not found' });
    }

    // console.log('📋 Food order found:', {
    //   id: foodOrder.id,
    //   total_amount: foodOrder.total_amount,
    //   amount_paid: foodOrder.amount_paid,
    //   amount_due: foodOrder.amount_due
    // });

    // Calculate new payment amounts
    const newAmountPaid = (foodOrder.amount_paid || 0) + parseFloat(amount);
    const newAmountDue = Math.max(0, foodOrder.total_amount - newAmountPaid);
    
    // Determine payment status
    let paymentStatus = 'unpaid';
    if (newAmountDue === 0) {
      paymentStatus = 'paid';
    } else if (newAmountPaid > 0) {
      paymentStatus = 'partially_paid';
    }

    // console.log('💰 Payment calculation:', {
    //   previousPaid: foodOrder.amount_paid,
    //   newPayment: amount,
    //   newAmountPaid,
    //   newAmountDue,
    //   paymentStatus
    // });

    // Create payment transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('food_payment_transactions')
      .insert([
        {
          food_order_id,
          booking_id: foodOrder.booking_id,
          user_id: userId,
          amount_paid: parseFloat(amount),
          payment_mode,
          is_refund: false,
          transaction_status: 'success',
          notes: notes || null
        }
      ])
      .select()
      .single();

    if (transactionError) {
      console.error('Transaction creation error:', transactionError);
      return res.status(500).json({
        message: 'Failed to create payment transaction',
        error: transactionError.message
      });
    }

    // console.log('✅ Transaction created:', transaction.id);

    // Update food order with new payment amounts and status
    const { data: updatedOrder, error: updateError } = await supabase
      .from('food_orders')
      .update({
        amount_paid: newAmountPaid,
        amount_due: newAmountDue,
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', food_order_id)
      .select()
      .single();

    if (updateError) {
      console.error('Food order update error:', updateError);
      return res.status(500).json({
        message: 'Failed to update food order',
        error: updateError.message
      });
    }

    // console.log('🎉 Food order updated:', {
    //   payment_status: updatedOrder.payment_status,
    //   amount_paid: updatedOrder.amount_paid,
    //   amount_due: updatedOrder.amount_due
    // });

    res.status(200).json({
      message: 'Payment recorded successfully',
      transaction,
      order: updatedOrder
    });
  } catch (err) {
    console.error('Error recording food payment:', err);
    res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
};

// Get payment transactions for a food order
const getFoodOrderTransactions = async (req, res) => {
  try {
    const { food_order_id } = req.params;

    // console.log('📊 Fetching transactions for food order:', food_order_id);

    const { data: transactions, error } = await supabase
      .from('food_payment_transactions')
      .select('*')
      .eq('food_order_id', food_order_id)
      .order('payment_date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      return res.status(500).json({
        message: 'Failed to fetch transactions',
        error: error.message
      });
    }

    res.status(200).json({
      transactions,
      count: transactions.length
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
};

// Get payment transactions for a booking (all food orders in booking)
const getBookingFoodPaymentTransactions = async (req, res) => {
  try {
    const { booking_id } = req.params;

    // console.log('📊 Fetching all food payment transactions for booking:', booking_id);

    const { data: transactions, error } = await supabase
      .from('food_payment_transactions')
      .select('*')
      .eq('booking_id', booking_id)
      .order('payment_date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      return res.status(500).json({
        message: 'Failed to fetch transactions',
        error: error.message
      });
    }

    // Calculate summary
    const totalPayment = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const transactionCount = transactions.length;

    res.status(200).json({
      transactions,
      summary: {
        total_payment: totalPayment,
        transaction_count: transactionCount
      }
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
};

// Get food payment summary/report (similar to cashier report)
const getFoodPaymentSummary = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const user_id = req.user?.user_id;
    const timezone = 'Asia/Kolkata';

    // Convert IST dates to UTC for database query
    const startUtc = moment.tz(start_date, timezone)
      .startOf('day')
      .subtract(5, 'hours')
      .subtract(30, 'minutes')
      .format();

    const endUtc = moment.tz(end_date, timezone)
      .endOf('day')
      .subtract(5, 'hours')
      .subtract(30, 'minutes')
      .format();

    // console.log('Getting food payment summary for:', {
    //   user_id,
    //   date_range: {
    //     ist: {
    //       start: moment.tz(start_date, timezone).format('YYYY-MM-DD HH:mm:ss'),
    //       end: moment.tz(end_date, timezone).format('YYYY-MM-DD HH:mm:ss')
    //     },
    //     utc: {
    //       start: startUtc,
    //       end: endUtc
    //     }
    //   }
    // });

    // Get food orders summary for date range using UTC timestamps
    const { data: foodOrders, error: ordersError } = await supabase
      .from('food_orders')
      .select(`
        id,
        total_amount,
        amount_paid,
        amount_due,
        created_at,
        payment_status,
        user_id
      `)
      .eq('user_id', user_id)
      .gte('created_at', startUtc)
      .lte('created_at', endUtc);

    if (ordersError) {
      console.error('Food orders query error:', ordersError);
      throw ordersError;
    }

    // console.log('Found food orders:', foodOrders.length);

    // Calculate basic food order totals
    const summary = foodOrders.reduce((acc, order) => {
      return {
        total_orders: acc.total_orders + 1,
        total_amount: acc.total_amount + (order.total_amount || 0),
        total_paid: acc.total_paid + (order.amount_paid || 0),
        total_due: acc.total_due + (order.amount_due || 0)
      };
    }, {
      total_orders: 0,
      total_amount: 0,
      total_paid: 0,
      total_due: 0
    });

    // Get all food payment transactions for the UTC date range
    const { data: transactions, error: transError } = await supabase
      .from('food_payment_transactions')
      .select(`
        amount_paid,
        payment_mode,
        is_refund,
        created_at,
        user_id
      `)
      .eq('user_id', user_id)
      .gte('created_at', startUtc)
      .lte('created_at', endUtc)
      .order('created_at', { ascending: true });

    if (transError) {
      console.error('Food payment transactions query error:', transError);
      throw transError;
    }

    // console.log('Found food payment transactions:', {
    //   count: transactions?.length || 0,
    //   date_range: {
    //     start: startUtc,
    //     end: endUtc
    //   }
    // });

    // Calculate collections, refunds and their counts from payment transactions
    const { total_collection, total_refunds, payment_count, refund_count } = transactions.reduce((acc, trans) => {
      if (trans.is_refund) {
        acc.total_refunds += (trans.amount_paid || 0);
        acc.refund_count += 1;
      } else {
        acc.total_collection += (trans.amount_paid || 0);
        acc.payment_count += 1;
      }
      return acc;
    }, {
      total_collection: 0,
      total_refunds: 0,
      payment_count: 0,
      refund_count: 0
    });

    // Calculate payment mode totals from the same transactions data
    const payment_mode_totals = transactions.reduce((acc, trans) => {
      const mode = trans.payment_mode;
      if (!mode) return acc;

      if (trans.is_refund) {
        acc.refunds = acc.refunds || {};
        acc.refunds[mode] = (acc.refunds[mode] || 0) + (trans.amount_paid || 0);
      } else {
        acc.payments = acc.payments || {};
        acc.payments[mode] = (acc.payments[mode] || 0) + (trans.amount_paid || 0);
      }
      return acc;
    }, { payments: {}, refunds: {} });

    // Prepare final response
    const response = {
      // Food order related totals
      ...summary,

      // Collection related totals and counts
      total_collection,
      total_refunds,
      net_collection: total_collection - total_refunds,
      transaction_counts: {
        payments: payment_count,
        refunds: refund_count,
        total: payment_count + refund_count
      },

      // Payment mode wise breakup
      payment_mode_totals: {
        payments: payment_mode_totals?.payments || {
          Cash: 0,
          Card: 0,
          UPI: 0,
          'Bank Transfer': 0,
          Other: 0
        },
        refunds: payment_mode_totals?.refunds || {
          Cash: 0,
          Card: 0,
          UPI: 0,
          'Bank Transfer': 0,
          Other: 0
        }
      },
      has_data: foodOrders.length > 0 || transactions.length > 0,
      time_period: {
        start_date,
        end_date,
        is_single_day: start_date === end_date
      }
    };

    // console.log('Food payment summary response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error in getFoodPaymentSummary:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
};

// Get food payment trends (similar to cashier report trends)
const getFoodPaymentTrends = async (req, res) => {
  try {
    let { start_date, end_date } = req.query;
    const user_id = req.user?.user_id;
    const timezone = 'Asia/Kolkata';

    // Convert IST dates to UTC for database query
    const startUtc = moment.tz(start_date, timezone)
      .startOf('day')
      .subtract(5, 'hours')
      .subtract(30, 'minutes')
      .format();

    const endUtc = moment.tz(end_date, timezone)
      .endOf('day')
      .subtract(5, 'hours')
      .subtract(30, 'minutes')
      .format();

    // console.log('Query parameters:', {
    //   input_dates: { start_date, end_date },
    //   ist_range: {
    //     start: moment.tz(start_date, timezone).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
    //     end: moment.tz(end_date, timezone).endOf('day').format('YYYY-MM-DD HH:mm:ss')
    //   },
    //   utc_query_range: {
    //     start: startUtc,
    //     end: endUtc,
    //     start_ist: moment(startUtc).tz(timezone).format('YYYY-MM-DD HH:mm:ss'),
    //     end_ist: moment(endUtc).tz(timezone).format('YYYY-MM-DD HH:mm:ss')
    //   }
    // });

    // Get food payment transactions in UTC range
    const { data: transactions, error } = await supabase
      .from('food_payment_transactions')
      .select(`
        amount_paid,
        payment_mode,
        created_at,
        is_refund,
        user_id
      `)
      .eq('user_id', user_id)
      .gte('created_at', startUtc)
      .lte('created_at', endUtc)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // console.log(`Found ${transactions.length} food payment transactions`);

    // Initialize map for each day in range
    const trendsMap = {};
    let currentDate = moment.tz(start_date, timezone).startOf('day');
    const endDateObj = moment.tz(end_date, timezone).startOf('day');

    while (currentDate.isSameOrBefore(endDateObj, 'day')) {
      const dateStr = currentDate.format('YYYY-MM-DD');
      trendsMap[dateStr] = {
        date: dateStr,
        total_payments: 0,
        total_refunds: 0,
        net_collection: 0,
        payment_count: 0,
        refund_count: 0,
        payments: { Cash: 0, Card: 0, UPI: 0, 'Bank Transfer': 0, Other: 0 },
        refunds: { Cash: 0, Card: 0, UPI: 0, 'Bank Transfer': 0, Other: 0 }
      };
      currentDate.add(1, 'day');
    }

    // Process transactions
    transactions.forEach(trans => {
      // Convert UTC timestamp to IST date
      const istDate = moment.tz(trans.created_at, 'UTC').tz(timezone).format('YYYY-MM-DD');

      // console.log('Processing food transaction:', {
      //   utc_time: trans.created_at,
      //   ist_time: moment.tz(trans.created_at, 'UTC').tz(timezone).format('YYYY-MM-DD HH:mm:ss'),
      //   ist_date: istDate,
      //   amount: trans.amount_paid,
      //   mode: trans.payment_mode,
      //   is_refund: trans.is_refund
      // });

      if (!trendsMap[istDate]) {
        // console.log('Warning: Transaction date mismatch:', {
        //   transaction_date: istDate,
        //   utc: trans.created_at,
        //   ist: moment.tz(trans.created_at, 'UTC').tz(timezone).format('YYYY-MM-DD HH:mm:ss'),
        //   valid_dates: Object.keys(trendsMap)
        // });
        return;
      }

      const mode = trans.payment_mode || 'Other';
      const amount = Number(trans.amount_paid) || 0;

      if (trans.is_refund) {
        trendsMap[istDate].total_refunds += amount;
        trendsMap[istDate].refund_count += 1;
        trendsMap[istDate].refunds[mode] = (trendsMap[istDate].refunds[mode] || 0) + amount;
      } else {
        trendsMap[istDate].total_payments += amount;
        trendsMap[istDate].payment_count += 1;
        trendsMap[istDate].payments[mode] = (trendsMap[istDate].payments[mode] || 0) + amount;
      }

      trendsMap[istDate].net_collection =
        trendsMap[istDate].total_payments - trendsMap[istDate].total_refunds;

      // console.log(`Updated totals for ${istDate}:`, {
      //   payments: trendsMap[istDate].total_payments,
      //   refunds: trendsMap[istDate].total_refunds,
      //   net: trendsMap[istDate].net_collection,
      //   payment_count: trendsMap[istDate].payment_count,
      //   refund_count: trendsMap[istDate].refund_count
      // });
    });

    // Sort and prepare final results
    const finalTrends = Object.values(trendsMap)
      .sort((a, b) => moment.tz(a.date, timezone).diff(moment.tz(b.date, timezone)));

    console.log('\nFinal food payment summary by date:');
    finalTrends.forEach(day => {
      // console.log(`${day.date}:`);
      // console.log(`- Payments: ${day.payment_count} transactions totaling ${day.total_payments}`);
      // console.log(`- Refunds: ${day.refund_count} transactions totaling ${day.total_refunds}`);
      // console.log(`- Net collection: ${day.net_collection}`);
      // console.log('- Payment modes:', day.payments);
      // console.log('- Refund modes:', day.refunds);
      // console.log('');
    });

    res.json(finalTrends);
  } catch (err) {
    console.error('Error in getFoodPaymentTrends:', err);
    res.status(500).json({
      error: 'Internal server error',
      details: err.message
    });
  }
};

// Get daily food payment transactions (similar to cashier report transactions)
const getFoodPaymentTransactions = async (req, res) => {
  try {
    let { date, start_date, end_date } = req.query;
    const user_id = req.user?.user_id;
    const timezone = 'Asia/Kolkata';

    // If only `date` provided, use it for both start and end
    if (!start_date && !end_date && date) {
      start_date = date;
      end_date = date;
    }

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'Provide either date or start_date and end_date' });
    }

    // Convert IST start_date/end_date to UTC range for querying
    const startUtc = moment.tz(start_date, timezone)
      .startOf('day')
      .subtract(5, 'hours')
      .subtract(30, 'minutes')
      .format();

    const endUtc = moment.tz(end_date, timezone)
      .endOf('day')
      .subtract(5, 'hours')
      .subtract(30, 'minutes')
      .format();

    // console.log('Getting food payment transactions for range:', { 
    //   user_id, 
    //   start_date, 
    //   end_date, 
    //   startUtc, 
    //   endUtc 
    // });

    const { data: transactions, error } = await supabase
      .from('food_payment_transactions')
      .select(`
        id,
        food_order_id,
        booking_id,
        amount_paid,
        payment_mode,
        is_refund,
        created_at,
        updated_at,
        user_id,
        notes,
        transaction_status
      `)
      .eq('user_id', user_id)
      .gte('created_at', startUtc)
      .lte('created_at', endUtc)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Food payment transactions query error:', error);
      throw error;
    }

    // console.log('Found food payment transactions:', transactions?.length || 0);

    // Convert UTC timestamps to IST in the response
    const transactionsWithIST = transactions.map(trans => ({
      ...trans,
      created_at_ist: moment.tz(trans.created_at, 'UTC').tz(timezone).format('YYYY-MM-DD HH:mm:ss'),
      created_at: moment.tz(trans.created_at, 'UTC').tz(timezone).format(),
      updated_at: trans.updated_at ? moment.tz(trans.updated_at, 'UTC').tz(timezone).format() : null
    }));

    res.json(transactionsWithIST);
  } catch (error) {
    console.error('Error in getFoodPaymentTransactions:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
};

module.exports = {
  recordFoodPayment,
  getFoodOrderTransactions,
  getBookingFoodPaymentTransactions,
  getFoodPaymentSummary,
  getFoodPaymentTrends,
  getFoodPaymentTransactions
};
