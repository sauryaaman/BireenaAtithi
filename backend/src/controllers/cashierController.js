const supabase = require('../config/db');

// Get dashboard summary with date filter
const getSummary = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        const user_id = req.user?.user_id;
        const timezone = 'Asia/Kolkata';

        // Convert IST dates to UTC for database query
        const startUtc = moment.tz(start_date, timezone)
            .startOf('day')                  // Get start of IST day
            .subtract(5, 'hours')            // Convert to UTC (part 1)
            .subtract(30, 'minutes')         // Convert to UTC (part 2)
            .format();

        const endUtc = moment.tz(end_date, timezone)
            .endOf('day')                    // Get end of IST day
            .subtract(5, 'hours')            // Convert to UTC (part 1)
            .subtract(30, 'minutes')         // Convert to UTC (part 2)
            .format();

        console.log('Getting summary for:', {
            user_id,
            date_range: {
                ist: {
                    start: moment.tz(start_date, timezone).format('YYYY-MM-DD HH:mm:ss'),
                    end: moment.tz(end_date, timezone).format('YYYY-MM-DD HH:mm:ss')
                },
                utc: {
                    start: startUtc,
                    end: endUtc
                }
            }
        });

        // Get bookings summary for date range using UTC timestamps
        const { data: bookings, error: bookingsError } = await supabase
            .from('bookings')
            .select(`
                booking_id,
                total_amount,
                amount_paid,
                amount_due,
                created_at,
                last_payment_date,
                status,
                payment_status,
                booking_rooms!inner (
                    room:rooms!inner (
                        user_id
                    )
                )
            `)
            .eq('booking_rooms.rooms.user_id', user_id)  // Filter by logged-in user
            .gte('created_at', startUtc)
            .lte('created_at', endUtc);

        if (bookingsError) {
            console.error('Bookings query error:', bookingsError);
            throw bookingsError;
        }

        console.log('Found bookings:', bookings.length);

        // Filter out bookings for other users and calculate basic booking totals
        const summary = bookings.reduce((acc, booking) => {
            // Count booking only if not cancelled and belongs to logged-in user
            const isActive = booking.status?.toLowerCase() !== 'cancelled';
            
            return {
                total_bookings: acc.total_bookings + (isActive ? 1 : 0),
                total_amount: acc.total_amount + (isActive ? booking.total_amount : 0),
                total_paid: acc.total_paid + (booking.amount_paid || 0),
                total_due: acc.total_due + (isActive ? (booking.amount_due || 0) : 0)
            };
        }, {
            total_bookings: 0,
            total_amount: 0,
            total_paid: 0,
            total_due: 0
        });

        // Get all payment transactions for the UTC date range
        const { data: transactions, error: transError } = await supabase
            .from('payment_transactions')
            .select(`
                amount_paid,
                payment_mode,
                is_refund,
                created_at,
                user_id,
                bookings (
                    room:rooms(user_id)
                )
            `)
            .eq('user_id', user_id) // Filter by logged in user
            .gte('created_at', startUtc)
            .lte('created_at', endUtc)
            .order('created_at', { ascending: true });

        if (transError) {
            console.error('Transactions query error:', transError);
            throw transError;
        }

        // Log found transactions with IST conversion
        const transactionSummary = transactions.map(t => ({
            utc: t.created_at,
            ist: moment.tz(t.created_at, 'UTC').tz(timezone).format('YYYY-MM-DD HH:mm:ss'),
            amount: t.amount_paid,
            type: t.is_refund ? 'refund' : 'payment'
        }));

        console.log('Found transactions:', {
            count: transactions?.length || 0,
            date_range: {
                start: startUtc,
                end: endUtc
            },
            transactions: transactionSummary
        });

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
            payment_count: 0,  // Count of payment transactions
            refund_count: 0    // Count of refund transactions
        });

        // Calculate payment mode totals from the same transactions data
        const payment_mode_totals = transactions.reduce((acc, trans) => {
            const mode = trans.payment_mode;
            if (!mode) return acc;

            if (trans.is_refund) {
                // Track refunds separately for each payment mode
                acc.refunds = acc.refunds || {};
                acc.refunds[mode] = (acc.refunds[mode] || 0) + (trans.amount_paid || 0);
            } else {
                // Regular payments
                acc.payments = acc.payments || {};
                acc.payments[mode] = (acc.payments[mode] || 0) + (trans.amount_paid || 0);
            }
            return acc;
        }, { payments: {}, refunds: {} });

        // Prepare final response with default values and date information
        const response = {
            // Booking related totals (from bookings table)
            ...summary,
            
            // Collection related totals and counts (from payment_transactions table)
            total_collection,      // Total amount received (excluding refunds)
            total_refunds,        // Total amount refunded
            net_collection: total_collection - total_refunds,  // Net collection after refunds
            transaction_counts: {  // Number of transactions by type
                payments: payment_count,    // Number of payment transactions
                refunds: refund_count,      // Number of refund transactions
                total: payment_count + refund_count  // Total number of transactions
            },
            
            // Payment mode wise breakup (from payment_transactions table)
            payment_mode_totals: {
                // Regular payments by mode
                payments: payment_mode_totals?.payments || {
                    Cash: 0,
                    Card: 0,
                    UPI: 0,
                    'Bank Transfer': 0,
                    Other: 0
                },
                // Refunds by mode
                refunds: payment_mode_totals?.refunds || {
                    Cash: 0,
                    Card: 0,
                    UPI: 0,
                    'Bank Transfer': 0,
                    Other: 0
                }
            },
            has_data: bookings.length > 0 || transactions.length > 0,
            time_period: {
                start_date,
                end_date,
                is_single_day: start_date === end_date
            }
        };

        console.log('Response summary:', response);
        res.json(response);
    } catch (error) {
        console.error('Error in getSummary:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

// Get daily transactions
const getDailyTransactions = async (req, res) => {
    try {
        // Support either a single `date` or a `start_date` + `end_date` range
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

        console.log('Getting transactions for range:', { user_id, start_date, end_date, startUtc, endUtc });

        const { data: transactions, error } = await supabase
            .from('payment_transactions')
            .select(`
                transaction_id,
                booking_id,
                amount_paid,
                payment_mode,
                payment_date,
                is_refund,
                created_at,
                user_id,
                bookings (
                    total_amount,
                    amount_paid,
                    amount_due,
                    refund_amount,
                    refunded_at,
                    status,
                    payment_status,
                    room:rooms(user_id)
                )
            `)
            .eq('user_id', user_id)
            .gte('created_at', startUtc)
            .lte('created_at', endUtc)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Transactions query error:', error);
            throw error;
        }

        console.log('Found transactions:', transactions?.length || 0);

        // Convert UTC timestamps to IST in the response
        const transactionsWithIST = transactions.map(trans => ({
            ...trans,
            created_at_ist: moment.tz(trans.created_at, 'UTC').tz(timezone).format('YYYY-MM-DD HH:mm:ss'),
            created_at: moment.tz(trans.created_at, 'UTC').tz(timezone).format(),  // Convert to IST
            payment_date: trans.payment_date ? moment.tz(trans.payment_date, 'UTC').tz(timezone).format() : null,
            bookings: trans.bookings ? {
                ...trans.bookings,
                refunded_at: trans.bookings.refunded_at ? moment.tz(trans.bookings.refunded_at, 'UTC').tz(timezone).format() : null
            } : null
        }));

        // Return flat list of transactions across the date range (converted to IST)
        res.json(transactionsWithIST);
    } catch (error) {
        console.error('Error in getDailyTransactions:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

// Get payment trends
// const dayjs = require('dayjs');
// const utc = require('dayjs/plugin/utc');
// const timezone = require('dayjs/plugin/timezone');

// // Initialize dayjs plugins
// dayjs.extend(utc);
// dayjs.extend(timezone);

// const getPaymentTrends = async (req, res) => {
//     try {
//         const { start_date, end_date, timezone: userTimezone = 'Asia/Kolkata' } = req.query;
//         const user_id = req.user?.user_id;
        
//         // Convert start and end dates to UTC for querying Supabase
//         const startUtc = dayjs.tz(start_date, userTimezone).startOf('day').utc().format();
//         const endUtc = dayjs.tz(end_date, userTimezone).endOf('day').utc().format();

//         console.log('Getting payment trends for:', {
//             user_id,
//             start_date,
//             end_date,
//             timezone: userTimezone,
//             startUtc,
//             endUtc
//         });

//         const { data: transactions, error } = await supabase
//             .from('payment_transactions')
//             .select('amount_paid, payment_mode, created_at, is_refund')
//             .eq('user_id', user_id)
//             .gte('created_at', startUtc)
//             .lte('created_at', endUtc)
//             .order('created_at', { ascending: true });

//         if (error) {
//             console.error('Payment trends query error:', error);
//             throw error;
//         }

//         // Group by date and payment mode using user's timezone
//         const trends = transactions.reduce((acc, trans) => {
//             // Convert UTC timestamp to user's local date
//             const date = dayjs(trans.created_at).tz(userTimezone).format('YYYY-MM-DD');
            
//             if (!acc[date]) {
//                 acc[date] = {
//                     date,
//                     // Payment totals
//                     total_payments: 0,
//                     total_refunds: 0,
//                     net_collection: 0,
//                     // Transaction counts
//                     payment_count: 0,
//                     refund_count: 0,
//                     // Payment mode wise amounts
//                     payments: {
//                         Cash: 0,
//                         Card: 0,
//                         UPI: 0,
//                         'Bank Transfer': 0,
//                         Other: 0
//                     },
//                     // Refund mode wise amounts
//                     refunds: {
//                         Cash: 0,
//                         Card: 0,
//                         UPI: 0,
//                         'Bank Transfer': 0,
//                         Other: 0
//                     }
//                 };
//             }
            
//             const mode = trans.payment_mode || 'Other';
//             const amount = trans.amount_paid || 0;
            
//             if (trans.is_refund) {
//                 // Handle refund transaction
//                 acc[date].total_refunds += amount;
//                 acc[date].refund_count += 1;
//                 acc[date].refunds[mode] = (acc[date].refunds[mode] || 0) + amount;
//             } else {
//                 // Handle payment transaction
//                 acc[date].total_payments += amount;
//                 acc[date].payment_count += 1;
//                 acc[date].payments[mode] = (acc[date].payments[mode] || 0) + amount;
//             }

//             // Calculate net collection for the day
//             acc[date].net_collection = acc[date].total_payments - acc[date].total_refunds;
//             return acc;
//         }, {});        const trendArray = Object.values(trends);
//         console.log('Generated trends for days:', trendArray.length);

//         res.json(trendArray);
//     } catch (error) {
//         console.error('Error in getPaymentTrends:', error);
//         res.status(500).json({
//             error: 'Internal server error',
//             details: error.message
//         });
//     }
// };


// const dayjs = require('dayjs');
// const utc = require('dayjs/plugin/utc');
// const timezone = require('dayjs/plugin/timezone');

// // Initialize dayjs plugins
// dayjs.extend(utc);
// dayjs.extend(timezone);


// const getPaymentTrends = async (req, res) => {
//     try {
//         const { start_date, end_date, timezone: userTimezone = 'Asia/Kolkata' } = req.query;
//         const user_id = req.user?.user_id;

//         // ✅ Convert user-selected local dates into UTC for query filtering
//         const startUtc = dayjs.tz(start_date, userTimezone).startOf('day');
//         const endUtc = dayjs.tz(end_date, userTimezone).endOf('day');
//         // .utc().format()

//         console.log('Getting payment trends for:', {
//             user_id,
//             start_date,
//             end_date,
//             timezone: userTimezone,
//             startUtc,
//             endUtc
//         });

//         // ✅ Query Supabase for all transactions in the UTC range
//         const { data: transactions, error } = await supabase
//             .from('payment_transactions')
//             .select('amount_paid, payment_mode, created_at, is_refund')
//             .eq('user_id', user_id)
//             .gte('created_at', startUtc)
//             .lte('created_at', endUtc)
//             .order('created_at', { ascending: true });

//         if (error) {
//             console.error('Payment trends query error:', error);
//             throw error;
//         }

//         // ✅ Group transactions by the *user’s local date*
//         const trends = transactions.reduce((acc, trans) => {
//             // Convert UTC created_at → local user date
//             const localDate = dayjs(trans.created_at).tz(userTimezone).format('YYYY-MM-DD');

//             if (!acc[localDate]) {
//                 acc[localDate] = {
//                     date: localDate,
//                     total_payments: 0,
//                     total_refunds: 0,
//                     net_collection: 0,
//                     payment_count: 0,
//                     refund_count: 0,
//                     payments: {
//                         Cash: 0,
//                         Card: 0,
//                         UPI: 0,
//                         'Bank Transfer': 0,
//                         Other: 0
//                     },
//                     refunds: {
//                         Cash: 0,
//                         Card: 0,
//                         UPI: 0,
//                         'Bank Transfer': 0,
//                         Other: 0
//                     }
//                 };
//             }

//             const mode = trans.payment_mode || 'Other';
//             const amount = trans.amount_paid || 0;

//             if (trans.is_refund) {
//                 acc[localDate].total_refunds += amount;
//                 acc[localDate].refund_count += 1;
//                 acc[localDate].refunds[mode] = (acc[localDate].refunds[mode] || 0) + amount;
//             } else {
//                 acc[localDate].total_payments += amount;
//                 acc[localDate].payment_count += 1;
//                 acc[localDate].payments[mode] = (acc[localDate].payments[mode] || 0) + amount;
//             }

//             // ✅ Always recompute net collection after update
//             acc[localDate].net_collection = acc[localDate].total_payments - acc[localDate].total_refunds;
//             return acc;
//         }, {});

//         // ✅ Convert object → sorted array by local date
//         const trendArray = Object.values(trends).sort((a, b) =>
//             dayjs(a.date).unix() - dayjs(b.date).unix()
//         );

//         console.log('Generated trends for days:', trendArray.length);

//         // ✅ Return array
//         res.json(trendArray);
//     } catch (error) {
//         console.error('Error in getPaymentTrends:', error);
//         res.status(500).json({
//             error: 'Internal server error',
//             details: error.message
//         });
//     }
// };



// const dayjs = require('dayjs');
// const utc = require('dayjs/plugin/utc');
// const timezone = require('dayjs/plugin/timezone');
// const isSameOrBefore = require('dayjs/plugin/isSameOrBefore');

// // Initialize plugins
// dayjs.extend(utc);
// dayjs.extend(timezone);
// dayjs.extend(isSameOrBefore);

// const getPaymentTrends = async (req, res) => {
//   try {
//     let { start_date, end_date, timezone: userTimezone } = req.query;
//     const user_id = req.user?.user_id;

//     // Fallback timezone
//     if (!userTimezone) userTimezone = 'Asia/Kolkata';
//     if (userTimezone.toLowerCase() === 'asia/calcutta') userTimezone = 'Asia/Kolkata';

//     // Convert user-selected local dates to UTC range
//     const startUtc = dayjs.tz(start_date, userTimezone).startOf('day').utc().toISOString();
//     const endUtc = dayjs.tz(end_date, userTimezone).endOf('day').utc().toISOString();

//     // Debug logs
//     console.log('Getting payment trends for:', {
//       user_id,
//       start_date,
//       end_date,
//       userTimezone,
//       startUtc,
//       endUtc
//     });

//     // Fetch all transactions in UTC range
//     const { data: transactions, error } = await supabase
//       .from('payment_transactions')
//       .select('amount_paid, payment_mode, created_at, is_refund')
//       .eq('user_id', user_id)
//       .gte('created_at', startUtc)
//       .lte('created_at', endUtc)
//       .order('created_at', { ascending: true });

//     if (error) throw error;

//     // Group transactions by user's local date
//     const trendsMap = transactions.reduce((acc, trans) => {
//       const localDate = dayjs(trans.created_at).tz(userTimezone).format('YYYY-MM-DD');

//       if (!acc[localDate]) {
//         acc[localDate] = {
//           date: localDate,
//           total_payments: 0,
//           total_refunds: 0,
//           net_collection: 0,
//           payment_count: 0,
//           refund_count: 0,
//           payments: { Cash: 0, Card: 0, UPI: 0, 'Bank Transfer': 0, Other: 0 },
//           refunds: { Cash: 0, Card: 0, UPI: 0, 'Bank Transfer': 0, Other: 0 }
//         };
//       }

//       const mode = trans.payment_mode || 'Other';
//       const amount = Number(trans.amount_paid) || 0;

//       if (trans.is_refund) {
//         acc[localDate].total_refunds += amount;
//         acc[localDate].refund_count += 1;
//         acc[localDate].refunds[mode] = (acc[localDate].refunds[mode] || 0) + amount;
//       } else {
//         acc[localDate].total_payments += amount;
//         acc[localDate].payment_count += 1;
//         acc[localDate].payments[mode] = (acc[localDate].payments[mode] || 0) + amount;
//       }

//       // Always recompute net collection
//       acc[localDate].net_collection = acc[localDate].total_payments - acc[localDate].total_refunds;

//       return acc;
//     }, {});

//     // Fill missing dates between start and end
//     const allDates = [];
//     let current = dayjs(start_date);
//     const last = dayjs(end_date);

//     while (current.isSameOrBefore(last, 'day')) {
//       allDates.push(current.format('YYYY-MM-DD'));
//       current = current.add(1, 'day');
//     }

//     const finalTrends = allDates.map(d => trendsMap[d] || {
//       date: d,
//       total_payments: 0,
//       total_refunds: 0,
//       net_collection: 0,
//       payment_count: 0,
//       refund_count: 0,
//       payments: { Cash: 0, Card: 0, UPI: 0, 'Bank Transfer': 0, Other: 0 },
//       refunds: { Cash: 0, Card: 0, UPI: 0, 'Bank Transfer': 0, Other: 0 }
//     });

//     res.json(finalTrends);
//   } catch (err) {
//     console.error('Error in getPaymentTrends:', err);
//     res.status(500).json({
//       error: 'Internal server error',
//       details: err.message
//     });
//   }
// };




const moment = require('moment-timezone');

const getPaymentTrends = async (req, res) => {
  try {
    let { start_date, end_date } = req.query;
    const user_id = req.user?.user_id;
    const timezone = 'Asia/Kolkata';

    // Start from the beginning of the IST day in UTC
    // For Oct 25th IST 00:00:00, we need Oct 24th 18:30:00 UTC
    const startUtc = moment.tz(start_date, timezone)
      .startOf('day')                  // Get start of IST day
      .subtract(5, 'hours')            // Convert to UTC (part 1)
      .subtract(30, 'minutes')         // Convert to UTC (part 2)
      .format();

    // End at the end of the IST day in UTC
    // For Oct 25th IST 23:59:59, we need Oct 25th 18:29:59 UTC
    const endUtc = moment.tz(end_date, timezone)
      .endOf('day')                    // Get end of IST day
      .subtract(5, 'hours')            // Convert to UTC (part 1)
      .subtract(30, 'minutes')         // Convert to UTC (part 2)
      .format();

    console.log('Query parameters:', {
      input_dates: { start_date, end_date },
      ist_range: {
        start: moment.tz(start_date, timezone).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        end: moment.tz(end_date, timezone).endOf('day').format('YYYY-MM-DD HH:mm:ss')
      },
      utc_query_range: {
        start: startUtc,
        end: endUtc,
        start_ist: moment(startUtc).tz(timezone).format('YYYY-MM-DD HH:mm:ss'),
        end_ist: moment(endUtc).tz(timezone).format('YYYY-MM-DD HH:mm:ss')
      }
    });

    // Get transactions in UTC range
    const { data: transactions, error } = await supabase
      .from('payment_transactions')
      .select(`
        amount_paid, 
        payment_mode, 
        created_at, 
        is_refund,
        user_id,
        bookings (
          room:rooms(user_id)
        )
      `)
      .eq('user_id', user_id) // Filter by logged in user only
      .gte('created_at', startUtc)
      .lte('created_at', endUtc)
      .order('created_at', { ascending: true });

    if (error) throw error;

    console.log(`Found ${transactions.length} transactions`);

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
      
      console.log('Processing transaction:', {
        utc_time: trans.created_at,
        ist_time: moment.tz(trans.created_at, 'UTC').tz(timezone).format('YYYY-MM-DD HH:mm:ss'),
        ist_date: istDate,
        amount: trans.amount_paid,
        mode: trans.payment_mode,
        is_refund: trans.is_refund
      });
      
      if (!trendsMap[istDate]) {
        console.log('Warning: Transaction date mismatch:', {
          transaction_date: istDate,
          utc: trans.created_at,
          ist: moment.tz(trans.created_at, 'UTC').tz(timezone).format('YYYY-MM-DD HH:mm:ss'),
          valid_dates: Object.keys(trendsMap)
        });
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

      console.log(`Updated totals for ${istDate}:`, {
        payments: trendsMap[istDate].total_payments,
        refunds: trendsMap[istDate].total_refunds,
        net: trendsMap[istDate].net_collection,
        payment_count: trendsMap[istDate].payment_count,
        refund_count: trendsMap[istDate].refund_count
      });
    });

    // Sort and prepare final results
    const finalTrends = Object.values(trendsMap)
      .sort((a, b) => moment.tz(a.date, timezone).diff(moment.tz(b.date, timezone)));

    console.log('\nFinal summary by date:');
    finalTrends.forEach(day => {
      console.log(`${day.date}:`);
      console.log(`- Payments: ${day.payment_count} transactions totaling ${day.total_payments}`);
      console.log(`- Refunds: ${day.refund_count} transactions totaling ${day.total_refunds}`);
      console.log(`- Net collection: ${day.net_collection}`);
      console.log('- Payment modes:', day.payments);
      console.log('- Refund modes:', day.refunds);
      console.log('');
    });

    res.json(finalTrends);
  } catch (err) {
    console.error('Error in getPaymentTrends:', err);
    res.status(500).json({
      error: 'Internal server error',
      details: err.message
    });
  }
};










module.exports = {
    getSummary,
    getDailyTransactions,
    getPaymentTrends
};