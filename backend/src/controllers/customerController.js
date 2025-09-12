const supabase = require('../config/db');

// Get all customers for a hotel
const getAllCustomers = async (req, res) => {
    try {
        // console.log('--- getAllCustomers START ---');
        const user_id = req.user.user_id;
        // console.log('User ID:', user_id);
        // console.log('Auth Token:', req.headers.authorization);

        // Step 1: Get all rooms for the user
        // console.log('Step 1: Getting rooms for user');
        const { data: userRooms, error: roomsError } = await supabase
            .from('rooms')
            .select('room_id')
            .eq('user_id', user_id);

        if (roomsError) {
            console.error('Error fetching rooms:', roomsError);
            throw roomsError;
        }

        if (!userRooms || userRooms.length === 0) {
            console.log('No rooms found for user');
            return res.json([]);
        }

        const roomIds = userRooms.map(room => room.room_id);
        // console.log('Found room IDs:', roomIds);

        // Step 2: Get all bookings for these rooms
        console.log('Step 2: Getting bookings for rooms');
        const { data: bookings, error: bookingsError } = await supabase
            .from('bookings')
            .select(`
                booking_id,
                cust_id,
                checkin_date,
                checkout_date,
                status,
                total_amount,
                payment_status,
                booking_rooms!inner (
                    booking_room_id,
                    room_id,
                    price_per_night,
                    rooms (
                        room_id,
                        room_number,
                        room_type
                    )
                ),
                customers (
                    cust_id,
                    name,
                    phone,
                    email,
                    id_proof
                ),
                booking_guests (
                    guest_id,
                    name,
                    phone,
                    email,
                    id_proof,
                    is_primary
                )
            `)
            .in('room_id', roomIds)
            .order('created_at', { ascending: false });

        if (bookingsError) {
            // console.error('Error fetching bookings:', bookingsError);
            return res.status(500).json({
                message: 'Error fetching bookings',
                error: bookingsError.message,
                details: bookingsError
            });
        }

        if (!bookings || bookings.length === 0) {
            // console.log('No bookings found');
            return res.json([]);
        }
        
        // console.log('Found bookings:', bookings.length);

        // Transform the data to be customer-centric
        // console.log('Processing booking data');
        const customersMap = new Map();
        
        bookings.forEach(booking => {
            try {
                if (booking.customers && booking.customers[0]) {
                    const customer = booking.customers[0];
                    const customerId = customer.cust_id;
                    
                    if (!customersMap.has(customerId)) {
                        customersMap.set(customerId, {
                            cust_id: customer.cust_id,
                            name: customer.name,
                            phone: customer.phone,
                            email: customer.email,
                            id_proof: customer.id_proof,
                            bookings: []
                        });
                    }
                    
                    const customerData = customersMap.get(customerId);
                    customerData.bookings.push({
                        booking_id: booking.booking_id,
                        checkin_date: booking.checkin_date,
                        checkout_date: booking.checkout_date,
                        status: booking.status,
                        total_amount: booking.total_amount,
                        payment_status: booking.payment_status,
                        rooms: booking.rooms || [],
                        additional_guests: booking.additional_guests || []
                    });
                }
            } catch (err) {
                // console.error('Error processing booking:', err, booking);
            }
        });

        const customers = Array.from(customersMap.values());
        // console.log('Processed customers:', customers.length);

        res.json(customers);
    } catch (error) {
        // console.error('Server error in getAllCustomers:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message,
            details: error.toString()
        });
    }
};

// Get current checked-in customers
const getCurrentCustomers = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        // console.log('Fetching current customers for user:', user_id);

        // Get all current bookings for the user
        const { data: bookings, error: bookingsError } = await supabase
            .from('bookings')
            .select(`
                booking_id,
                cust_id,
                checkin_date,
                checkout_date,
                status,
                total_amount,
                payment_status,
                booking_rooms!inner (
                    booking_room_id,
                    room_id,
                    price_per_night,
                    rooms!inner (
                        room_id,
                        room_number,
                        room_type,
                        user_id
                    )
                ),
                customers (
                    cust_id,
                    name,
                    phone,
                    email,
                    id_proof
                ),
                booking_guests (
                    guest_id,
                    name,
                    phone,
                    email,
                    id_proof,
                    is_primary
                )
            `)
            .eq('booking_rooms.rooms.user_id', user_id)
            .eq('status', 'Checked-in')
            .order('checkin_date', { ascending: false });

        if (bookingsError) {
            // console.error('Error fetching current bookings:', bookingsError);
            return res.status(500).json({
                message: 'Error fetching bookings',
                error: bookingsError.message,
                details: bookingsError
            });
        }

        if (!bookings || bookings.length === 0) {
            return res.json([]);
        }

        // Transform the data to be customer-centric
        // console.log('Processing current customer booking data');
        const customersMap = new Map();
        
        bookings.forEach(booking => {
            try {
                if (booking.customers) {
                    const customer = booking.customers;
                    const customerId = customer.cust_id;
                    
                    if (!customersMap.has(customerId)) {
                        customersMap.set(customerId, {
                            cust_id: customer.cust_id,
                            name: customer.name,
                            phone: customer.phone,
                            email: customer.email,
                            id_proof: customer.id_proof,
                            bookings: []
                        });
                    }
                    
                    const customerData = customersMap.get(customerId);
                    customerData.bookings.push({
                        booking_id: booking.booking_id,
                        checkin_date: booking.checkin_date,
                        checkout_date: booking.checkout_date,
                        status: booking.status,
                        total_amount: booking.total_amount,
                        payment_status: booking.payment_status,
                        rooms: booking.booking_rooms?.map(br => ({
                            room_id: br.rooms.room_id,
                            room_number: br.rooms.room_number,
                            room_type: br.rooms.room_type,
                            price_per_night: br.price_per_night
                        })) || [],
                        additional_guests: booking.booking_guests?.filter(g => !g.is_primary) || []
                    });
                }
            } catch (err) {
                // console.error('Error processing booking:', err, booking);
            }
        });

        const customers = Array.from(customersMap.values());
        // console.log('Processed current customers:', customers.length);

        res.json(customers);
    } catch (error) {
        // console.error('Server error in getCurrentCustomers:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message,
            details: error.toString()
        });
    }
};

