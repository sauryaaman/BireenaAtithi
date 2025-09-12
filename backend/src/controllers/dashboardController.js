

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

        // Get current bookings with rooms
        const { data: currentBookings, error: bookingsError } = await supabase
            .from('bookings')
            .select(`
                booking_id,
                status,
                checkin_date,
                checkout_date,
                booking_rooms!inner (
                    room_id,
                    rooms (
                        room_number,
                        status
                    )
                )
            `)
            .eq('booking_rooms.rooms.user_id', user_id);

        if (bookingsError) throw bookingsError;

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];

        const stats = {
            totalRooms: rooms.length,
            occupiedRooms: rooms.filter(room => room.status === 'Occupied').length,
            availableRooms: rooms.filter(room => room.status === 'Available').length,
            bookedRooms: rooms.filter(room => room.status === 'Booked').length,
            currentGuests: currentBookings.filter(b => b.status === 'Checked-in').length,
            todayCheckins: currentBookings.filter(b => 
                b.checkin_date?.startsWith(today) && b.status === 'Reserved'
            ).length,
            todayCheckouts: currentBookings.filter(b => 
                b.checkout_date?.startsWith(today) && b.status === 'Checked-in'
            ).length
        };

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