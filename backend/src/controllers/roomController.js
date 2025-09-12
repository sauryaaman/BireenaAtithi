const supabase = require('../config/db');

// Get unique room types with base price and available count
const getRoomTypes = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        
        // Get all rooms
        const { data: rooms, error: roomsError } = await supabase
            .from('rooms')
            .select('room_id, room_type, price_per_night, status')
            .eq('user_id', user_id)
            .eq('status', 'Available')
            .order('room_type');

        if (roomsError) throw roomsError;

        // Get current bookings to check availability
        const { data: bookings, error: bookingsError } = await supabase
            .from('bookings')
            .select('room_id')
            .in('status', ['CHECKED_IN', 'CONFIRMED']);

        if (bookingsError) throw bookingsError;

        // Get booked room IDs
        const bookedRoomIds = new Set(bookings.map(booking => booking.room_id));

        // Filter out booked rooms
        const availableRooms = rooms.filter(room => !bookedRoomIds.has(room.room_id));

        // Group rooms by type with count and price
        const roomTypeMap = availableRooms.reduce((map, room) => {
            if (!map.has(room.room_type)) {
                map.set(room.room_type, {
                    room_type: room.room_type,
                    price_per_night: room.price_per_night,
                    available_count: 1
                });
            } else {
                const typeInfo = map.get(room.room_type);
                typeInfo.available_count++;
            }
            return map;
        }, new Map());

        // Convert map to array
        const uniqueTypes = Array.from(roomTypeMap.values());

        res.status(200).json(uniqueTypes);
    } catch (error) {
        // console.error('Error fetching room types:', error);
        res.status(500).json({ message: 'Server error while fetching room types' });
    }
};

// Get available rooms by type and optionally by date range
const getAvailableRooms = async (req, res) => {
    const { roomType, checkIn, checkOut, numberOfRooms = "1" } = req.query;
    const user_id = req.user.user_id;
    const roomsNeeded = parseInt(numberOfRooms);

    if (!roomType) {
        return res.status(400).json({ 
            message: 'Room type is required' 
        });
    }

    try {
        // console.log('Searching for rooms with type:', roomType);
        // console.log('User ID:', user_id);
        
        // First, get all rooms of the specified type
        const { data: allRooms, error: fetchError } = await supabase
            .from('rooms')
            .select('*')
            .eq('status', 'Available')
            .eq('user_id', user_id);
            
        // console.log('All available rooms:', allRooms);

        if (fetchError) {
            // console.error('Error fetching rooms:', fetchError);
            throw fetchError;
        }

        // Filter rooms by type (case-insensitive)
        const roomsOfType = allRooms.filter(room => 
            room.room_type && room.room_type.toUpperCase() === roomType.toUpperCase()
        );

        // console.log('Rooms of requested type:', roomsOfType);

        // Format dates if provided
        let formattedCheckIn = null;
        let formattedCheckOut = null;
        let numberOfNights = 0;
        
        if (checkIn && checkOut) {
            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);
            
            // Validate dates
            if (checkInDate >= checkOutDate) {
                return res.status(400).json({
                    message: 'Check-out date must be after check-in date'
                });
            }

            // Calculate number of nights
            numberOfNights = Math.ceil(
                (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
            );

            formattedCheckIn = checkInDate.toISOString();
            formattedCheckOut = checkOutDate.toISOString();
        }
        let availableRooms = roomsOfType;

        // Only check bookings if dates are provided
        if (formattedCheckIn && formattedCheckOut) {
            // Get all bookings that overlap with the requested date range
            const { data: bookings, error: bookingsError } = await supabase
                .from('bookings')
                .select('room_id')
                .or(`and(checkin_date.lte.${formattedCheckOut},checkout_date.gte.${formattedCheckIn})`)
                .in('status', ['CHECKED_IN', 'CONFIRMED']);

            if (bookingsError) {
                console.error('Booking query error:', bookingsError);
                throw bookingsError;
            }

            if (!bookings) {
                console.error('No bookings data returned from query');
                throw new Error('No bookings data returned from query');
            }

            // Filter out rooms that have bookings in the requested date range
            const bookedRoomIds = new Set(bookings.map(booking => booking.room_id));
            availableRooms = roomsOfType.filter(room => !bookedRoomIds.has(room.room_id));
        }

        // Check if we have enough rooms available
        if (availableRooms.length < roomsNeeded) {
            return res.status(200).json({
                success: false,
                message: `Only ${availableRooms.length} rooms available of type ${roomType}. You requested ${roomsNeeded} rooms.`,
                availableCount: availableRooms.length,
                rooms: availableRooms,
                pricing: checkIn && checkOut ? {
                    pricePerNight: availableRooms[0]?.price_per_night || 0,
                    numberOfNights: numberOfNights,
                    totalPrice: (availableRooms[0]?.price_per_night || 0) * numberOfNights * roomsNeeded
                } : null
            });
        }

        // console.log('Available rooms found:', availableRooms.length);
        res.status(200).json({
            success: true,
            message: `${availableRooms.length} rooms available`,
            availableCount: availableRooms.length,
            rooms: availableRooms,
            pricing: checkIn && checkOut ? {
                pricePerNight: availableRooms[0]?.price_per_night || 0,
                numberOfNights: numberOfNights,
                totalPrice: (availableRooms[0]?.price_per_night || 0) * numberOfNights * roomsNeeded
            } : null
        });
    } catch (error) {
        // console.error('Error checking room availability:', error);
        res.status(500).json({ 
            message: 'Server error while checking room availability',
            error: error.message || 'Unknown error'
        });
    }
};

