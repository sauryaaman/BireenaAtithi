// const supabase = require('../config/db');
 

// // Constants for booking management
// const BOOKING_STATUS = {
//     UPCOMING: 'Upcoming',
//     CHECKED_IN: 'Checked-in',
//     CHECKED_OUT: 'Checked-out',
//     BOOKED: 'Booked'
// };

// const PAYMENT_STATUS = {
//     PAID: 'PAID',
//     PARTIAL: 'PARTIAL',
//     UNPAID: 'UNPAID'
// };

// const ROOM_STATUS = {
//     AVAILABLE: 'Available',
//     BOOKED: 'Booked',
//     OCCUPIED: 'Occupied'
// };

// const updateBooking = async (req, res) => {
//     try {
// //         console.log("=== RAW PARAMS ===", req.params);
// // console.log("=== RAW USER ===", req.user);

// //         console.log('=== START UPDATE BOOKING ===');

//         // Get and validate booking ID
//         const bookingId = parseInt(req.params.booking_id);
//         if (!bookingId || isNaN(bookingId)) {
//             return res.status(400).json({ message: 'Valid booking ID is required' });
//         }

//         // Get and validate user ID
//         const user_id = req.user?.user_id;
//         if (!user_id) {
//             return res.status(400).json({ message: 'User ID is required' });
//         }

//         // Log the request body
//         // console.log('Update booking request',req.body,);

//         // Extract data using same format as createBooking
//         const {
//             primary_guest,
//             additional_guests = [],
//             selected_rooms=[],
//             removed_rooms = [],
//             checkin_date,
//             checkout_date,
//             checkin_time,
//             checkout_time,
            
//             total_amount,
//             payment_status,
//             booking_status,
//         } = req.body;

//         console.log('data received for update:', {
//             primary_guest,
//             additional_guests, 
//             selected_rooms,
//             removed_rooms,
//             checkin_date,
//             checkout_date,  
//             checkin_time,
//             checkout_time,

//             total_amount,
//             payment_status,
//             booking_status,
//         }
//             );
        


//         // Validate required fields
//         if (!primary_guest || !selected_rooms || !checkin_date || !checkout_date) {
//             return res.status(400).json({
//                 message: 'Missing required fields',
//                 required: ['primary_guest', 'selected_rooms', 'checkin_date', 'checkout_date']
//             });
//         }

//         // Validate guest information
//         if (!primary_guest.name || !primary_guest.phone || !primary_guest.id_proof || !primary_guest.id_proof_number) {
//             return res.status(400).json({
//                 message: 'Missing required guest information',
//                 required: ['name', 'phone', 'id_proof', 'id_proof_number']
//             });
//         }

//         // Validate dates
//         const now = new Date();
//         const checkInDate = new Date(checkin_date);
//         const checkOutDate = new Date(checkout_date);

//         if (checkOutDate <= checkInDate) {
//             return res.status(400).json({
//                 message: 'Checkout date must be after check-in date'
//             });
//         }

//         // Validate rooms data
//         if (!Array.isArray(selected_rooms) || selected_rooms.length === 0) {
//             return res.status(400).json({
//                 message: 'At least one room must be selected'
//             });
//         }

//         // Validate payment status for checkout
//         if (booking_status?.toUpperCase() === 'CHECKED-OUT' && payment_status?.toUpperCase() !== 'PAID') {
//             return res.status(400).json({
//                 message: 'Cannot checkout: Payment must be completed first'
//             });
//         }

//         // Additional guests validation if present
//         if (additional_guests && additional_guests.length > 0) {
//             const invalidGuests = additional_guests.filter(
//                 guest => !guest.name || !guest.id_proof || !guest.id_proof_number
//             );
//             if (invalidGuests.length > 0) {
//                 return res.status(400).json({
//                     message: 'Invalid additional guest information',
//                     required: ['name', 'id_proof', 'id_proof_number']
//                 });
//             }
//         }

//         // Get existing booking details (verifyBookingAccess middleware already checked access)
//         const { data: existingBooking, error: bookingError } = await supabase
//             .from('bookings')
//             .select(`
//                 *,
//                 customer:cust_id (
//                     cust_id,
//                     name,
//                     phone,
//                     email
//                 )
//             `)
//             .eq('booking_id', bookingId)
//             .single();

//         if (bookingError || !existingBooking) {
//             // console.error('Error fetching booking:', bookingError);
//             return res.status(500).json({ 
//                 message: 'Error fetching booking details'
//             });
//         }

//         // Calculate nights between dates
//         const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

//         // Determine booking and room status
//         // Convert incoming status to proper case to match BOOKING_STATUS format
//         let status = BOOKING_STATUS.UPCOMING; // default status
//         if (booking_status) {
//             // Normalize the booking status by removing special characters and converting to uppercase
//             const normalizedStatus = booking_status.toUpperCase().replace(/[-_\s]/g, '');
//             switch(normalizedStatus) {
//                 case 'UPCOMING':
//                     status = BOOKING_STATUS.UPCOMING;
//                     break;
//                 case 'CHECKEDIN':
//                     status = BOOKING_STATUS.CHECKED_IN;
//                     break;
//                 case 'CHECKEDOUT':
//                 case 'CHECKED_OUT':
//                     status = BOOKING_STATUS.CHECKED_OUT;
//                     break;
//                 case 'BOOKED':
//                     status = BOOKING_STATUS.BOOKED;
//                     break;
//             }
//         }

