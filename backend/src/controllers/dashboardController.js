

const supabase = require('../config/db');

const getDashboardStats = async (req, res) => {
    try {
        const user_id = req.user.user_id;

        // Get total rooms count
        const { data: rooms, error: roomsError } = await supabase
            .from('rooms')
            .select('room_id, status, room_number')
            .eq('user_id', user_id);

        if (roomsError) throw roomsError;

        // Get current bookings with rooms - Filter by user_id
        // First get all room_ids belonging to this user
        const userRoomIds = rooms.map(r => r.room_id);

        // Then get bookings that have rooms belonging to this user
        const { data: bookingRooms, error: bookingRoomsError } = await supabase
            .from('booking_rooms')
            .select('booking_id, room_id')
            .in('room_id', userRoomIds);

        if (bookingRoomsError) throw bookingRoomsError;

        // Get unique booking IDs
        const userBookingIds = [...new Set(bookingRooms.map(br => br.booking_id))];

        // console.log('User Room IDs:', userRoomIds);
        // console.log('User Booking IDs:', userBookingIds);

        // Now fetch those bookings
        const { data: currentBookings, error: bookingsError } = await supabase
            .from('bookings')
            .select(`
                booking_id,
                status,
                checkin_date,
                checkout_date
            `)
            .in('booking_id', userBookingIds);

        if (bookingsError) throw bookingsError;
        // console.log('Current Bookings for User:', currentBookings);

        // Get today's date in Indian timezone (YYYY-MM-DD format)
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
        const istDate = new Date(now.getTime() + istOffset);
        const today = istDate.toISOString().split('T')[0];
        
        // console.log('Today\'s Date (IST):', today);

        // Today's Check-ins: Bookings with today's check-in date (convert UTC to IST)
        const todayCheckins = currentBookings.filter(b => {
            if (!b.checkin_date) return false;
            // Convert UTC date to IST and compare
            const checkinDateUTC = new Date(b.checkin_date);
            const checkinDateIST = new Date(checkinDateUTC.getTime() + istOffset);
            const checkinDateStr = checkinDateIST.toISOString().split('T')[0];
            return checkinDateStr === today;
        });
        // console.log('\n=== TODAY\'S CHECKINS ===');
        // console.log('Bookings:', todayCheckins);
        // console.log('Count:', todayCheckins.length);

        // Today's Checkouts: ALL bookings with today's checkout date (convert UTC to IST)
        const todayCheckouts = currentBookings.filter(b => {
            if (!b.checkout_date) return false;
            
            // Convert UTC date to IST and compare
            const checkoutDateUTC = new Date(b.checkout_date);
            const checkoutDateIST = new Date(checkoutDateUTC.getTime() + istOffset);
            const checkoutDateStr = checkoutDateIST.toISOString().split('T')[0];
            
            return checkoutDateStr === today;
        });
        // console.log('\n=== TODAY\'S CHECKOUTS ===');
        // console.log('Bookings:', todayCheckouts);
        // console.log('Count:', todayCheckouts.length);

        // Get checked-in bookings for current guests count
        const checkedInBookings = currentBookings.filter(b => {
            const status = b.status?.toLowerCase();
            return status === 'checked-in' || status === 'checkin' || status === 'checked in';
        });
        
        const checkedInBookingIds = checkedInBookings.map(b => b.booking_id);
        // console.log('\n=== CHECKED-IN BOOKINGS ===');
        // console.log('Total Checked-in Bookings:', checkedInBookings.length);
        // console.log('Booking IDs:', checkedInBookingIds);

        // Get current guests count from booking_guests table (ALL guests stored here)
        let currentGuestsCount = 0;
        if (checkedInBookingIds.length > 0) {
            const { data: bookingGuests, error: guestsError } = await supabase
                .from('booking_guests')
                .select('guest_id, booking_id, name')
                .in('booking_id', checkedInBookingIds);

            if (guestsError) {
                console.error('Error fetching booking guests:', guestsError);
            } else {
                // All guests (primary + additional) are in booking_guests table
                currentGuestsCount = bookingGuests?.length || 0;
                
                // console.log('\n=== CURRENT GUESTS ===');
                // console.log('All Guests from booking_guests table:', bookingGuests);
                // console.log('Total Current Guests Count:', currentGuestsCount);
            }
        } else {
            // console.log('\n=== NO CHECKED-IN BOOKINGS ===');
        }

        const todayCheckinsCount = todayCheckins.length;
        const todayCheckoutsCount = todayCheckouts.length;
        
        // console.log('\n=== FINAL COUNTS ===');
        // console.log('Today Checkins Count:', todayCheckinsCount);
        // console.log('Today Checkouts Count:', todayCheckoutsCount);
        // console.log('Current Guests Count:', currentGuestsCount);

        const stats = {
            totalRooms: rooms.length,
            occupiedRooms: rooms.filter(room => room.status === 'Occupied').length,
            availableRooms: rooms.filter(room => room.status === 'Available').length,
            bookedRooms: rooms.filter(room => room.status === 'Booked').length,
            
            // Current Guests: Total guests from booking_guests table for checked-in bookings
            currentGuests: currentGuestsCount,
            
            // Today's Check-ins: Bookings with today's check-in date (IST)
            todayCheckins: todayCheckinsCount,
            
            // Today's Checkouts: Bookings with today's checkout date (IST)
            todayCheckouts: todayCheckoutsCount
        };
        // console.log('\n=== FINAL DASHBOARD STATS ===');
        // console.log(stats);

        res.json(stats);
    } catch (error) {
        // console.error('Dashboard Stats Error:', error);
        res.status(500).json({ 
            message: 'Error fetching dashboard stats',
            error: error.message 
        });
    }
};

module.exports = {
    getDashboardStats
};