// Get past customers (checked-out)
const getPastCustomers = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        // console.log('Fetching past customers for user:', user_id);

        // Get all past bookings for the user
        const { data: bookings, error: bookingsError } = await supabase
            .from('bookings')
            .select(`
                booking_id,
                cust_id,
                checkin_date,
                checkout_date,
                status,
                total_amount,
                payment_status,
                booking_rooms!inner (
                    booking_room_id,
                    room_id,
                    price_per_night,
                    rooms!inner (
                        room_id,
                        room_number,
                        room_type,
                        user_id
                    )
                ),
                customers (
                    cust_id,
                    name,
                    phone,
                    email,
                    id_proof
                ),
                booking_guests (
                    guest_id,
                    name,
                    phone,
                    email,
                    id_proof,
                    is_primary
                )
            `)
            .eq('booking_rooms.rooms.user_id', user_id)
            .eq('status', 'Checked-out')
            .order('checkout_date', { ascending: false });

        if (bookingsError) {
            // console.error('Error fetching past bookings:', bookingsError);
            return res.status(500).json({
                message: 'Error fetching bookings',
                error: bookingsError.message,
                details: bookingsError
            });
        }

        if (!bookings || bookings.length === 0) {
            return res.json([]);
        }

        // Transform the data to be customer-centric
        // console.log('Processing past customer booking data');
        const customersMap = new Map();
        
        bookings.forEach(booking => {
            try {
                if (booking.customers) {
                    const customer = booking.customers;
                    const customerId = customer.cust_id;
                    
                    if (!customersMap.has(customerId)) {
                        customersMap.set(customerId, {
                            cust_id: customer.cust_id,
                            name: customer.name,
                            phone: customer.phone,
                            email: customer.email,
                            id_proof: customer.id_proof,
                            bookings: []
                        });
                    }
                    
                    const customerData = customersMap.get(customerId);
                    customerData.bookings.push({
                        booking_id: booking.booking_id,
                        checkin_date: booking.checkin_date,
                        checkout_date: booking.checkout_date,
                        status: booking.status,
                        total_amount: booking.total_amount,
                        payment_status: booking.payment_status,
                        rooms: booking.booking_rooms?.map(br => ({
                            room_id: br.rooms.room_id,
                            room_number: br.rooms.room_number,
                            room_type: br.rooms.room_type,
                            price_per_night: br.price_per_night
                        })) || [],
                        additional_guests: booking.booking_guests?.filter(g => !g.is_primary) || []
                    });
                }
            } catch (err) {
                // console.error('Error processing booking:', err, booking);
            }
        });

        const customers = Array.from(customersMap.values());
        // console.log('Processed past customers:', customers.length);

        res.json(customers);
    } catch (error) {
        // console.error('Server error in getPastCustomers:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message,
            details: error.toString()
        });
    }
};

// Get customer details with booking history
const getCustomerDetails = async (req, res) => {
    try {
        const { customer_id } = req.params;
        const user_id = req.user.user_id;

        const { data: customer, error } = await supabase
            .from('customers')
            .select(`
                *,
                bookings (
                    booking_id,
                    checkin_date,
                    checkout_date,
                    status,
                    total_amount,
                    payment_status,
                    nights,
                    rooms (
                        room_number,
                        room_type,
                        price_per_night,
                        user_id
                    )
                )
            `)
            .eq('cust_id', customer_id)
            .eq('bookings.rooms.user_id', user_id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ message: 'Customer not found' });
            }
            throw error;
        }

        // Calculate statistics
        const totalVisits = customer.bookings.length;
        const totalSpent = customer.bookings.reduce((sum, booking) => sum + (booking.total_amount || 0), 0);
        const totalNights = customer.bookings.reduce((sum, booking) => sum + (booking.nights || 0), 0);

        res.json({
            ...customer,
            statistics: {
                totalVisits,
                totalSpent,
                totalNights
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update customer details
const updateCustomer = async (req, res) => {
    try {
        const { customer_id } = req.params;
        const updateData = req.body;

        // Remove any sensitive or computed fields
        delete updateData.cust_id;
        delete updateData.created_at;

        const { data: customer, error } = await supabase
            .from('customers')
            .update(updateData)
            .eq('cust_id', customer_id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ message: 'Customer not found' });
            }
            throw error;
        }

        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Search customers
const searchCustomers = async (req, res) => {
    try {
        const { query } = req.query;
        const user_id = req.user.user_id;

        const { data: customers, error } = await supabase
            .from('customers')
            .select(`
                *,
                bookings!inner (
                    rooms (
                        user_id
                    )
                )
            `)
            .eq('bookings.rooms.user_id', user_id)
            .or(`name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
            .order('name');

        if (error) throw error;

        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getAllCustomers,
    getCurrentCustomers,
    getPastCustomers,
    getCustomerDetails,
    updateCustomer,
    searchCustomers
};