//         // Set room status based on booking status
//         const roomStatus = status === BOOKING_STATUS.CHECKED_IN ? ROOM_STATUS.OCCUPIED :
//                          status === BOOKING_STATUS.CHECKED_OUT ? ROOM_STATUS.AVAILABLE :
//                          ROOM_STATUS.BOOKED;

//         // Update booking information
//         const bookingUpdateData = {
//             checkin_date,
//             checkout_date,
//             checkin_time: status === BOOKING_STATUS.CHECKED_IN.toUpperCase() ? (checkin_time || new Date().toISOString()) : checkin_time,
//             checkout_time: status === BOOKING_STATUS.CHECKED_OUT.toUpperCase() ? (checkout_time || new Date().toISOString()) : checkout_time,
//             nights,
//             total_amount,
//             payment_status: payment_status ? 
//                 (payment_status.toUpperCase() === 'PAID' ? PAYMENT_STATUS.PAID :
//                  payment_status.toUpperCase() === 'PARTIAL' ? PAYMENT_STATUS.PARTIAL :
//                  PAYMENT_STATUS.UNPAID) : existingBooking.payment_status,
//             status,
//             nightly_rates: req.body.nightly_rates || null, // Combined nightly rates from all rooms
//             updated_at: new Date().toISOString()
//         };
//         // console.log('Booking data to update:', bookingUpdateData);

//         // Update the booking
//         const { error: bookingUpdateError } = await supabase
//             .from('bookings')
//             .update(bookingUpdateData)
//             .eq('booking_id', bookingId);

//         if (bookingUpdateError) {
//             // console.error('Error updating booking:', bookingUpdateError);
//             return res.status(500).json({ 
//                 message: 'Failed to update booking information',
//                 error: bookingUpdateError.message 
//             });
//         }

//         // Handle room assignments
//         // console.log('Updating room assignments...');
        
//         // Get current room assignments
//         const { data: currentRooms } = await supabase
//             .from('booking_rooms')
//             .select('room_id')
//             .eq('booking_id', bookingId);

//         // Track room changes
//         // Filter out any invalid room data
//         const validSelectedRooms = selected_rooms.filter(room => {
//             const roomId = parseInt(room.room_id, 10);
//             return !isNaN(roomId) && roomId > 0;
//         });

//         if (validSelectedRooms.length === 0) {
//             return res.status(400).json({
//                 message: 'No valid rooms provided'
//             });
//         }

//         const currentRoomIds = new Set(currentRooms?.map(r => r.room_id) || []);
//         const newRoomIds = new Set(validSelectedRooms.map(r => parseInt(r.room_id, 10)));

//         // Get price_per_night for all selected rooms from rooms table
//         const { data: roomsWithPrices, error: roomsError } = await supabase
//             .from('rooms')
//             .select('room_id, price_per_night')
//             .in('room_id', [...newRoomIds]);

//         if (roomsError) {
//             // console.error('Error fetching room prices:', roomsError);
//             return res.status(500).json({ 
//                 message: 'Failed to fetch room prices',
//                 error: roomsError.message 
//             });
//         }

//         // Create a map of room_id to price_per_night
//         const roomPrices = Object.fromEntries(
//             roomsWithPrices.map(room => [room.room_id, room.price_per_night])
//         );

//         // Determine room status based on booking status
//         let newRoomStatus = ROOM_STATUS.BOOKED; // default status
//         switch(status) {
//             case BOOKING_STATUS.CHECKED_IN:
//                 newRoomStatus = ROOM_STATUS.OCCUPIED;
//                 break;
//             case BOOKING_STATUS.CHECKED_OUT:
//                 newRoomStatus = ROOM_STATUS.AVAILABLE;
//                 break;
//             default:
//                 newRoomStatus = ROOM_STATUS.BOOKED;
//         }

//         // Find rooms to be freed (set to Available)
//         const roomsToFree = [...currentRoomIds].filter(id => !newRoomIds.has(id));
//         if (roomsToFree.length > 0 && roomsToFree.every(id => !isNaN(id) && id > 0)) {
//             // console.log('Setting old rooms to Available:', roomsToFree);
//             await supabase
//                 .from('rooms')
//                 .update({ status: ROOM_STATUS.AVAILABLE })
//                 .in('room_id', roomsToFree);
//         }

//         // Update status of new rooms
//         if (validSelectedRooms.length > 0) {
//             const validRoomIds = [...newRoomIds].filter(id => !isNaN(id) && id > 0);
//             if (validRoomIds.length > 0) {
//                 // console.log(`Setting new rooms to ${newRoomStatus}:`, validRoomIds);
//                 await supabase
//                     .from('rooms')
//                     .update({ status: newRoomStatus })
//                     .in('room_id', validRoomIds);
//             }
//         }

//         // Handle removed rooms FIRST (update with tracking, don't delete)
//         if (removed_rooms && removed_rooms.length > 0) {
//             console.log('════════════════════════════════════════════════════════════');
//             console.log('🗑️ PROCESSING REMOVED ROOMS (SOFT DELETE WITH TRACKING)');
//             console.log('════════════════════════════════════════════════════════════');
            
//             for (const removedRoom of removed_rooms) {
//                 const roomId = parseInt(removedRoom.room_id);
//                 const daysUsed = removedRoom.days_used || 0;
//                 const priceCharged = removedRoom.price_charged || 0;
                
