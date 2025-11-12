const supabase = require('../config/db');

// Test helper function to get a valid booking for invoice testing
async function getTestBookingId(user_id) {
    try {
        const { data: booking, error } = await supabase
            .from('bookings')
            .select('booking_id')
            .eq('user_id', user_id)
            .eq('payment_status', 'PAID')
            .limit(1)
            .single();
            
        if (error) throw error;
        return booking?.booking_id;
    } catch (error) {
        // console.error('Error getting test booking:', error);
        return null;
    }
}

// Constants for booking management
const BOOKING_STATUS = {
    UPCOMING: 'Upcoming',
    CHECKED_IN: 'Checked-in',
    CHECKED_OUT: 'Checked-out',
    BOOKED: 'Booked'  // Added this status
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
        console.log('========= CREATE BOOKING START =========');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        console.log('Nightly rates received:', req.body.nightly_rates);
        
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

            // Determine if it's an immediate check-in day
            const isCheckInDay = checkinDateOnly.getTime() === currentDate.getTime();
            
            // Determine initial statuses
            const initialBookingStatus = (is_immediate_checkin && isCheckInDay)
                ? BOOKING_STATUS.CHECKED_IN
                : BOOKING_STATUS.UPCOMING;

            const initialRoomStatus = (is_immediate_checkin && isCheckInDay)
                ? ROOM_STATUS.OCCUPIED
                : ROOM_STATUS.BOOKED;

            // Validate room availability
            const validationResult = await validateRoomAvailability(roomIds, checkin_date, checkout_date);
            if (!validationResult) {
                return res.status(400).json({ message: 'Room validation failed' });
            }

            // console.log('Received booking data:', { primary_guest, selected_rooms, checkin_date, checkout_date });

            // Calculate nights between checkin and checkout
            const checkinDate = new Date(checkin_date);
            const checkoutDate = new Date(checkout_date);
            const nights = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));

            // Initialize booking variable at the widest scope
            let createdBooking = null;

            // Create new customer first (primary guest)
            try {
                // Validate required customer fields
                if (!primary_guest.name || !primary_guest.phone) {
                    throw new Error('Name and phone are required for primary guest');
                }

                const { data: newCustomer, error: customerError } = await supabase
                    .from('customers')
                    .insert([{
                        name: primary_guest.name,
                        phone: primary_guest.phone,
                        email: primary_guest.email,
                        gst_number: primary_guest.gst_number,
                        meal_plan: primary_guest.meal_plan,
                        id_proof: primary_guest.id_proof_type,
                        id_proof_number: primary_guest.id_proof,
                        address_line1: primary_guest.address_line1,
                        address_line2: primary_guest.address_line2,
                        city: primary_guest.city,
                        state: primary_guest.state,
                        country: primary_guest.country,
                        pin: primary_guest.pin
                    }])
                    .select()
                    .single();

                if (customerError) {
                    // console.error('Error creating customer:', customerError);
                    throw new Error(`Failed to create customer: ${customerError.message}`);
                }

                if (!newCustomer) {
                    throw new Error('Customer creation failed - no data returned');
                }

                // console.log('Customer created successfully:', newCustomer);
                const customerId = newCustomer.cust_id;
                // console.log('Created new customer with ID:', customerId);

                // Create main booking record
                // Process nightly rates - ensure it's a proper JSONB array
                let processedNightlyRates = null;
                if (req.body.nightly_rates) {
                    // If it's a string, parse it first
                    const ratesData = typeof req.body.nightly_rates === 'string' 
                        ? JSON.parse(req.body.nightly_rates) 
                        : req.body.nightly_rates;
                    
                    // Ensure it's an array of objects with night and rate
                    if (Array.isArray(ratesData)) {
                        processedNightlyRates = ratesData;
                    }
                }

                const bookingData = {
                    cust_id: customerId,
                    room_id: selected_rooms[0].room_id, // Primary room for backward compatibility
                    checkin_date,
                    checkout_date,
                    nights,
                    total_amount,
                    amount_paid: req.body.amount_paid || 0,
                    payment_status: payment_status?.toUpperCase() || PAYMENT_STATUS.UNPAID,
                    status: initialBookingStatus,
                    checkin_time: initialBookingStatus === BOOKING_STATUS.CHECKED_IN ? new Date().toISOString() : null,
                    nightly_rates: processedNightlyRates, // This will be stored as JSONB in PostgreSQL
                    last_payment_date: req.body.amount_paid > 0 ? new Date().toISOString() : null
                };

                // console.log('Creating booking with data:', bookingData);

                try {
                    console.log('Attempting to create booking in Supabase with data:', JSON.stringify(bookingData, null, 2));
                    
                    const { data: booking, error } = await supabase
                        .from('bookings')
                        .insert([bookingData])
                        .select()
                        .single();

                    if (error) {
                        console.error('Supabase Error:', error);
                        console.error('Error details:', {
                            code: error.code,
                            message: error.message,
                            details: error.details,
                            hint: error.hint
                        });
                        throw new Error(`Failed to create booking: ${error.message}`);
                    }

                    if (!booking) {
                        console.error('No booking data returned from Supabase insert');
                        throw new Error('Booking creation failed - no data returned');
                    }

                    console.log('Supabase Insert Response:', JSON.stringify(booking, null, 2));
                    console.log('Created Booking Details:', {
                        booking_id: booking.booking_id,
                        cust_id: booking.cust_id,
                        room_id: booking.room_id,
                        checkin_date: booking.checkin_date,
                        checkout_date: booking.checkout_date,
                        status: booking.status,
                        nightly_rates: booking.nightly_rates
                    });
                    createdBooking = booking; // Save to outer scope variable

                    // Create payment transaction if amount_paid > 0
                    if (req.body.amount_paid > 0) {
                        const paymentData = {
                            booking_id: booking.booking_id,
                            user_id: req.user.user_id, // Assuming user is attached to req by auth middleware
                            amount_paid: req.body.amount_paid,
                            payment_mode: req.body.payment_mode || 'Cash',
                            is_refund: false
                        };

                        const { error: paymentError } = await supabase
                            .from('payment_transactions')
                            .insert([paymentData]);

                        if (paymentError) {
                            console.error('Payment transaction creation failed:', paymentError);
                            // Don't throw error here, as booking is already created
                        }
                    }
                } catch (error) {
                    // console.error('Error in booking creation:', error);
                    throw new Error(`Failed to create booking: ${error.message}`);
                }

                // Store all selected rooms in booking_rooms and update their status
                // Prepare booking rooms data using createdBooking
                // Prepare booking rooms data with nightly rates information
                const bookingRooms = selected_rooms.map(room => ({
                    booking_id: createdBooking.booking_id,
                    room_id: room.room_id,
                    price_per_night: room.price_per_night,
                    uses_nightly_rates: room.uses_nightly_rates || false,
                    nightly_rates: room.uses_nightly_rates ? room.nightly_rates : null
                }));

                console.log('Creating booking rooms entries with rate info:', JSON.stringify(bookingRooms, null, 2));

                const { data: createdBookingRooms, error: bookingRoomsError } = await supabase
                    .from('booking_rooms')
                    .insert(bookingRooms)
                    .select();

                if (bookingRoomsError) {
                    // console.error('Error adding booking rooms:', bookingRoomsError);
                    throw new Error(`Failed to create booking rooms: ${bookingRoomsError.message}`);
                }

                if (!createdBookingRooms || createdBookingRooms.length === 0) {
                    throw new Error('No booking rooms were created');
                }

                // console.log('Booking rooms created successfully:', createdBookingRooms);

                // Update status for all selected rooms
                const roomsToUpdate = selected_rooms.map(r => r.room_id);
                
                // console.log(`Updating room statuses to ${initialRoomStatus} for rooms:`, roomsToUpdate);

                const { data: updatedRooms, error: roomStatusError } = await supabase
                    .from('rooms')
                    .update({ status: initialRoomStatus })
                    .in('room_id', roomsToUpdate)
                    .select();

                if (roomStatusError) {
                    // console.error('Error updating room status:', roomStatusError);
                    throw new Error(`Failed to update room status: ${roomStatusError.message}`);
                }

                if (!updatedRooms || updatedRooms.length === 0) {
                    throw new Error('No rooms were updated with new status');
                }

                // console.log('Room statuses updated successfully:', updatedRooms);
            } catch (error) {
                // console.error('Error in booking rooms handling:', error);
                throw error;
            }

            // Store primary guest in booking_guests
            const { error: primaryGuestError } = await supabase
                .from('booking_guests')
                .insert([{
                    booking_id: createdBooking.booking_id,
                    name: primary_guest.name,
                    phone: primary_guest.phone,
                    email: primary_guest.email,
                    id_proof: primary_guest.id_proof_type,
                    id_proof_number: primary_guest.id_proof,
                    gst_number: primary_guest.gst_number,
                    meal_plan: primary_guest.meal_plan,
                    is_primary: true
                }]);

            if (primaryGuestError) {
                // console.error('Error adding primary guest:', primaryGuestError);
                throw primaryGuestError;
            }

            // Store additional guests if any
            if (additional_guests && additional_guests.length > 0) {
                const additionalGuestRecords = additional_guests.map(guest => ({
                    booking_id: createdBooking.booking_id,
                    name: guest.name,
                    phone: guest.phone,
                    email: guest.email,
                    id_proof: guest.id_proof_type,
                    id_proof_number: guest.id_proof,
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

            // Prepare response data
            const responseData = {
                message: 'Booking created successfully',
                booking_id: createdBooking.booking_id,
                status: initialBookingStatus,
                checkin_date: createdBooking.checkin_date,
                checkout_date: createdBooking.checkout_date,
                nightly_rates: createdBooking.nightly_rates,
                total_amount: createdBooking.total_amount
            };

            console.log('Final booking details in Supabase:', JSON.stringify(responseData, null, 2));
            
            // Send successful response
            res.status(201).json(responseData);

        } catch (error) {
            // console.error('Error in createBooking:', error);
            const errorMessage = error.message || 'Internal server error';
            const statusCode = error.statusCode || 500;
            res.status(statusCode).json({ 
                error: errorMessage,
                success: false
            });
        }
}

async function checkinBooking(req, res) {
    try {
        const { booking_id } = req.params;
        // console.log('Checking in booking:', booking_id);
        
        // Get booking details
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select('*, rooms:room_id(*)')
            .eq('booking_id', booking_id)
            .single();
            
        // console.log('Booking details:', booking, 'Fetch error:', fetchError);

        if (fetchError) {
            // console.error('Error fetching booking:', fetchError);
            return res.status(500).json({ 
                error: 'Error fetching booking details',
                details: fetchError.message,
                code: fetchError.code
            });
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
            // console.error('Error fetching booking:', fetchError);
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
        const moment = require('moment-timezone');
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

            // Parse nightly rates if present
            let nightly_rates = null;
            if (booking.nightly_rates) {
                try {
                    nightly_rates = JSON.parse(booking.nightly_rates);
                } catch (e) {
                    nightly_rates = null;
                }
            }

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
                amount_paid: booking.amount_paid,
                amount_due: booking.amount_due,
                payment_status: booking.payment_status,
                status: booking.status,
                nightly_rates: nightly_rates,
                refunded_at: booking.refunded_at ? moment.tz(booking.refunded_at, 'UTC').tz('Asia/Kolkata').format() : null,
                refund_amount: booking.refund_amount
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

        // Convert payment status to uppercase to match PAYMENT_STATUS enum
        const normalizedPaymentStatus = payment_status.toUpperCase();

        if (!Object.values(PAYMENT_STATUS).includes(normalizedPaymentStatus)) {
            return res.status(400).json({ message: 'Invalid payment status' });
        }

        const { error } = await supabase
            .from('bookings')
            .update({ payment_status: normalizedPaymentStatus })
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
                price_per_night: br.price_per_night,
                uses_nightly_rates: br.uses_nightly_rates || false,
                nightly_rates: br.uses_nightly_rates ? br.nightly_rates : null
            }));
            
            // Nightly rates are already in JSONB format from PostgreSQL, no need to parse
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
        const user_id = req.user.user_id;

        // Get invoice details using the existing function
        const invoiceDetailsResponse = {};
        await getInvoiceDetails({ params: { booking_id }, user: { user_id } }, {
            json: (data) => {
                Object.assign(invoiceDetailsResponse, data);
            },
            status: (code) => ({
                json: (data) => {
                    invoiceDetailsResponse.statusCode = code;
                    Object.assign(invoiceDetailsResponse, data);
                }
            })
        });

        // Check if there was an error in getting invoice details
        if (invoiceDetailsResponse.statusCode >= 400) {
            return res.status(invoiceDetailsResponse.statusCode).json({ error: invoiceDetailsResponse.error });
        }

        const { generateInvoicePDF } = require('../utils/invoiceGenerator');

        // Generate PDF using the invoice details
        const pdfBuffer = await generateInvoicePDF(invoiceDetailsResponse);

        // Check if PDF buffer is valid
        if (!pdfBuffer || pdfBuffer.length === 0) {
            console.error('Generated PDF buffer is empty or invalid');
            return res.status(500).json({ error: 'Failed to generate PDF. Please try again.' });
        }

        // console.log(`Generated PDF buffer size: ${pdfBuffer.length} bytes`);

        // Temporarily save PDF to file for debugging
        // const fs = require('fs');
        // const path = require('path');
        // const debugFilePath = path.join(__dirname, `../../debug-invoice-${booking_id}.pdf`);
        // try {
        //     fs.writeFileSync(debugFilePath, pdfBuffer);
        //     console.log(`Debug PDF saved to: ${debugFilePath}`);
        // } catch (fileError) {
        //     console.error('Error saving debug PDF file:', fileError);
        // }

        // Set response headers for PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${booking_id}.pdf`);
        res.setHeader('Content-Length', pdfBuffer.length);
        
        // Send the PDF as binary data
        res.write(pdfBuffer, 'binary');
        res.end(null, 'binary');
    } catch (error) {
        // console.error('Error generating invoice:', error);
        let errorMessage = 'Failed to generate invoice';
        let statusCode = 500;

        if (error.message.includes('PDF generation failed')) {
            errorMessage = 'Failed to generate PDF. Please try again.';
        } else if (error.message.includes('Hotel details not found')) {
            errorMessage = 'Missing hotel information required for invoice.';
            statusCode = 400;
        } else if (error.message.includes('Booking not found')) {
            errorMessage = 'Booking information not found.';
            statusCode = 404;
        }

        res.status(statusCode).json({ error: errorMessage });
    }
}

