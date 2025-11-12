const supabase = require('../config/db');

const getBookingDetails = async (req, res) =>{
    try {
        
        const { booking_id } = req.params;
        const user_id = req.user.user_id;

        console.log('Fetching booking details for:', {
            booking_id,
            user_id,
            params: req.params
        });

        // Get booking details including customer and primary guest
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .select(`
                *,
                customers:cust_id (*),
                booking_rooms!inner (
                    room_id,
                    price_per_night,
                    rooms:room_id (
                        *
                    )
                ),
                booking_guests (
                    *
                )
            `)
            .eq('booking_id', booking_id)
            .single();

        // console.log('Supabase query result:', {
        //     booking: booking ? 'exists' : 'null',
        //     error: bookingError ? bookingError : 'none'
        // });

        if (bookingError) {
            // console.error('Error fetching booking details:', bookingError);
            // console.log('Booking error:', bookingError);
            return res.status(500).json({ 
                error: 'Failed to fetch booking details',
                details: bookingError 
            });
        }

        if (!booking) {
            // console.log('Booking not found for ID:', booking_id);
            return res.status(404).json({ 
                error: 'Booking not found',
                bookingId: booking_id
            });
        }

       
        

        // Process guests information
        const primaryGuest = booking.booking_guests.find(g => g.is_primary) || {};
        const additionalGuests = booking.booking_guests.filter(g => !g.is_primary) || [];

        const Data = {
            // Invoice details
            booking_id: booking.booking_id,
            created_at: booking.created_at,
            
            
           
            
            // Booking details
            booking: {
                check_in_date: booking.checkin_date,
                check_out_date: booking.checkout_date,
                checkin_time: booking.checkin_time,
                checkout_time: booking.checkout_time,
                total_nights: booking.nights,
                total_amount: booking.total_amount,
                amount_paid:booking.amount_paid,
                amount_due:booking.amount_due,
                refund_amount:booking.refund_amount,
                payment_status: booking.payment_status,
                status: booking.status,
                nightly_rates: booking.nightly_rates,
                
                rooms: booking.booking_rooms.map(br => ({
                    room_id:br.rooms.room_id,
                    room_number: br.rooms.room_number,
                    room_type: br.rooms.room_type,
                    price_per_night: br.price_per_night || br.rooms.price_per_night,
                    status: br.rooms.status
                     
                }))
            },
            
            // Customer & Guest details
            customer: {
                name: booking.customers.name,
                phone: booking.customers.phone,
                email: booking.customers.email,
                address: {
                    address_line1: booking.customers.address_line1,
                    address_line2: booking.customers.address_line2,
                    city: booking.customers.city,
                    state: booking.customers.state,
                    country: booking.customers.country,
                    pin: booking.customers.pin
                },
                gst_number: booking.customers.gst_number,
                meal_plan: booking.customers.meal_plan
            },
            guests: {
                primary: primaryGuest,
                additional: additionalGuests
            }
        };

        res.json(Data);
        console.log(Data);
    } catch (error) {
        // console.error('Error fetching invoice details:', error);
        res.status(500).json({ error: 'Failed to fetch invoice details' });
    }
}
module.exports = {
    getBookingDetails,
}; 