//                 console.log(`\n📍 Room ID: ${roomId}`);
//                 console.log(`📌 Days Used: ${daysUsed}`);
//                 console.log(`💰 Price Charged: ₹${priceCharged}`);
                
//                 // UPDATE the room with tracking columns (soft delete - don't actually remove)
//                 const { error: updateError } = await supabase
//                     .from('booking_rooms')
//                     .update({
//                         is_removed: true,
//                         removed_at: new Date().toISOString(),
//                         days_used: daysUsed,
//                         price_charged: priceCharged
//                     })
//                     .eq('booking_id', bookingId)
//                     .eq('room_id', roomId);

//                 if (updateError) {
//                     console.error(`❌ Error updating removed room ${roomId}:`, updateError.message);
//                 } else {
//                     console.log(`✅ Room ${roomId} marked as removed with tracking data`);
//                     console.log(`   is_removed: true`);
//                     console.log(`   removed_at: ${new Date().toISOString()}`);
//                     console.log(`   days_used: ${daysUsed}`);
//                     console.log(`   price_charged: ₹${priceCharged}`);
//                 }
//             }
//             console.log('════════════════════════════════════════════════════════════\n');
//         }

//         // Delete only the OLD room assignments that are NOT being kept
//         // But PRESERVE the removed rooms (those with is_removed = true)
//         const activeRoomIds = new Set(selected_rooms.map(r => parseInt(r.room_id)));
        
//         // First, get all current rooms to find which ones to delete
//         const { data: allCurrentRooms, error: fetchCurrentRoomsError } = await supabase
//             .from('booking_rooms')
//             .select('room_id, is_removed')
//             .eq('booking_id', bookingId);

//         if (fetchCurrentRoomsError) {
//             console.error('Error fetching current rooms:', fetchCurrentRoomsError);
//         } else if (allCurrentRooms) {
//             // Delete only ACTIVE rooms (is_removed = false) that are no longer in selected rooms
//             const roomsToDelete = allCurrentRooms
//                 .filter(r => r.is_removed === false && !activeRoomIds.has(r.room_id))
//                 .map(r => r.room_id);
            
//             if (roomsToDelete.length > 0) {
//                 console.log(`🗑️ Deleting old room assignments: ${roomsToDelete.join(', ')}`);
//                 const { error: deleteOldRoomsError } = await supabase
//                     .from('booking_rooms')
//                     .delete()
//                     .eq('booking_id', bookingId)
//                     .in('room_id', roomsToDelete);

//                 if (deleteOldRoomsError) {
//                     console.error('Error deleting old room assignments:', deleteOldRoomsError);
//                 }
//             }
//         }

//         // Insert NEW room assignments (skip rooms that already exist and are not removed)
//         const existingActiveRoomIds = new Set(
//             (allCurrentRooms || [])
//                 .filter(r => r.is_removed === false)
//                 .map(r => r.room_id)
//         );
        
//         const roomAssignmentsToInsert = selected_rooms
//             .filter(room => !existingActiveRoomIds.has(parseInt(room.room_id)))
//             .map(room => ({
//                 booking_id: bookingId,
//                 room_id: parseInt(room.room_id),
//                 price_per_night: room.price_per_night || roomPrices[room.room_id], // ✅ PRIORITY: Use frontend price, fallback to DB
//                 uses_nightly_rates: room.uses_nightly_rates || false,
//                 nightly_rates: room.uses_nightly_rates ? room.nightly_rates : null, // Direct array, no JSON.stringify
//                 is_removed: false,
//                 days_used: 0,
//                 price_charged: 0
//             }));

//         if (roomAssignmentsToInsert.length > 0) {
//             console.log(`📝 Inserting new room assignments: ${roomAssignmentsToInsert.map(r => r.room_id).join(', ')}`);
//             const { error: insertRoomsError } = await supabase
//                 .from('booking_rooms')
//                 .insert(roomAssignmentsToInsert);

//             if (insertRoomsError) {
//                 console.error('Error inserting room assignments:', insertRoomsError);
//                 return res.status(500).json({ 
//                     message: 'Failed to add new room assignments',
//                     error: insertRoomsError.message 
//                 });
//             }
//             console.log('✅ New room assignments inserted successfully');
//         } else {
//             console.log('ℹ️ No new rooms to insert (all rooms already exist or are removed)');
//         }

//         // ✅ Room status already updated above in the section that handles room assignments
//         // Removing duplicate update to prevent conflicting changes

//         // Update primary guest in customers table first
//         const { data: existingCustomer, error: customerFetchError } = await supabase
//             .from('customers')
//             .select('cust_id')
//             .eq('cust_id', existingBooking.cust_id)
//             .single();

//         if (customerFetchError) {
//             // console.error('Error fetching customer:', customerFetchError);
//             return res.status(500).json({ 
//                 message: 'Failed to fetch customer information',
//                 error: customerFetchError.message 
//             });
//         }

