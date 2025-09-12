const supabase = require('../config/db');

// Constants for status management
const BOOKING_STATUS = {
    UPCOMING: 'Upcoming',
    CHECKED_IN: 'Checked-in',
    CHECKED_OUT: 'Checked-out'
};

const PAYMENT_STATUS = {
    PAID: 'Paid',
    PARTIAL: 'Partial',
    UNPAID: 'Unpaid'
};

const ROOM_STATUS = {
    AVAILABLE: 'Available',
    BOOKED: 'Booked',
    OCCUPIED: 'Occupied'
};

// Helper function to validate room availability
async function validateRoomAvailability(roomIds, checkin_date, checkout_date) {
    // Check if rooms exist and are available
    const { data: rooms, error: roomCheckError } = await supabase
        .from('rooms')
        .select('room_id, status')
        .in('room_id', roomIds);

    if (roomCheckError) throw roomCheckError;

    if (!rooms || rooms.length !== roomIds.length) {
        throw new Error('One or more rooms not found');
    }

    // Check for existing bookings in the date range
    const { data: existingBookings, error: bookingCheckError } = await supabase
        .from('bookings')
        .select('room_id')
        .in('room_id', roomIds)
        .eq('status', BOOKING_STATUS.CHECKED_IN)
        .eq('is_active', true)
        .or(`checkin_date.lte.${checkout_date},checkout_date.gte.${checkin_date}`);

    if (bookingCheckError) throw bookingCheckError;

    if (existingBookings && existingBookings.length > 0) {
        throw new Error('One or more rooms are not available for the selected dates');
    }

    return rooms;
}

// Create a new booking
async function createBooking(req, res) {
    try {
        // console.log('Received booking request:', req.body);
        
        const {
            primary_guest,
            additional_guests = [],
            selected_rooms,
            checkin_date,
            checkout_date,
            total_amount,
            payment_status,
            is_immediate_checkin = false
        } = req.body;

        if (!selected_rooms || !selected_rooms.length) {
            return res.status(400).json({ message: 'No rooms selected' });
        }

        const roomIds = selected_rooms.map(room => room.room_id);

            // Validate dates
            const currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);
            const checkinDateOnly = new Date(checkin_date);
            checkinDateOnly.setHours(0, 0, 0, 0);

            // Determine initial statuses
            const initialBookingStatus = (is_immediate_checkin && checkinDateOnly.getTime() === currentDate.getTime())
                ? BOOKING_STATUS.CHECKED_IN
                : BOOKING_STATUS.UPCOMING;

            const initialRoomStatus = (is_immediate_checkin && checkinDateOnly.getTime() === currentDate.getTime())
                ? ROOM_STATUS.OCCUPIED
                : ROOM_STATUS.BOOKED;

            // Validate room availability
            try {
                await validateRoomAvailability(roomIds, checkin_date, checkout_date);
            } catch (error) {
                return res.status(400).json({ message: error.message });
            }

            // console.log('Received booking data:', { primary_guest, selected_rooms, checkin_date, checkout_date });

            // Calculate nights between checkin and checkout
            const checkinDate = new Date(checkin_date);
            const checkoutDate = new Date(checkout_date);
            const nights = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));

            // Create new customer first (primary guest)
            const { data: newCustomer, error: customerError } = await supabase
                .from('customers')
                .insert([{
                    name: primary_guest.name,
                    phone: primary_guest.phone,
                    email: primary_guest.email
                }])
                .select()
                .single();

            if (customerError) {
                // console.error('Error creating customer:', customerError);
                throw new Error('Failed to create customer');
            }

            const customerId = newCustomer.cust_id;
            // console.log('Created new customer with ID:', customerId);

            // Create main booking record
            const { data: booking, error: bookingError } = await supabase
                .from('bookings')
                .insert([{
                    cust_id: customerId,
                    room_id: selected_rooms[0].room_id, // Primary room for backward compatibility
                    checkin_date,
                    checkout_date,
                    nights,
                    total_amount,
                    payment_status: payment_status || 'Unpaid',
                    status: is_immediate_checkin ? 'Checked-in' : 'Upcoming'
                }])
                .select()
                .single();

            if (bookingError) {
                // console.error('Error creating booking:', bookingError);
                throw bookingError;
            }

            // Store all selected rooms in booking_rooms
            const bookingRooms = selected_rooms.map(room => ({
                booking_id: booking.booking_id,
                room_id: room.room_id,
                price_per_night: room.price_per_night
            }));

            const { error: bookingRoomsError } = await supabase
                .from('booking_rooms')
                .insert(bookingRooms);

            if (bookingRoomsError) {
                // console.error('Error adding booking rooms:', bookingRoomsError);
                throw bookingRoomsError;
            }

            // Update status for all selected rooms
            const roomStatus = is_immediate_checkin ? 'Occupied' : 'Booked';
            const { error: roomStatusError } = await supabase
                .from('rooms')
                .update({ status: roomStatus })
                .in('room_id', selected_rooms.map(r => r.room_id));

            if (roomStatusError) {
                // console.error('Error updating room status:', roomStatusError);
                throw roomStatusError;
            }

            // Store primary guest in booking_guests
            const { error: primaryGuestError } = await supabase
                .from('booking_guests')
                .insert([{
                    booking_id: booking.booking_id,
                    name: primary_guest.name,
                    phone: primary_guest.phone,
                    email: primary_guest.email,
                    id_proof: primary_guest.id_proof,
                    is_primary: true
                }]);

            if (primaryGuestError) {
                // console.error('Error adding primary guest:', primaryGuestError);
                throw primaryGuestError;
            }

            // Store additional guests if any
            if (additional_guests && additional_guests.length > 0) {
                const additionalGuestRecords = additional_guests.map(guest => ({
                    booking_id: booking.booking_id,
                    name: guest.name,
                    phone: guest.phone,
                    email: guest.email,
                    id_proof: guest.id_proof,
                    is_primary: false
                }));

                const { error: additionalGuestsError } = await supabase
                    .from('booking_guests')
                    .insert(additionalGuestRecords);

                if (additionalGuestsError) {
                    // console.error('Error adding additional guests:', additionalGuestsError);
                    throw additionalGuestsError;
                }
            }

            if (bookingError) {
                // console.error('Error creating booking:', bookingError);
                throw bookingError;
            }

            res.status(201).json({
                message: 'Booking created successfully',
                booking_id: booking.booking_id,
                status: initialBookingStatus
            });

        } catch (error) {
            // console.error('Error in createBooking:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
}

