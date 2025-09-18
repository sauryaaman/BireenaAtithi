const supabase = require('../config/db');

const cancelBooking = async (req, res) => {
    const { booking_id } = req.params;
    
    try {
        // Start a Supabase transaction
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .select('*')
            .eq('booking_id', booking_id)
            .single();

        if (bookingError) {
            console.error('Error fetching booking:', bookingError);
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Check if booking can be cancelled (only upcoming or checked-in)
        if (!['upcoming', 'checked-in'].includes(booking.status.toLowerCase())) {
            return res.status(400).json({ 
                error: 'Only upcoming or checked-in bookings can be cancelled' 
            });
        }

        // Get all rooms associated with this booking
        const { data: bookingRooms, error: roomsError } = await supabase
            .from('booking_rooms')
            .select('room_id')
            .eq('booking_id', booking_id);

        if (roomsError) {
            console.error('Error fetching booking rooms:', roomsError);
            return res.status(500).json({ error: 'Failed to fetch booking rooms' });
        }

        // Determine new payment status based on current payment status
        let newPaymentStatus = booking.payment_status;
        if (['PAID', 'PARTIAL'].includes(booking.payment_status)) {
            newPaymentStatus = 'REFUND';
        }
        // Keep as 'UNPAID' if it was unpaid

        // Update booking status to cancelled and update payment status
        const { error: updateBookingError } = await supabase
            .from('bookings')
            .update({ 
                status: 'Cancelled',
                payment_status: newPaymentStatus
            })
            .eq('booking_id', booking_id);

        if (updateBookingError) {
            console.error('Error updating booking:', updateBookingError);
            return res.status(500).json({ error: 'Failed to cancel booking' });
        }

        // Update all associated rooms to available
        if (bookingRooms && bookingRooms.length > 0) {
            const roomIds = bookingRooms.map(room => room.room_id);
            
            const { error: updateRoomsError } = await supabase
                .from('rooms')
                .update({ status: 'Available' })
                .in('room_id', roomIds);

            if (updateRoomsError) {
                console.error('Error updating rooms:', updateRoomsError);
                return res.status(500).json({ error: 'Failed to update room status' });
            }
        }

        res.status(200).json({ 
            message: 'Booking cancelled successfully',
            booking_id: booking_id
        });

    } catch (error) {
        console.error('Error in cancelBooking:', error);
        res.status(500).json({ 
            error: 'An error occurred while cancelling the booking' 
        });
    }
};

module.exports = {
    cancelBooking
};