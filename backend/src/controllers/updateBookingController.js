const supabase = require('../config/db');
 

// Constants for booking management
const BOOKING_STATUS = {
    UPCOMING: 'Upcoming',
    CHECKED_IN: 'Checked-in',
    CHECKED_OUT: 'Checked-out',
    BOOKED: 'Booked'
};

const PAYMENT_STATUS = {
    PAID: 'PAID',
    PARTIAL: 'PARTIAL',
    UNPAID: 'UNPAID'
};

const ROOM_STATUS = {
    AVAILABLE: 'Available',
    BOOKED: 'Booked',
    OCCUPIED: 'Occupied'
};

const updateBooking = async (req, res) => {
    try {
//         console.log("=== RAW PARAMS ===", req.params);
// console.log("=== RAW USER ===", req.user);

//         console.log('=== START UPDATE BOOKING ===');

        // Get and validate booking ID
        const bookingId = parseInt(req.params.booking_id);
        if (!bookingId || isNaN(bookingId)) {
            return res.status(400).json({ message: 'Valid booking ID is required' });
        }

        // Get and validate user ID
        const user_id = req.user?.user_id;
        if (!user_id) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // Log the request body
        // console.log('Update booking request',req.body,);

        // Extract data using same format as createBooking
        const {
            primary_guest,
            additional_guests = [],
            selected_rooms=[],
            checkin_date,
            checkout_date,
            checkin_time,
            checkout_time,
            
            total_amount,
            payment_status,
            booking_status,
        } = req.body;
        


        // Validate required fields
        if (!primary_guest || !selected_rooms || !checkin_date || !checkout_date) {
            return res.status(400).json({
                message: 'Missing required fields',
                required: ['primary_guest', 'selected_rooms', 'checkin_date', 'checkout_date']
            });
        }

        // Validate guest information
        if (!primary_guest.name || !primary_guest.phone || !primary_guest.id_proof || !primary_guest.id_proof_number) {
            return res.status(400).json({
                message: 'Missing required guest information',
                required: ['name', 'phone', 'id_proof', 'id_proof_number']
            });
        }

        // Validate dates
        const now = new Date();
        const checkInDate = new Date(checkin_date);
        const checkOutDate = new Date(checkout_date);

        if (checkOutDate <= checkInDate) {
            return res.status(400).json({
                message: 'Checkout date must be after check-in date'
            });
        }

        // Validate rooms data
        if (!Array.isArray(selected_rooms) || selected_rooms.length === 0) {
            return res.status(400).json({
                message: 'At least one room must be selected'
            });
        }

        // Validate payment status for checkout
        if (booking_status?.toUpperCase() === 'CHECKED-OUT' && payment_status?.toUpperCase() !== 'PAID') {
            return res.status(400).json({
                message: 'Cannot checkout: Payment must be completed first'
            });
        }

        // Additional guests validation if present
        if (additional_guests && additional_guests.length > 0) {
            const invalidGuests = additional_guests.filter(
                guest => !guest.name || !guest.id_proof || !guest.id_proof_number
            );
            if (invalidGuests.length > 0) {
                return res.status(400).json({
                    message: 'Invalid additional guest information',
                    required: ['name', 'id_proof', 'id_proof_number']
                });
            }
        }

        // Get existing booking details (verifyBookingAccess middleware already checked access)
        const { data: existingBooking, error: bookingError } = await supabase
            .from('bookings')
            .select(`
                *,
                customer:cust_id (
                    cust_id,
                    name,
                    phone,
                    email
                )
            `)
            .eq('booking_id', bookingId)
            .single();

        if (bookingError || !existingBooking) {
            // console.error('Error fetching booking:', bookingError);
            return res.status(500).json({ 
                message: 'Error fetching booking details'
            });
        }

        // Calculate nights between dates
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

        // Determine booking and room status
        // Convert incoming status to proper case to match BOOKING_STATUS format
        let status = BOOKING_STATUS.UPCOMING; // default status
        if (booking_status) {
            // Normalize the booking status by removing special characters and converting to uppercase
            const normalizedStatus = booking_status.toUpperCase().replace(/[-_\s]/g, '');
            switch(normalizedStatus) {
                case 'UPCOMING':
                    status = BOOKING_STATUS.UPCOMING;
                    break;
                case 'CHECKEDIN':
                    status = BOOKING_STATUS.CHECKED_IN;
                    break;
                case 'CHECKEDOUT':
                case 'CHECKED_OUT':
                    status = BOOKING_STATUS.CHECKED_OUT;
                    break;
                case 'BOOKED':
                    status = BOOKING_STATUS.BOOKED;
                    break;
            }
        }

        // Set room status based on booking status
        const roomStatus = status === BOOKING_STATUS.CHECKED_IN ? ROOM_STATUS.OCCUPIED :
                         status === BOOKING_STATUS.CHECKED_OUT ? ROOM_STATUS.AVAILABLE :
                         ROOM_STATUS.BOOKED;

        // Update booking information
        const bookingUpdateData = {
            checkin_date,
            checkout_date,
            checkin_time: status === BOOKING_STATUS.CHECKED_IN.toUpperCase() ? (checkin_time || new Date().toISOString()) : checkin_time,
            checkout_time: status === BOOKING_STATUS.CHECKED_OUT.toUpperCase() ? (checkout_time || new Date().toISOString()) : checkout_time,
            nights,
            total_amount,
            payment_status: payment_status ? 
                (payment_status.toUpperCase() === 'PAID' ? PAYMENT_STATUS.PAID :
                 payment_status.toUpperCase() === 'PARTIAL' ? PAYMENT_STATUS.PARTIAL :
                 PAYMENT_STATUS.UNPAID) : existingBooking.payment_status,
            status,
            updated_at: new Date().toISOString()
        };
        console.log('Booking data to update:', bookingUpdateData);

        // Update the booking
        const { error: bookingUpdateError } = await supabase
            .from('bookings')
            .update(bookingUpdateData)
            .eq('booking_id', bookingId);

        if (bookingUpdateError) {
            // console.error('Error updating booking:', bookingUpdateError);
            return res.status(500).json({ 
                message: 'Failed to update booking information',
                error: bookingUpdateError.message 
            });
        }

        // Handle room assignments
        // console.log('Updating room assignments...');
        
        // Get current room assignments
        const { data: currentRooms } = await supabase
            .from('booking_rooms')
            .select('room_id')
            .eq('booking_id', bookingId);

        // Track room changes
        // Filter out any invalid room data
        const validSelectedRooms = selected_rooms.filter(room => {
            const roomId = parseInt(room.room_id, 10);
            return !isNaN(roomId) && roomId > 0;
        });

        if (validSelectedRooms.length === 0) {
            return res.status(400).json({
                message: 'No valid rooms provided'
            });
        }

        const currentRoomIds = new Set(currentRooms?.map(r => r.room_id) || []);
        const newRoomIds = new Set(validSelectedRooms.map(r => parseInt(r.room_id, 10)));

        // Get price_per_night for all selected rooms from rooms table
        const { data: roomsWithPrices, error: roomsError } = await supabase
            .from('rooms')
            .select('room_id, price_per_night')
            .in('room_id', [...newRoomIds]);

        if (roomsError) {
            // console.error('Error fetching room prices:', roomsError);
            return res.status(500).json({ 
                message: 'Failed to fetch room prices',
                error: roomsError.message 
            });
        }

        // Create a map of room_id to price_per_night
        const roomPrices = Object.fromEntries(
            roomsWithPrices.map(room => [room.room_id, room.price_per_night])
        );

        // Determine room status based on booking status
        let newRoomStatus = ROOM_STATUS.BOOKED; // default status
        switch(status) {
            case BOOKING_STATUS.CHECKED_IN:
                newRoomStatus = ROOM_STATUS.OCCUPIED;
                break;
            case BOOKING_STATUS.CHECKED_OUT:
                newRoomStatus = ROOM_STATUS.AVAILABLE;
                break;
            default:
                newRoomStatus = ROOM_STATUS.BOOKED;
        }

        // Find rooms to be freed (set to Available)
        const roomsToFree = [...currentRoomIds].filter(id => !newRoomIds.has(id));
        if (roomsToFree.length > 0 && roomsToFree.every(id => !isNaN(id) && id > 0)) {
            console.log('Setting old rooms to Available:', roomsToFree);
            await supabase
                .from('rooms')
                .update({ status: ROOM_STATUS.AVAILABLE })
                .in('room_id', roomsToFree);
        }

        // Update status of new rooms
        if (validSelectedRooms.length > 0) {
            const validRoomIds = [...newRoomIds].filter(id => !isNaN(id) && id > 0);
            if (validRoomIds.length > 0) {
                console.log(`Setting new rooms to ${newRoomStatus}:`, validRoomIds);
                await supabase
                    .from('rooms')
                    .update({ status: newRoomStatus })
                    .in('room_id', validRoomIds);
            }
        }

        // Delete all current room assignments
        const { error: deleteRoomsError } = await supabase
            .from('booking_rooms')
            .delete()
            .eq('booking_id', bookingId);

        if (deleteRoomsError) {
            console.error('Error deleting existing rooms:', deleteRoomsError);
            return res.status(500).json({ 
                message: 'Failed to update room assignments',
                error: deleteRoomsError.message 
            });
        }
        // console.log("Selected Rooms in request body:", selected_rooms);


        // Insert new room assignments with prices from rooms table
        const roomAssignments = selected_rooms.map(room => ({
            booking_id: bookingId,
            room_id: parseInt(room.room_id),
            price_per_night: roomPrices[room.room_id] // Use price from rooms table
        }));

        // console.log('Room assignments to insert:', roomAssignments);
        const { error: insertRoomsError } = await supabase
            .from('booking_rooms')
            .insert(roomAssignments);

        if (insertRoomsError) {
            // console.error('Error inserting room assignments:', insertRoomsError);
            return res.status(500).json({ 
                message: 'Failed to add room assignments',
                error: insertRoomsError.message 
            });
        }

        // Update status for new rooms
        await supabase
            .from('rooms')
            .update({ status: roomStatus })
            .in('room_id', selected_rooms.map(r => parseInt(r.room_id)));

        // Update primary guest in customers table first
        const { data: existingCustomer, error: customerFetchError } = await supabase
            .from('customers')
            .select('cust_id')
            .eq('cust_id', existingBooking.cust_id)
            .single();

        if (customerFetchError) {
            // console.error('Error fetching customer:', customerFetchError);
            return res.status(500).json({ 
                message: 'Failed to fetch customer information',
                error: customerFetchError.message 
            });
        }

        // Update customer information
        const { error: customerUpdateError } = await supabase
            .from('customers')
            .update({
                name: primary_guest.name,
                phone: primary_guest.phone,
                email: primary_guest.email,
                gst_number: primary_guest.gst_number,
                meal_plan: primary_guest.meal_plan,
                id_proof: primary_guest.id_proof,
                id_proof_number: primary_guest.id_proof_number,
                address_line1: primary_guest.address.address_line1,
                address_line2: primary_guest.address.address_line2,
                city: primary_guest.address.city,
                state: primary_guest.address.state,
                country: primary_guest.address.country,
                pin: primary_guest.address.pin,
                updated_at: new Date().toISOString()
            })
            .eq('cust_id', existingBooking.cust_id);

        if (customerUpdateError) {
            // console.error('Error updating customer:', customerUpdateError);
            return res.status(500).json({ 
                message: 'Failed to update customer information',
                error: customerUpdateError.message 
            });
        }

        // Update primary guest in booking_guests
        const { error: primaryGuestError } = await supabase
            .from('booking_guests')
            .update({
                name: primary_guest.name,
                email: primary_guest.email,
                phone: primary_guest.phone,
                id_proof: primary_guest.id_proof,
                id_proof_number: primary_guest.id_proof_number,
                meal_plan: primary_guest.meal_plan,
                gst_number: primary_guest.gst_number,
                updated_at: new Date().toISOString()
            })
            .eq('booking_id', bookingId)
            .eq('is_primary', true);

        if (primaryGuestError) {
            // console.error('Error updating primary guest:', primaryGuestError);
            return res.status(500).json({ 
                message: 'Failed to update primary guest information',
                error: primaryGuestError.message 
            });
        }

        // Handle additional guests
        if (additional_guests && additional_guests.length > 0) {
            // First delete existing additional guests
            const { error: deleteGuestsError } = await supabase
                .from('booking_guests')
                .delete()
                .eq('booking_id', bookingId)
                .eq('is_primary', false);

            if (deleteGuestsError) {
                // console.error('Error deleting additional guests:', deleteGuestsError);
                return res.status(500).json({ 
                    message: 'Failed to update additional guests',
                    error: deleteGuestsError.message 
                });
            }

            // Add new additional guests
            const guestsToAdd = additional_guests.map(guest => ({
                booking_id: bookingId,
                name: guest.name,
                id_proof: guest.id_proof,
                id_proof_number: guest.id_proof_number,
                is_primary: false,
                created_at: new Date().toISOString()
            }));

            const { error: insertGuestsError } = await supabase
                .from('booking_guests')
                .insert(guestsToAdd);

            if (insertGuestsError) {
                // console.error('Error inserting additional guests:', insertGuestsError);
                return res.status(500).json({ 
                    message: 'Failed to add additional guests',
                    error: insertGuestsError.message 
                });
            }
        }

        // Fetch and return updated booking details
        const { data: updatedBooking, error: fetchError } = await supabase
            .from('bookings')
            .select(`
                *,
                customers (*),
                booking_rooms (
                    *,
                    rooms:room_id (*)
                ),
                booking_guests (*)
            `)
            .eq('booking_id', bookingId)
            .single();

        if (fetchError) {
            // console.error('Error fetching updated booking:', fetchError);
            return res.status(200).json({ 
                message: 'Booking updated successfully, but failed to fetch updated details',
                booking_id: bookingId
            });
        }

        // console.log('=== UPDATE COMPLETED SUCCESSFULLY ===');
        return res.status(200).json({
            message: 'Booking updated successfully',
            data: updatedBooking
        });

    } catch (error) {
        // console.error('=== ERROR IN UPDATE BOOKING ===');
        // console.error('Error details:', {
        //     message: error.message,
        //     code: error.code,
        //     hint: error.hint,
        //     details: error.details
        // });

        // Send appropriate error message based on error type
        if (error.code === '23505') {
            return res.status(409).json({
                message: 'This booking conflicts with another booking',
                error: error.detail
            });
        } else if (error.code === '23503') {
            return res.status(400).json({
                message: 'Invalid reference to room or customer',
                error: error.detail
            });
        } else if (error.code === '22P02') {
            return res.status(400).json({
                message: 'Invalid data type provided',
                error: 'Please check all numeric and date fields. Make sure room IDs and prices are valid numbers.'
            });
        }

        return res.status(500).json({
            message: 'Failed to update booking',
            error: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred',
            requestId: new Date().getTime()
        });
    }
};

