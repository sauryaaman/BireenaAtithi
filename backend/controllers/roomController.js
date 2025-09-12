const { supabase } = require('../config/supabaseClient');

// Get all rooms
const getAllRooms = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('rooms')
            .select('*')
            .order('room_number');

        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get unique room types with base price
const getRoomTypes = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('rooms')
            .select('room_type, price_per_night')
            .order('room_type');

        if (error) throw error;

        // Get unique room types with their base prices
        const uniqueTypes = Array.from(
            data.reduce((map, room) => {
                if (!map.has(room.room_type)) {
                    map.set(room.room_type, {
                        room_type: room.room_type,
                        price_per_night: room.price_per_night
                    });
                }
                return map;
            }, new Map()).values()
        );

        res.status(200).json(uniqueTypes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get available rooms by type and date range
const getAvailableRooms = async (req, res) => {
    const { roomType, checkIn, checkOut } = req.query;

    if (!roomType || !checkIn || !checkOut) {
        return res.status(400).json({ 
            message: 'Room type and date range are required' 
        });
    }

    try {
        // First, get all rooms of the specified type
        const { data: rooms, error: roomsError } = await supabase
            .from('rooms')
            .select('*')
            .eq('room_type', roomType)
            .eq('status', 'AVAILABLE');

        if (roomsError) throw roomsError;

        // Get all bookings that overlap with the requested date range
        const { data: bookings, error: bookingsError } = await supabase
            .from('bookings')
            .select('room_id')
            .or(`checkin_date.lte.${checkOut},checkout_date.gte.${checkIn}`)
            .in('status', ['CHECKED_IN', 'CONFIRMED']);

        if (bookingsError) throw bookingsError;

        // Filter out rooms that have bookings in the requested date range
        const bookedRoomIds = bookings.map(booking => booking.room_id);
        const availableRooms = rooms.filter(room => !bookedRoomIds.includes(room.room_id));

        res.status(200).json(availableRooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get room by ID
const getRoomById = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('rooms')
            .select('*')
            .eq('room_id', req.params.id)
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ message: 'Room not found' });
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update room status
const updateRoomStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ message: 'Status is required' });
    }

    try {
        const { data, error } = await supabase
            .from('rooms')
            .update({ status: status })
            .eq('room_id', id)
            .select()
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ message: 'Room not found' });
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new room
const createRoom = async (req, res) => {
    const { room_number, room_type, price_per_night, capacity } = req.body;

    if (!room_number || !room_type || !price_per_night || !capacity) {
        return res.status(400).json({ 
            message: 'Room number, type, price, and capacity are required' 
        });
    }

    try {
        const { data, error } = await supabase
            .from('rooms')
            .insert([{ 
                room_number, 
                room_type, 
                price_per_night, 
                capacity,
                status: 'AVAILABLE' 
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllRooms,
    getRoomTypes,
    getAvailableRooms,
    getRoomById,
    updateRoomStatus,
    createRoom
};