async function checkinBooking(req, res) {
    try {
        const { booking_id } = req.params;
        
        // Get booking details
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select('*, rooms:room_id(*)')
            .eq('booking_id', booking_id)
            .single();

        if (fetchError) {
            // console.error('Error fetching booking:', fetchError);
            return res.status(500).json({ error: 'Error fetching booking details' });
        }

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Verify booking is in upcoming status
        if (booking.status.toLowerCase() !== BOOKING_STATUS.UPCOMING.toLowerCase()) {
            return res.status(400).json({ 
                error: 'Only upcoming bookings can be checked in',
                current_status: booking.status
            });
        }

        // Update booking to checked-in
        const { error: updateError } = await supabase
            .from('bookings')
            .update({ 
                status: BOOKING_STATUS.CHECKED_IN,
                checkin_time: new Date().toISOString()
            })
            .eq('booking_id', booking_id);

        if (updateError) {
            // console.error('Error updating booking:', updateError);
            return res.status(500).json({ error: 'Error updating booking status' });
        }

        // Get all rooms associated with this booking
        const { data: bookingRooms, error: roomsError } = await supabase
            .from('booking_rooms')
            .select('room_id')
            .eq('booking_id', booking_id);

        if (roomsError) {
            // console.error('Error fetching booking rooms:', roomsError);
            return res.status(500).json({ error: 'Error fetching booking rooms' });
        }

        // Update status for all rooms to occupied
        const { error: roomError } = await supabase
            .from('rooms')
            .update({ status: ROOM_STATUS.OCCUPIED })
            .in('room_id', bookingRooms.map(br => br.room_id));

        if (roomError) {
            // console.error('Error updating rooms:', roomError);
            // Revert booking status
            await supabase
                .from('bookings')
                .update({ 
                    status: BOOKING_STATUS.UPCOMING,
                    checkin_time: null
                })
                .eq('booking_id', booking_id);
            return res.status(500).json({ error: 'Error updating room status' });
        }

        res.json({
            message: 'Booking checked in successfully',
            booking_id,
            status: BOOKING_STATUS.CHECKED_IN
        });
    } catch (error) {
        // console.error('Error in checkinBooking:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function checkoutBooking(req, res) {
    try {
        const { booking_id } = req.params;
        
        // Get booking details
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select('*, rooms:room_id(*)')
            .eq('booking_id', booking_id)
            .single();

        if (fetchError) {
            console.error('Error fetching booking:', fetchError);
            return res.status(500).json({ error: 'Error fetching booking details' });
        }

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Verify booking is checked in
        if (booking.status.toLowerCase() !== BOOKING_STATUS.CHECKED_IN.toLowerCase()) {
            return res.status(400).json({ 
                error: 'Only checked-in bookings can be checked out',
                current_status: booking.status
            });
        }

        // Update booking to checked-out
        const { error: updateError } = await supabase
            .from('bookings')
            .update({ 
                status: BOOKING_STATUS.CHECKED_OUT,
                checkout_time: new Date().toISOString()
            })
            .eq('booking_id', booking_id);

        if (updateError) {
            // console.error('Error updating booking:', updateError);
            return res.status(500).json({ error: 'Error updating booking status' });
        }

        // Get all rooms associated with this booking
        const { data: bookingRooms, error: roomsError } = await supabase
            .from('booking_rooms')
            .select('room_id')
            .eq('booking_id', booking_id);

        if (roomsError) {
            // console.error('Error fetching booking rooms:', roomsError);
            return res.status(500).json({ error: 'Error fetching booking rooms' });
        }

        // Update status for all rooms to available
        const { error: roomError } = await supabase
            .from('rooms')
            .update({ status: ROOM_STATUS.AVAILABLE })
            .in('room_id', bookingRooms.map(br => br.room_id));

        if (roomError) {
            // console.error('Error updating rooms:', roomError);
            // Revert booking status
            await supabase
                .from('bookings')
                .update({ 
                    status: BOOKING_STATUS.CHECKED_IN,
                    checkout_time: null
                })
                .eq('booking_id', booking_id);
            return res.status(500).json({ error: 'Error updating room status' });
        }

        res.json({
            message: 'Booking checked out successfully',
            booking_id,
            status: BOOKING_STATUS.CHECKED_OUT
        });
    } catch (error) {
        // console.error('Error in checkoutBooking:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getBookings(req, res) {
    try {
        // console.log('Fetching bookings...');
        const user_id = req.user.user_id;

        // First get all rooms that belong to this user
        const { data: userRooms, error: userRoomsError } = await supabase
            .from('rooms')
            .select('room_id')
            .eq('user_id', user_id);

        if (userRoomsError) {
            // console.error('Error fetching user rooms:', userRoomsError);
            throw userRoomsError;
        }

        if (!userRooms || userRooms.length === 0) {
            return res.json([]); // Return empty array if user has no rooms
        }

        const roomIds = userRooms.map(room => room.room_id);

        // Get all booking rooms for these rooms
        const { data: userBookingRooms, error: bookingRoomsError } = await supabase
            .from('booking_rooms')
            .select('booking_id')
            .in('room_id', roomIds);

        if (bookingRoomsError) {
            // console.error('Error fetching booking rooms:', bookingRoomsError);
            throw bookingRoomsError;
        }

        if (!userBookingRooms || userBookingRooms.length === 0) {
            return res.json([]); // Return empty array if no bookings found
        }

        const bookingIds = [...new Set(userBookingRooms.map(br => br.booking_id))];

        // Get bookings with main customer info
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select(`
                *,
                customer:cust_id (*)
            `)
            .in('booking_id', bookingIds)
            .order('checkin_date', { ascending: false });

        if (error) {
            // console.error('Supabase error when fetching bookings:', error);
            throw error;
        }

        // Get all booking rooms for these bookings
        const { data: bookingRooms, error: roomsError } = await supabase
            .from('booking_rooms')
            .select(`
                *,
                room:room_id (*)
            `)
            .in('booking_id', bookingIds);

        if (roomsError) {
            // console.error('Error fetching booking rooms:', roomsError);
            throw roomsError;
        }

        // Get all booking guests
        const { data: bookingGuests, error: guestsError } = await supabase
            .from('booking_guests')
            .select('*')
            .in('booking_id', bookingIds);

        if (guestsError) {
            // console.error('Error fetching booking guests:', guestsError);
            throw guestsError;
        }

        // Format response combining all data
        const formattedBookings = bookings.map(booking => {
            const rooms = bookingRooms.filter(br => br.booking_id === booking.booking_id)
                .map(br => ({
                    ...br.room,
                    price_per_night: br.price_per_night
                }));
            
            const guests = bookingGuests.filter(g => g.booking_id === booking.booking_id);
            const primaryGuest = guests.find(g => g.is_primary);
            const additionalGuests = guests.filter(g => !g.is_primary);

            // Ensure customer data is properly formatted
            const customerData = booking.customer ? {
                name: booking.customer.name || '',
                phone: booking.customer.phone || '',
                email: booking.customer.email || '',
                cust_id: booking.customer.cust_id
            } : null;

            return {
                booking_id: booking.booking_id,
                customer: customerData,
                primary_guest: primaryGuest,
                additional_guests: additionalGuests,
                rooms: rooms,
                checkin_date: booking.checkin_date,
                checkout_date: booking.checkout_date,
                nights: booking.nights,
                total_amount: booking.total_amount,
                payment_status: booking.payment_status,
                status: booking.status
            };
        });

        res.json(formattedBookings);
    } catch (error) {
        // console.error('Error in getBookings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function updatePaymentStatus(req, res) {
    try {
        const { booking_id } = req.params;
        const { payment_status } = req.body;

        if (!Object.values(PAYMENT_STATUS).includes(payment_status)) {
            return res.status(400).json({ message: 'Invalid payment status' });
        }

        const { error } = await supabase
            .from('bookings')
            .update({ payment_status })
            .eq('booking_id', booking_id);

        if (error) throw error;

        res.json({ message: 'Payment status updated successfully' });
    } catch (error) {
        // console.error('Error in updatePaymentStatus:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getBookingForBill(req, res) {
    try {
        const { booking_id } = req.params;

        const { data: booking, error } = await supabase
            .from('bookings')
            .select(`
                *,
                customer:cust_id (*),
                booking_rooms!inner (
                    room_id,
                    price_per_night,
                    rooms:room_id (
                        room_number,
                        room_type,
                        price_per_night
                    )
                ),
                booking_guests!inner (
                    name,
                    phone,
                    email,
                    id_proof,
                    is_primary
                )
            `)
            .eq('booking_id', booking_id)
            .single();

        if (error) throw error;

        // Format response
        if (booking) {
            // Format customer data
            booking.customer = booking.customer ? {
                name: booking.customer.name || '',
                phone: booking.customer.phone || '',
                email: booking.customer.email || '',
                cust_id: booking.customer.cust_id
            } : null;
            
            booking.primary_guest = booking.booking_guests.find(g => g.is_primary);
            booking.additional_guests = booking.booking_guests.filter(g => !g.is_primary);
            booking.rooms = booking.booking_rooms.map(br => ({
                ...br.rooms,
                price_per_night: br.price_per_night
            }));
        }

        res.json(booking);
    } catch (error) {
        // console.error('Error in getBookingForBill:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function downloadInvoice(req, res) {
    try {
        const { booking_id } = req.params;

        const { data: booking, error } = await supabase
            .from('bookings')
            .select(`
                *,
                customer:cust_id (*),
                booking_rooms!inner (
                    room_id,
                    price_per_night,
                    rooms:room_id (
                        room_number,
                        room_type,
                        price_per_night
                    )
                ),
                booking_guests!inner (
                    name,
                    phone,
                    email,
                    id_proof,
                    is_primary
                )
            `)
            .eq('booking_id', booking_id)
            .single();

        if (error) throw error;
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        if (booking.payment_status !== 'Paid') {
            return res.status(400).json({ error: 'Invoice is only available for paid bookings' });
        }

        // Format booking data
        booking.primary_guest = booking.booking_guests.find(g => g.is_primary);
        booking.additional_guests = booking.booking_guests.filter(g => !g.is_primary);
        booking.rooms = booking.booking_rooms.map(br => ({
            ...br.rooms,
            price_per_night: br.price_per_night
        }));

        const PDFDocument = require('pdfkit');
        const { generateInvoicePDF } = require('../utils/pdfGenerator');

        // Create PDF document
        const doc = new PDFDocument();
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${booking_id}.pdf`);

        // Pipe the PDF document to the response
        doc.pipe(res);

        // Generate invoice content
        generateInvoicePDF(booking, doc);

        // Finalize PDF file
        doc.end();
    } catch (error) {
        // console.error('Error generating invoice:', error);
        res.status(500).json({ error: 'Failed to generate invoice' });
    }
}

// Export all controller functions
module.exports.createBooking = createBooking;
module.exports.checkinBooking = checkinBooking;
module.exports.checkoutBooking = checkoutBooking;
module.exports.getBookings = getBookings;
module.exports.updatePaymentStatus = updatePaymentStatus;
module.exports.getBookingForBill = getBookingForBill;
module.exports.downloadInvoice = downloadInvoice;