// Add a new room
const addRoom = async (req, res) => {
    try {
        const { room_number, room_type, price_per_night, capacity } = req.body;
        const user_id = req.user.user_id;

        // Validate capacity
        if (!capacity || capacity < 1) {
            return res.status(400).json({ message: 'Room capacity must be at least 1' });
        }

        const { data: room, error } = await supabase
            .from('rooms')
            .insert([
                { user_id, room_number, room_type, price_per_night, capacity }
            ])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(room);
    } catch (error) {
        // console.log(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all rooms for a hotel
const getRooms = async (req, res) => {
    try {
        const user_id = req.user.user_id;

        const { data: rooms, error } = await supabase
            .from('rooms')
            .select(`
                *,
                bookings (
                    booking_id,
                    checkin_date,
                    checkout_date,
                    customers (
                        name,
                        phone
                    )
                )
            `)
            .eq('user_id', user_id)
            .order('room_number');

        if (error) throw error;

        res.json(rooms);
        // console.log(rooms);
    } catch (error) {
        // console.log(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update room details
const updateRoom = async (req, res) => {
    try {
        const { room_id } = req.params;
        const { room_number, room_type, price_per_night, status, capacity } = req.body;
        const user_id = req.user.user_id;

        // Validate capacity if it's being updated
        if (capacity !== undefined && capacity < 1) {
            return res.status(400).json({ message: 'Room capacity must be at least 1' });
        }

        const { data: room, error } = await supabase
            .from('rooms')
            .update({ room_number, room_type, price_per_night, status, capacity })
            .eq('room_id', room_id)
            .eq('user_id', user_id)  // Security check
            .select()
            .single();

        if (error) throw error;
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        res.json(room);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete a room
const deleteRoom = async (req, res) => {
    try {
        const { room_id } = req.params;
        const user_id = req.user.user_id;

        const { error } = await supabase
            .from('rooms')
            .delete()
            .eq('room_id', room_id)
            .eq('user_id', user_id);  // Security check

        if (error) throw error;

        res.json({ message: 'Room deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get room history (last 30 days)
const getRoomHistory = async (req, res) => {
    try {
        const { room_id } = req.params;
        const user_id = req.user.user_id;
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: bookings, error } = await supabase
            .from('bookings')
            .select(`
                *,
                customers (
                    name,
                    phone,
                    email
                )
            `)
            .eq('room_id', room_id)
            .gte('checkin_date', thirtyDaysAgo.toISOString())
            .order('checkin_date', { ascending: false });

        if (error) throw error;

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    addRoom,
    getRooms,
    updateRoom,
    deleteRoom,
    getRoomHistory,
    getRoomTypes,
    getAvailableRooms
};