//         // Update customer information
//         const { error: customerUpdateError } = await supabase
//             .from('customers')
//             .update({
//                 name: primary_guest.name,
//                 phone: primary_guest.phone,
//                 email: primary_guest.email,
//                 gst_number: primary_guest.gst_number,
//                 meal_plan: primary_guest.meal_plan,
//                 id_proof: primary_guest.id_proof,
//                 id_proof_number: primary_guest.id_proof_number,
//                 address_line1: primary_guest.address.address_line1,
//                 address_line2: primary_guest.address.address_line2,
//                 city: primary_guest.address.city,
//                 state: primary_guest.address.state,
//                 country: primary_guest.address.country,
//                 pin: primary_guest.address.pin,
//                 updated_at: new Date().toISOString()
//             })
//             .eq('cust_id', existingBooking.cust_id);

//         if (customerUpdateError) {
//             // console.error('Error updating customer:', customerUpdateError);
//             return res.status(500).json({ 
//                 message: 'Failed to update customer information',
//                 error: customerUpdateError.message 
//             });
//         }

//         // Update primary guest in booking_guests
//         const { error: primaryGuestError } = await supabase
//             .from('booking_guests')
//             .update({
//                 name: primary_guest.name,
//                 email: primary_guest.email,
//                 phone: primary_guest.phone,
//                 id_proof: primary_guest.id_proof,
//                 id_proof_number: primary_guest.id_proof_number,
//                 meal_plan: primary_guest.meal_plan,
//                 gst_number: primary_guest.gst_number,
//                 updated_at: new Date().toISOString()
//             })
//             .eq('booking_id', bookingId)
//             .eq('is_primary', true);

//         if (primaryGuestError) {
//             // console.error('Error updating primary guest:', primaryGuestError);
//             return res.status(500).json({ 
//                 message: 'Failed to update primary guest information',
//                 error: primaryGuestError.message 
//             });
//         }

//         // Handle additional guests
//         if (additional_guests && additional_guests.length > 0) {
//             // First delete existing additional guests
//             const { error: deleteGuestsError } = await supabase
//                 .from('booking_guests')
//                 .delete()
//                 .eq('booking_id', bookingId)
//                 .eq('is_primary', false);

//             if (deleteGuestsError) {
//                 // console.error('Error deleting additional guests:', deleteGuestsError);
//                 return res.status(500).json({ 
//                     message: 'Failed to update additional guests',
//                     error: deleteGuestsError.message 
//                 });
//             }

//             // Add new additional guests
//             const guestsToAdd = additional_guests.map(guest => ({
//                 booking_id: bookingId,
//                 name: guest.name,
//                 id_proof: guest.id_proof,
//                 id_proof_number: guest.id_proof_number,
//                 is_primary: false,
//                 created_at: new Date().toISOString()
//             }));

//             const { error: insertGuestsError } = await supabase
//                 .from('booking_guests')
//                 .insert(guestsToAdd);

//             if (insertGuestsError) {
//                 // console.error('Error inserting additional guests:', insertGuestsError);
//                 return res.status(500).json({ 
//                     message: 'Failed to add additional guests',
//                     error: insertGuestsError.message 
//                 });
//             }
//         }

//         // Fetch and return updated booking details
//         const { data: updatedBooking, error: fetchError } = await supabase
//             .from('bookings')
//             .select(`
//                 *,
//                 customers (*),
//                 booking_rooms (
//                     *,
//                     rooms:room_id (*)
//                 ),
//                 booking_guests (*)
//             `)
//             .eq('booking_id', bookingId)
//             .single();

//         if (fetchError) {
//             // console.error('Error fetching updated booking:', fetchError);
//             return res.status(200).json({ 
//                 message: 'Booking updated successfully, but failed to fetch updated details',
//                 booking_id: bookingId
//             });
//         }

//         // console.log('=== UPDATE COMPLETED SUCCESSFULLY ===');
//         return res.status(200).json({
//             message: 'Booking updated successfully',
//             data: updatedBooking
//         });

//     } catch (error) {
//         // console.error('=== ERROR IN UPDATE BOOKING ===');
//         // console.error('Error details:', {
//         //     message: error.message,
//         //     code: error.code,
//         //     hint: error.hint,
//         //     details: error.details
//         // });

//         // Send appropriate error message based on error type
//         if (error.code === '23505') {
//             return res.status(409).json({
//                 message: 'This booking conflicts with another booking',
//                 error: error.detail
//             });
//         } else if (error.code === '23503') {
//             return res.status(400).json({
//                 message: 'Invalid reference to room or customer',
//                 error: error.detail
//             });
//         } else if (error.code === '22P02') {
//             return res.status(400).json({
//                 message: 'Invalid data type provided',
//                 error: 'Please check all numeric and date fields. Make sure room IDs and prices are valid numbers.'
//             });
//         }

//         return res.status(500).json({
//             message: 'Failed to update booking',
//             error: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred',
//             requestId: new Date().getTime()
//         });
//     }
// };

// const getAvailableRooms = async (req, res) => {
//     try {
//         const { roomType, checkInDate, checkOutDate, currentBookingId } = req.query;

//         // Get all rooms of the specified type
//         const { data: rooms, error: roomError } = await supabase
//             .from('rooms')
//             .select('*')
//             .eq('type', roomType);

//         if (roomError) {
//             // console.error('Error fetching rooms:', roomError);
//             return res.status(500).json({
//                 error: 'Failed to fetch rooms',
//                 details: roomError.message
//             });
//         }

//         // Get all bookings that overlap with the specified date range
//         const { data: bookings, error: bookingError } = await supabase
//             .from('bookings')
//             .select('*')
//             .or(`checkin_date.lte.${checkOutDate},checkout_date.gte.${checkInDate}`)
//             .not('status', 'eq', 'Checked-out');