// Get Invoice Details including Hotel Information
async function getInvoiceDetails(req, res) {
    try {
        const { booking_id } = req.params;
        const user_id = req.user.user_id;

        // Get hotel details first since they're common for all invoices
        const { data: hotelDetails, error: hotelError } = await supabase
            .from('hotel_details')
            .select(`
                hotel_id,
                hotel_name,
                hotel_logo_url,
                address_line1,
                city,
                state,
                country,
                pin_code,
                gst_number
                
               
                
            `)
            .eq('user_id', user_id)
            .single();

        if (hotelError) {
            // console.error('Error fetching hotel details:', hotelError);
            return res.status(500).json({ error: 'Failed to fetch hotel details' });
        }

        if (!hotelDetails) {
            return res.status(404).json({ error: 'Hotel details not found' });
        }

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
                        room_number,
                        room_type,
                        price_per_night
                    )
                ),
                booking_guests (
                    *
                )
            `)
            .eq('booking_id', booking_id)
            // .eq('user_id', user_id)
            .single();

        if (bookingError) {
            // console.error('Error fetching booking details:', bookingError);
            return res.status(500).json({ error: 'Failed to fetch booking details' });
        }

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Check payment status and booking status
        if (booking.status.toLowerCase() === 'cancelled') {
            return res.status(400).json({ error: 'Invoice is not available for cancelled bookings' });
        }

        if (booking.payment_status !== PAYMENT_STATUS.PAID) {
            return res.status(400).json({ error: 'Invoice is only available for paid bookings' });
        }

        // Process guests information
        const primaryGuest = booking.booking_guests.find(g => g.is_primary) || {};
        const additionalGuests = booking.booking_guests.filter(g => !g.is_primary) || [];

        const invoiceData = {
            // Invoice details
            booking_id: booking.booking_id,
            created_at: booking.created_at,
            
            // Hotel details
            hotel: {
                hotel_id: hotelDetails.hotel_id,
                hotel_name: hotelDetails.hotel_name,
                hotel_logo_url: hotelDetails.hotel_logo_url,
                address_line1: hotelDetails.address_line1,
                city: hotelDetails.city,
                state: hotelDetails.state,
                country: hotelDetails.country,
                pin_code: hotelDetails.pin_code,
                gst_number: hotelDetails.gst_number
            },
            
            // Booking details
            booking: {
                check_in_date: booking.checkin_date,
                check_out_date: booking.checkout_date,
                checkin_time: booking.checkin_time,
                checkout_time: booking.checkout_time,
                total_nights: booking.nights,
                total_amount: booking.total_amount,
                amount_paid: booking.amount_paid,
                amount_due: booking.amount_due,
                payment_status: booking.payment_status,
                rooms: booking.booking_rooms.map(br => ({
                    room_number: br.rooms.room_number,
                    room_type: br.rooms.room_type,
                    price_per_night: br.price_per_night || br.rooms.price_per_night
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

        res.json(invoiceData);
    } catch (error) {
        // console.error('Error fetching invoice details:', error);
        res.status(500).json({ error: 'Failed to fetch invoice details' });
    }
}

// Add new payment for a booking
async function addPayment(req, res) {
    try {
        const { booking_id } = req.params;
        const { amount_paid, payment_mode } = req.body;
    console.log('Adding payment:', { booking_id, amount_paid, payment_mode });
        // Get current booking details
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .select('*')
            .eq('booking_id', booking_id)
            .single();

        if (bookingError) throw bookingError;
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Calculate new amount paid and due
        const newAmountPaid = (booking.amount_paid || 0) + parseFloat(amount_paid);
        const newAmountDue = booking.total_amount - newAmountPaid;

        // Determine new payment status
        let newPaymentStatus;
        if (newAmountDue === 0) {
            newPaymentStatus = PAYMENT_STATUS.PAID;
        } else if (newAmountPaid > 0) {
            newPaymentStatus = PAYMENT_STATUS.PARTIAL;
        } else {
            newPaymentStatus = PAYMENT_STATUS.UNPAID;
        }

        // Start a Supabase transaction
        // Update booking payment details
        const { error: updateError } = await supabase
            .from('bookings')
            .update({ 
                amount_paid: newAmountPaid,
                //amount_due: newAmountDue,
                payment_status: newPaymentStatus,
                last_payment_date: new Date().toISOString()
            })
            .eq('booking_id', booking_id);

        if (updateError) throw updateError;

        // Create payment transaction record
        const { error: transactionError } = await supabase
            .from('payment_transactions')
            .insert([{
                booking_id: booking_id,
                amount_paid: amount_paid,
                payment_mode: payment_mode,
                user_id: req.user.user_id,
                is_refund: false
            }]);

        if (transactionError) throw transactionError;
        console.log('Payment added successfully:', { booking_id, newAmountPaid, newAmountDue, newPaymentStatus,last_payment_date: new Date().toLocaleDateString() });
        res.json({
            message: 'Payment added successfully',
            new_amount_paid: newAmountPaid,
            new_amount_due: newAmountDue,
            payment_status: newPaymentStatus
        });
    } catch (error) {
        console.error('Error in addPayment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Export all controller functions
module.exports = {
    createBooking,
    checkinBooking,
    checkoutBooking,
    getBookings,
    updatePaymentStatus,
    getBookingForBill,
    downloadInvoice,
    getInvoiceDetails,
    addPayment
}; // End of exports
