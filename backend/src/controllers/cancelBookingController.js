const supabase = require('../config/db');

const cancelBooking = async (req, res) => {
    const { booking_id } = req.params;
    const { refund_amount, payment_mode } = req.body;
    const user_id = req.user.user_id;
    
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

        // Validate refund amount if provided
        if (refund_amount !== undefined) {
            const refundAmountNum = parseFloat(refund_amount);
            if (refundAmountNum < 0) {
                return res.status(400).json({ error: 'Invalid refund amount' });
            }
            if (refundAmountNum > booking.amount_paid) {
                return res.status(400).json({ error: 'Refund amount cannot exceed amount paid' });
            }
        }

        // Calculate new amounts and payment status
        const newAmountPaid = refund_amount ? (booking.amount_paid - parseFloat(refund_amount)) : booking.amount_paid;
        let newPaymentStatus = booking.payment_status;
        if (['PAID', 'PARTIAL'].includes(booking.payment_status)) {
            newPaymentStatus = 'REFUND';
        }

        // Update booking status to cancelled and update payment status
        const { error: updateBookingError } = await supabase
            .from('bookings')
            .update({ 
                status: 'Cancelled',
                payment_status: newPaymentStatus,
                amount_paid: newAmountPaid,
                last_payment_date: new Date().toISOString(),
                refund_amount: refund_amount ? parseFloat(refund_amount) : null,
                refunded_at: refund_amount ? new Date().toISOString() : null
            })
            .eq('booking_id', booking_id);

        // Create refund transaction record if refund amount is provided
        if (refund_amount && payment_mode) {
            const { error: transactionError } = await supabase
                .from('payment_transactions')
                .insert([{
                    booking_id: booking_id,
                    amount_paid: parseFloat(refund_amount),
                    payment_mode: payment_mode,
                    user_id: user_id,
                    is_refund: true,
                    payment_date: new Date().toISOString()
                }]);

            if (transactionError) {
                console.error('Error creating refund transaction:', transactionError);
                return res.status(500).json({ error: 'Failed to record refund transaction' });
            }
        }

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
            booking_id: booking_id,
            refund_amount: refund_amount ? parseFloat(refund_amount) : null,
            new_amount_paid: newAmountPaid,
            status: 'Cancelled'
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