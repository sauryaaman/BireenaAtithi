const supabase = require('../config/db');

// Middleware to verify that a booking belongs to one of the user's rooms
async function verifyBookingAccess(req, res, next) {
    try {
        const { booking_id } = req.params;
        const user_id = req.user.user_id;

        // Get the rooms involved in this booking
        const { data: bookingRooms, error: bookingRoomsError } = await supabase
            .from('booking_rooms')
            .select(`
                room_id,
                rooms!inner (
                    user_id
                )
            `)
            .eq('booking_id', booking_id);

        if (bookingRoomsError) {
            console.error('Error fetching booking rooms:', bookingRoomsError);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (!bookingRooms || bookingRooms.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Check if ANY of the rooms in this booking belong to the user
        const hasAccess = bookingRooms.some(br => br.rooms.user_id === user_id);
        
        if (!hasAccess) {
            return res.status(403).json({ error: 'Access denied: This booking does not belong to any of your rooms' });
        }

        next();
    } catch (error) {
        // console.error('Error in verifyBookingAccess middleware:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = verifyBookingAccess;