//         if (bookingError) {
//             // console.error('Error fetching bookings:', bookingError);
//             return res.status(500).json({
//                 error: 'Failed to fetch bookings',
//                 details: bookingError.message
//             });
//         }

//         // Filter out the current booking if currentBookingId is provided
//         const relevantBookings = currentBookingId
//             ? bookings.filter(booking => booking.booking_id !== parseInt(currentBookingId))
//             : bookings;

//         // Get room IDs that are already booked for this period
//         const bookedRoomIds = new Set(relevantBookings.map(booking => booking.room_id));

//         // Filter available rooms
//         const availableRooms = rooms.filter(room => !bookedRoomIds.has(room.room_id));

//         return res.json(availableRooms);
//     } catch (error) {
//         // console.error('Error fetching available rooms:', error);
//         return res.status(500).json({
//             error: 'Failed to fetch available rooms',
//             details: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };

// module.exports = {
//     updateBooking,
//     getAvailableRooms
// };



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
            removed_rooms = [],
            checkin_date,
            checkout_date,
            checkin_time,
            checkout_time,
            
            total_amount,
            payment_status,
            booking_status,
        } = req.body;
        
        // ✅ RECEIVED DATA LOG
        console.log('\n╔═══════════════════════════════════════════════════════════╗');
        console.log('║      📥 BOOKING UPDATE REQUEST RECEIVED FROM FRONTEND     ║');
        console.log('╚═══════════════════════════════════════════════════════════╝');
        console.log(`📌 Booking ID: ${bookingId}`);
        console.log(`📌 User ID: ${user_id}`);
        console.log('───────────────────────────────────────────────────────────');
        console.log('data received for update:', {  
            primary_guest,
            additional_guests,
            selected_rooms,
            removed_rooms,
            checkin_date,
            checkout_date,
            checkin_time,
            checkout_time,
            total_amount,
            payment_status,
            booking_status,
        });
        console.log('╚═══════════════════════════════════════════════════════════╝\n');

        // Validate data
        


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

        // ✅ CHECK TOTAL AMOUNT INCREASE & AUTO-SET PAYMENT STATUS
        console.log('\n╔═══════════════════════════════════════════════════════════╗');
        console.log('║     💰 TOTAL AMOUNT COMPARISON - AUTO PAYMENT STATUS       ║');
        console.log('╚═══════════════════════════════════════════════════════════╝');
        
        const originalTotalAmount = parseFloat(existingBooking.total_amount) || 0;
        const newTotalAmount = parseFloat(total_amount) || 0;
        const totalDifference = newTotalAmount - originalTotalAmount;
        
        console.log(`\n📊 TOTAL AMOUNT ANALYSIS:`);
        console.log(`   Database (Original): ₹${originalTotalAmount.toFixed(2)}`);
        console.log(`   Frontend (New):      ₹${newTotalAmount.toFixed(2)}`);
        console.log(`   Difference:          ₹${totalDifference.toFixed(2)}`);
        
        // Auto-set payment_status to PARTIAL if total increased
        let finalPaymentStatus = payment_status;
        if (newTotalAmount > originalTotalAmount) {
            console.log(`\n⚠️  TOTAL INCREASED BY ₹${Math.abs(totalDifference).toFixed(2)}`);
            console.log(`   ✅ AUTO-SETTING PAYMENT STATUS TO: PARTIAL`);
            finalPaymentStatus = 'PARTIAL';
        } else if (newTotalAmount < originalTotalAmount) {
            console.log(`\n✅ TOTAL DECREASED BY ₹${Math.abs(totalDifference).toFixed(2)}`);
            console.log(`   📌 Keeping payment status as: ${payment_status}`);
        } else {
            console.log(`\n📌 TOTAL AMOUNT UNCHANGED`);
            console.log(`   📌 Keeping payment status as: ${payment_status}`);
        }
        console.log('═══════════════════════════════════════════════════════════\n');

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

        // ✅ PAYMENT STATUS PROCESSING (Use finalPaymentStatus which may have been auto-set)
        const processedPaymentStatus = finalPaymentStatus ? 
            (finalPaymentStatus.toUpperCase() === 'PAID' ? PAYMENT_STATUS.PAID :
             finalPaymentStatus.toUpperCase() === 'PARTIAL' ? PAYMENT_STATUS.PARTIAL :
             PAYMENT_STATUS.UNPAID) : existingBooking.payment_status;

        console.log('\n╔═══════════════════════════════════════════════════════════╗');
        console.log('║          💳 PAYMENT STATUS PROCESSING & STORAGE            ║');
        console.log('╚═══════════════════════════════════════════════════════════╝');
        console.log(`📥 Received from Frontend: ${payment_status}`);
        console.log(`🔄 Auto-adjusted to: ${finalPaymentStatus}`);
        console.log(`🔄 Converted to: ${processedPaymentStatus}`);
        console.log(`💾 Will be stored in DB: ${processedPaymentStatus}`);
        console.log(`📊 Total Amount: ₹${total_amount}`);
        console.log(`📋 Booking Status: ${status}`);

        console.log('═══════════════════════════════════════════════════════════\n');

        // Update booking information
        const bookingUpdateData = {
            checkin_date,
            checkout_date,
            checkin_time: status === BOOKING_STATUS.CHECKED_IN.toUpperCase() ? (checkin_time || new Date().toISOString()) : checkin_time,
            checkout_time: status === BOOKING_STATUS.CHECKED_OUT.toUpperCase() ? (checkout_time || new Date().toISOString()) : checkout_time,
            nights,
            total_amount,
            payment_status: processedPaymentStatus,
            status,
            nightly_rates: req.body.nightly_rates || null, // Combined nightly rates from all rooms
            updated_at: new Date().toISOString()
        };

        console.log('📝 Booking Update Data (to be sent to DB):');
        console.log({
            payment_status: bookingUpdateData.payment_status,
            total_amount: bookingUpdateData.total_amount,
            status: bookingUpdateData.status,
            updated_at: bookingUpdateData.updated_at
        });

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

        // ✅ SUCCESS LOG - BOOKING UPDATED
        console.log('\n╔═══════════════════════════════════════════════════════════╗');
        console.log('║     ✅ BOOKING DATA SUCCESSFULLY UPDATED IN DATABASE        ║');
        console.log('╚═══════════════════════════════════════════════════════════╝');
        console.log(`✅ Booking ID: ${bookingId}`);
        console.log(`✅ Payment Status Updated To: ${processedPaymentStatus}`);
        console.log(`✅ Total Amount: ₹${total_amount}`);
        console.log(`✅ Booking Status: ${status}`);
        console.log(`✅ Updated At: ${new Date().toISOString()}`);
        console.log('═══════════════════════════════════════════════════════════\n');

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

        // 🔍 DETAILED CONSOLE LOGGING: Show received rooms data
        console.log('\n════════════════════════════════════════════════════════════');
        console.log('📥 RECEIVED FROM FRONTEND - validSelectedRooms:');
        console.log('════════════════════════════════════════════════════════════');
        validSelectedRooms.forEach((room, idx) => {
            console.log(`\n[${idx + 1}] Room ${room.room_id}:`);
            console.log(`   room_type: ${room.room_type}`);
            console.log(`   room_number: ${room.room_number}`);
            console.log(`   price_per_night: ${room.price_per_night || 'null (using nightly rates)'}`);
            console.log(`   uses_nightly_rates: ${room.uses_nightly_rates}`);
            if (room.nightly_rates && room.nightly_rates.length > 0) {
                console.log(`   nightly_rates: ${room.nightly_rates.length} rates = [${room.nightly_rates.map(r => r.rate).join(', ')}]`);
            } else {
                console.log(`   nightly_rates: null`);
            }
            console.log(`   status: ${room.status}`);
        });
        console.log('\n════════════════════════════════════════════════════════════');
        console.log(`Current rooms in DB: [${[...currentRoomIds].join(', ')}]`);
        console.log(`New rooms in request: [${[...newRoomIds].join(', ')}]`);
        console.log('════════════════════════════════════════════════════════════\n');

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
            // console.log('Setting old rooms to Available:', roomsToFree);
            await supabase
                .from('rooms')
                .update({ status: ROOM_STATUS.AVAILABLE })
                .in('room_id', roomsToFree);
        }

        // Update status of new rooms
        if (validSelectedRooms.length > 0) {
            const validRoomIds = [...newRoomIds].filter(id => !isNaN(id) && id > 0);
            if (validRoomIds.length > 0) {
                // console.log(`Setting new rooms to ${newRoomStatus}:`, validRoomIds);
                await supabase
                    .from('rooms')
                    .update({ status: newRoomStatus })
                    .in('room_id', validRoomIds);
            }
        }

        // 🎯 3-CASE ROOM MANAGEMENT LOGIC
        console.log('\n╔═══════════════════════════════════════════════════════════╗');
        console.log('║             🎯 3-CASE ROOM MANAGEMENT                     ║');
        console.log('╚═══════════════════════════════════════════════════════════╝');
        
        // Determine which CASE we're in
        const hasNewRooms = validSelectedRooms.length > currentRoomIds.size;
        const hasRemovedRooms = removed_rooms && removed_rooms.length > 0;
        
        let caseType = 'CASE 1';
        if (hasNewRooms) {
            caseType = hasRemovedRooms ? 'CASE 3' : 'CASE 2';
        }
        
        console.log(`\n🎯 Detected: ${caseType}`);
        console.log(`   Current rooms: ${currentRoomIds.size}`);
        console.log(`   Selected rooms: ${validSelectedRooms.length}`);
        console.log(`   Removed rooms: ${removed_rooms?.length || 0}`);
        
        // ╔═══════════════════════════════════════════════════════════╗
        // ║ 🟢 CASE 1: Sirf Date / Price Edit (NO room add/remove)   ║
        // ╚═══════════════════════════════════════════════════════════╝
        if (caseType === 'CASE 1') {
            console.log('\n📋 CASE 1: Date/Price Edit Only');
            console.log('   ✅ Rooms remain same');
            console.log('   ✅ Update prices in booking_rooms (if changed)');
            console.log('   ❌ No deletions, no removals table entry');
            
            // Update existing rooms with new prices if they changed
            let allNightlyRates = []; // Collect all nightly rates for bookings table as flat array
            
            for (const room of validSelectedRooms) {
                const roomId = parseInt(room.room_id);
                const updateData = {
                    price_per_night: room.price_per_night || roomPrices[roomId],
                    uses_nightly_rates: room.uses_nightly_rates || false,
                    ...(room.uses_nightly_rates && room.nightly_rates ? {
                        nightly_rates: room.nightly_rates
                    } : {})
                };
                
                // Collect nightly rates if using nightly pricing
                if (room.uses_nightly_rates && room.nightly_rates) {
                    // Add room_id to each nightly rate and push to flat array
                    allNightlyRates.push(...room.nightly_rates.map(nr => ({
                        ...nr,
                        room_id: roomId
                    })));
                }
                
                await supabase
                    .from('booking_rooms')
                    .update(updateData)
                    .eq('booking_id', bookingId)
                    .eq('room_id', roomId);
                    
                console.log(`   ✅ Updated Room ${roomId}: price=₹${updateData.price_per_night}, uses_nightly=${updateData.uses_nightly_rates}`);
            }
            
            // Update bookings table with combined nightly rates
            if (allNightlyRates.length > 0) {
                await supabase
                    .from('bookings')
                    .update({ nightly_rates: allNightlyRates })
                    .eq('booking_id', bookingId);
                console.log(`   ✅ Stored nightly_rates in bookings table: ${allNightlyRates.length} rates total`);
            }
        }
        
        // ╔═══════════════════════════════════════════════════════════╗
        // ║ 🔵 CASE 2: Existing Rooms + NEW Room ADD                 ║
        // ╚═══════════════════════════════════════════════════════════╝
        else if (caseType === 'CASE 2') {
            console.log('\n📋 CASE 2: Existing Rooms + New Room Add');
            console.log('   ✅ Existing rooms: unchanged');
            console.log('   ✅ New room: INSERT with prorated price');
            console.log('   ❌ No removals table entry');
            
            // Find which rooms are NEW (not in current)
            const newRoomsToAdd = validSelectedRooms.filter(r => 
                !currentRoomIds.has(parseInt(r.room_id))
            );
            
            // Insert new rooms only
            if (newRoomsToAdd.length > 0) {
                let allNightlyRates = []; // Collect all nightly rates for bookings table as flat array
                
                // 🎯 FIRST: Collect nightly rates from EXISTING rooms
                const existingRoomIds = validSelectedRooms
                    .filter(r => currentRoomIds.has(parseInt(r.room_id)))
                    .filter(r => r.uses_nightly_rates && r.nightly_rates);
                
                console.log(`\n   📊 Collecting nightly rates:`);
                console.log(`      Existing rooms with nightly rates: ${existingRoomIds.length}`);
                
                existingRoomIds.forEach(room => {
                    allNightlyRates.push(...room.nightly_rates.map(nr => ({
                        ...nr,
                        room_id: room.room_id
                    })));
                    console.log(`      ✅ Room ${room.room_id}: ${room.nightly_rates.length} nightly rates`);
                });
                
                // 🎯 THEN: Map new rooms and collect their nightly rates
                const roomsToInsert = newRoomsToAdd.map(room => {
                    // Always use price_per_night if provided, or use room's default price
                    const finalPrice = room.price_per_night || roomPrices[room.room_id];
                    
                    const roomData = {
                        booking_id: bookingId,
                        room_id: parseInt(room.room_id),
                        price_per_night: finalPrice,  // ✅ Always provide a price (required by DB)
                        uses_nightly_rates: room.uses_nightly_rates || false
                    };
                    
                    // Add nightly_rates if using nightly pricing
                    if (room.uses_nightly_rates && room.nightly_rates) {
                        roomData.nightly_rates = room.nightly_rates;
                        allNightlyRates.push(...room.nightly_rates.map(nr => ({
                            ...nr,
                            room_id: room.room_id
                        })));
                        console.log(`      ✅ New Room ${room.room_id}: ${room.nightly_rates.length} nightly rates (base price: ₹${finalPrice})`);
                    }
                    
                    return roomData;
                });
                
                // Insert rooms to database
                const { error: insertError } = await supabase
                    .from('booking_rooms')
                    .insert(roomsToInsert);
                    
                if (insertError) {
                    console.error(`   ❌ Error inserting rooms: ${insertError.message}`);
                } else {
                    console.log(`\n   ✅ STORED IN booking_rooms TABLE:`);
                    roomsToInsert.forEach((room, idx) => {
                        console.log(`\n      [${idx + 1}] Room ${room.room_id}:`);
                        console.log(`          booking_id: ${room.booking_id}`);
                        console.log(`          price_per_night: ${room.price_per_night || 'null'}`);
                        console.log(`          uses_nightly_rates: ${room.uses_nightly_rates}`);
                        if (room.nightly_rates && room.nightly_rates.length > 0) {
                            console.log(`          nightly_rates: ${room.nightly_rates.length} rates = [${room.nightly_rates.map(r => r.rate).join(', ')}]`);
                        }
                    });
                    console.log(`\n   ✅ Inserted ${newRoomsToAdd.length} new room(s) to booking_rooms table`);
                    
                    // 🎯 Update bookings table with COMBINED nightly rates from ALL rooms
                    if (allNightlyRates.length > 0) {
                        // Get existing nightly rates from booking
                        const { data: bookingData } = await supabase
                            .from('bookings')
                            .select('nightly_rates')
                            .eq('booking_id', bookingId)
                            .single();
                        
                        const existingRates = bookingData?.nightly_rates || [];
                        // Merge flat arrays by combining all nightly rates
                        const mergedRates = Array.isArray(existingRates) 
                            ? [...existingRates, ...allNightlyRates]
                            : allNightlyRates;
                        
                        await supabase
                            .from('bookings')
                            .update({ nightly_rates: mergedRates })
                            .eq('booking_id', bookingId);
                        
                        console.log(`\n   ✅ UPDATED bookings TABLE with combined nightly_rates:`);
                        console.log(`      Total rates: ${mergedRates.length}`);
                        mergedRates.forEach(rate => {
                            console.log(`      Room ${rate.room_id} - Night ${rate.night}: ₹${rate.rate}`);
                        });
                        console.log(`════════════════════════════════════════════════════════════\n`);
                    }
                }
            }
        }
        
        // ╔═══════════════════════════════════════════════════════════╗
        // ║ 🔴 CASE 3: Existing Room REMOVE                          ║
        // ║    3A: used_nights ≥ 1 → INSERT to removals table        ║
        // ║    3B: used_nights = 0 → NO removals table entry         ║
        // ╚═══════════════════════════════════════════════════════════╝
        else if (caseType === 'CASE 3') {
            console.log('\n📋 CASE 3: Room Removal');
            
            // Find which rooms are being removed (in current but not in selected)
            const roomsBeingRemoved = [...currentRoomIds].filter(id => 
                !validSelectedRooms.map(r => parseInt(r.room_id)).includes(id)
            );
            
            if (roomsBeingRemoved.length > 0) {
                // Process each removed room
                for (const roomId of roomsBeingRemoved) {
                    const removedRoom = removed_rooms.find(r => parseInt(r.room_id) === roomId);
                    const usedNights = removedRoom?.days_used || 0;
                    const priceCharged = removedRoom?.price_charged || 0;
                    
                    console.log(`\n   🗑️  Room ${roomId}:`);
                    console.log(`       Days used: ${usedNights}`);
                    console.log(`       Price charged: ₹${priceCharged}`);
                    
                    // ✅ CASE 3A: used_nights ≥ 1 → INSERT to booking_room_removals
                    if (usedNights >= 1) {
                        console.log(`       ✅ Used ≥ 1 night → INSERT to booking_room_removals`);
                        
                        const { error: insertError } = await supabase
                            .from('booking_room_removals')
                            .insert({
                                booking_id: bookingId,
                                room_id: roomId,
                                used_nights: usedNights,
                                price_charged: priceCharged,
                                removed_at: new Date().toISOString()
                            });
                            
                        if (insertError) {
                            console.error(`       ❌ Error inserting removal: ${insertError.message}`);
                        } else {
                            console.log(`       ✅ Recorded in booking_room_removals`);
                        }
                    } 
                    // ❌ CASE 3B: used_nights = 0 → NO entry
                    else {
                        console.log(`       ✅ Used = 0 nights → NO removals table entry`);
                    }
                    
                    // DELETE from booking_rooms (in both CASE 3A and 3B)
                    await supabase
                        .from('booking_rooms')
                        .delete()
                        .eq('booking_id', bookingId)
                        .eq('room_id', roomId);
                        
                    console.log(`       ✅ Deleted from booking_rooms`);
                }
            }
            
            // Also handle any NEW rooms being added in CASE 3
            const newRoomsInCase3 = validSelectedRooms.filter(r => 
                !currentRoomIds.has(parseInt(r.room_id))
            );
            
            if (newRoomsInCase3.length > 0) {
                const roomsToInsert = newRoomsInCase3.map(room => ({
                    booking_id: bookingId,
                    room_id: parseInt(room.room_id),
                    price_per_night: room.price_per_night || roomPrices[room.room_id],
                    uses_nightly_rates: room.uses_nightly_rates || false,
                    nightly_rates: room.uses_nightly_rates ? room.nightly_rates : null
                }));
                
                await supabase
                    .from('booking_rooms')
                    .insert(roomsToInsert);
                    
                console.log(`   ✅ Inserted ${newRoomsInCase3.length} new room(s)`);
            }
        }
        
        console.log('\n═══════════════════════════════════════════════════════════\n');

        // ✅ Update room statuses for all selected rooms
        const allRoomIds = validSelectedRooms.map(r => parseInt(r.room_id));
        if (allRoomIds.length > 0) {
            await supabase
                .from('rooms')
                .update({ status: roomStatus })
                .in('room_id', allRoomIds);
                
            console.log(`✅ Updated status to "${roomStatus}" for ${allRoomIds.length} rooms`);
        }

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

        // ✅ FINAL SUCCESS RESPONSE LOG
        console.log('\n╔═══════════════════════════════════════════════════════════╗');
        console.log('║     ✅ SENDING SUCCESS RESPONSE TO FRONTEND               ║');
        console.log('╚═══════════════════════════════════════════════════════════╝');
        console.log(`✅ Booking ID: ${bookingId}`);
        console.log(`✅ Payment Status in DB: ${updatedBooking.payment_status}`);
        console.log(`✅ Total Amount: ₹${updatedBooking.total_amount}`);
        console.log(`✅ Status: ${updatedBooking.status}`);
        console.log(`✅ Updated At: ${updatedBooking.updated_at}`);
        console.log(`✅ Message: Booking updated successfully`);
        console.log('═══════════════════════════════════════════════════════════\n');

        // console.log('=== UPDATE COMPLETED SUCCESSFULLY ===');
        return res.status(200).json({
            message: 'Booking updated successfully',
            success: true,
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