const supabase = require('../config/db');

// Function to update customer additional guests
const updateAdditionalGuests = async (req, res) => {
    try {
        const { customer_id } = req.params;
        const { additional_guests } = req.body;

        if (!Array.isArray(additional_guests)) {
            return res.status(400).json({ message: 'Additional guests must be an array' });
        }

        // Get current booking for the customer
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .select('booking_id')
            .eq('customer_id', customer_id)
            .eq('status', 'Checked-in')
            .single();

        if (bookingError) {
            if (bookingError.code === 'PGRST116') {
                return res.status(404).json({ message: 'No active booking found for this customer' });
            }
            throw bookingError;
        }

        // Delete existing additional guests
        const { error: deleteError } = await supabase
            .from('additional_guests')
            .delete()
            .eq('booking_id', booking.booking_id);

        if (deleteError) throw deleteError;

        if (additional_guests.length > 0) {
            // Insert new additional guests
            const guestsToInsert = additional_guests.map(guest => ({
                ...guest,
                booking_id: booking.booking_id
            }));

            const { error: insertError } = await supabase
                .from('additional_guests')
                .insert(guestsToInsert);

            if (insertError) throw insertError;
        }

        // Get updated guest list
        const { data: updatedGuests, error: fetchError } = await supabase
            .from('additional_guests')
            .select('*')
            .eq('booking_id', booking.booking_id);

        if (fetchError) throw fetchError;

        res.json(updatedGuests || []);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    updateAdditionalGuests
};