const getAvailableRooms = async (req, res) => {
    try {
        const { roomType, checkInDate, checkOutDate, currentBookingId } = req.query;

        // Get all rooms of the specified type
        const { data: rooms, error: roomError } = await supabase
            .from('rooms')
            .select('*')
            .eq('type', roomType);

        if (roomError) {
            // console.error('Error fetching rooms:', roomError);
            return res.status(500).json({
                error: 'Failed to fetch rooms',
                details: roomError.message
            });
        }

        // Get all bookings that overlap with the specified date range
        const { data: bookings, error: bookingError } = await supabase
            .from('bookings')
            .select('*')
            .or(`checkin_date.lte.${checkOutDate},checkout_date.gte.${checkInDate}`)
            .not('status', 'eq', 'Checked-out');

        if (bookingError) {
            // console.error('Error fetching bookings:', bookingError);
            return res.status(500).json({
                error: 'Failed to fetch bookings',
                details: bookingError.message
            });
        }

        // Filter out the current booking if currentBookingId is provided
        const relevantBookings = currentBookingId
            ? bookings.filter(booking => booking.booking_id !== parseInt(currentBookingId))
            : bookings;

        // Get room IDs that are already booked for this period
        const bookedRoomIds = new Set(relevantBookings.map(booking => booking.room_id));

        // Filter available rooms
        const availableRooms = rooms.filter(room => !bookedRoomIds.has(room.room_id));

        return res.json(availableRooms);
    } catch (error) {
        // console.error('Error fetching available rooms:', error);
        return res.status(500).json({
            error: 'Failed to fetch available rooms',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    updateBooking,
    getAvailableRooms
};