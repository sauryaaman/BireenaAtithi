const supabase = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Get all users (Super Admin only)
const getAllUsers = async (req, res) => {
    try {
        // Get users with their hotel details
        const { data: users, error } = await supabase
            .from('users')
            .select(`
                user_id,
                name,
                email,
                hotel_name,
                owner_phone,
                created_at,
                hotel_details:hotel_details (
                    hotel_name,
                    hotel_logo_url,
                    address_line1,
                    city,
                    state,
                    country,
                    pin_code,
                    gst_number
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            // console.error('Get all users error:', error);
            return res.status(500).json({ message: 'Error fetching users' });
        }

        // Process the data to combine user and hotel details
        const processedUsers = users.map(user => ({
            ...user,
            hotel_details: user.hotel_details || {
                hotel_name: user.hotel_name,
                hotel_logo_url: null,
                address_line1: null,
                city: null,
                state: null,
                country: null,
                pin_code: null,
                gst_number: null
            }
        }));

        res.json(processedUsers);
    } catch (error) {
        // console.error('Get all users error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get specific user details (Super Admin only)
const getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;

        // Get user with hotel details
        const { data: user, error } = await supabase
            .from('users')
            .select(`
                user_id,
                name,
                email,
                hotel_name,
                owner_phone,
                created_at,
                hotel_details:hotel_details (
                    hotel_name,
                    hotel_logo_url,
                    address_line1,
                    city,
                    state,
                    country,
                    pin_code,
                    gst_number
                )
            `)
            .eq('user_id', userId)
            .single();

        if (error) {
            // console.error('Get user details error:', error);
            return res.status(500).json({ message: 'Error fetching user details' });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Process the data
        const processedUser = {
            ...user,
            hotel_details: user.hotel_details || {
                hotel_name: user.hotel_name,
                hotel_logo_url: null,
                address_line1: null,
                city: null,
                state: null,
                country: null,
                pin_code: null,
                gst_number: null
            }
        };

        res.json(processedUser);
    } catch (error) {
        // console.error('Get user details error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get user profile
const getProfile = async (req, res) => {
    try {
        const user_id = req.user.user_id;

        const { data: user, error } = await supabase
            .from('users')
            .select('user_id, name, email, hotel_name, owner_phone, created_at')
            .eq('user_id', user_id)
            .single();

        if (error) throw error;
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        // console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get hotel details
const getHotelDetails = async (req, res) => {
    try {
        const user_id = req.user.user_id;

        const { data: hotelDetails, error } = await supabase
            .from('hotel_details')
            .select(`
                hotel_name,
                hotel_logo_url,
                address_line1,
                city,
                state,
                country,
                pin_code,
                gst_number,
                created_at,
                updated_at
            `)
            .eq('user_id', user_id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // No record found, return empty object
                return res.json({});
            }
            throw error;
        }

        // Log the hotel details for debugging
        // console.log('Fetched hotel details:', hotelDetails);

        res.json(hotelDetails);
    } catch (error) {
        // console.error('Get hotel details error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const { name, hotel_name, owner_phone, email } = req.body;

        // console.log('📝 Update Profile Request:', {
        //     user_id,
        //     requestBody: req.body
        // });

        // Validate required fields
        const requiredFields = ['name', 'hotel_name', 'owner_phone'];
        const missingFields = requiredFields.filter(field => !req.body[field] || !req.body[field].trim());

        // Validate email if provided
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
                // console.log(' Validation Error: Invalid email format');
                return res.status(400).json({
                    message: 'Invalid email format',
                    received: email
                });
            }
        }
        
        if (missingFields.length > 0) {
            // console.log(' Validation Error: Missing required fields:', missingFields);
            return res.status(400).json({ 
                message: 'All required fields must be provided and non-empty',
                missingFields
            });
        }

        // Validate phone number format (10 digits only)
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(owner_phone.trim())) {
            // console.log(' Validation Error: Invalid phone number format');
            return res.status(400).json({
                message: 'Phone number must be exactly 10 digits',
                received: owner_phone
            });
        }

        // Validate name length
        if (name.trim().length < 2 || name.trim().length > 50) {
            // console.log(' Validation Error: Invalid name length');
            return res.status(400).json({
                message: 'Name must be between 2 and 50 characters',
                received: name
            });
        }

        // Validate hotel name length
        if (hotel_name.trim().length < 2 || hotel_name.trim().length > 100) {
            // console.log(' Validation Error: Invalid hotel name length');
            return res.status(400).json({
                message: 'Hotel name must be between 2 and 100 characters',
                received: hotel_name
            });
        }

        // First check if user exists
        const { data: existingUser, error: findError } = await supabase
            .from('users')
            .select('user_id, name, email')
            .eq('user_id', user_id)
            .single();

        if (findError) {
            // console.error(' Error finding user:', findError);
            return res.status(404).json({ 
                message: 'Error finding user',
                error: findError.message
            });
        }

        if (!existingUser) {
            // console.log('User not found:', user_id);
            return res.status(404).json({ message: 'User not found' });
        }

        // console.log(' User found:', existingUser.email);

        // Check if email is being updated and is not already in use
        if (email && email !== existingUser.email) {
            const { data: emailExists } = await supabase
                .from('users')
                .select('user_id')
                .eq('email', email.trim().toLowerCase())
                .neq('user_id', user_id)
                .single();

            if (emailExists) {
                // console.log(' Validation Error: Email already in use');
                return res.status(400).json({
                    message: 'This email is already registered with another account',
                    received: email
                });
            }
        }

        // Update user profile
        const { data: user, error } = await supabase
            .from('users')
            .update({ 
                name: name.trim(),
                hotel_name: hotel_name.trim(),
                owner_phone: owner_phone.trim(),
                ...(email && { email: email.trim().toLowerCase() }),
                updated_at: new Date()
            })
            .eq('user_id', user_id)
            .select()
            .single();

        if (error) {
            // console.error('Update profile error:', error);
            return res.status(500).json({ 
                message: 'Failed to update profile',
                error: error.message,
                details: error
            });
        }

        // console.log(' Profile updated successfully:', {
        //     user_id: user.user_id,
        //     name: user.name,
        //     hotel_name: user.hotel_name
        // });

        res.json(user);
    } catch (error) {
        // console.error(' Unexpected error in updateProfile:', error);
        res.status(500).json({ 
            message: 'An unexpected error occurred',
            error: error.message
        });
    }
};

// Change password
const changePassword = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const { currentPassword, newPassword } = req.body;

        // Get user with password hash
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('password_hash')
            .eq('user_id', user_id)
            .single();

        if (userError || !user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(newPassword, salt);

        // Update password
        const { error: updateError } = await supabase
            .from('users')
            .update({ 
                password_hash: newPasswordHash,
                updated_at: new Date()
            })
            .eq('user_id', user_id);

        if (updateError) throw updateError;

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        // console.error('Change password error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Register new user
const register = async (req, res) => {
    try {
        const { 
            name, 
            email, 
            password, 
            hotel_name, 
            owner_phone,
            address_line1,
            city,
            state,
            country,
            pin_code,
            gst_number,
            
        } = req.body;
        
        // Validate email
        if (!email || !email.trim()) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Check if user exists with normalized email
        const normalizedEmail = email.toLowerCase().trim();
        const { data: existingUser, error: searchError } = await supabase
            .from('users')
            .select('*')
            .ilike('email', normalizedEmail)
            .single();

        if (searchError && searchError.code !== 'PGRST116') {
            throw searchError;
        }

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Get the logo URL from multer-cloudinary middleware
        const logoUrl = req.logoUrl || null;
        // console.log('Logo URL from Cloudinary:', logoUrl);

        // Create user
        const { data: newUser, error: userError } = await supabase
            .from('users')
            .insert([
                { name, email, password_hash, hotel_name, owner_phone }
            ])
            .select()
            .single();

        if (userError) throw userError;

        // Create hotel_details record with logo URL
        const { data: hotelDetails, error: hotelError } = await supabase
            .from('hotel_details')
            .insert([{
                user_id: newUser.user_id,
                hotel_name,
                hotel_logo_url: logoUrl,
                address_line1,
                city,
                state,
                country,
                pin_code,
                gst_number
            }])
            .select()
            .single();

        if (hotelError) {
            // console.error('Error creating hotel details:', hotelError);
            // Continue as user is already created
        }

        // Create token
        const token = jwt.sign(
            { user_id: newUser.user_id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return success response with complete data
        return res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: newUser.user_id,
                name: newUser.name,
                email: newUser.email,
                hotel_name: newUser.hotel_name,
                logo_url: logoUrl // Include logo URL in response
            },
            hotelDetails
        });
    } catch (error) {
        // console.error('Registration error:', error);
        return res.status(500).json({ message: 'Server error during registration' });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email presence
        if (!email || !email.trim()) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Validate password length
        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        // Normalize email
        const normalizedEmail = email.toLowerCase().trim();

        // Get user with normalized email
        const { data: user } = await supabase
            .from('users')
            .select('*')
            .ilike('email', normalizedEmail)
            .single();

        if (!user) {
            return res.status(404).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign(
            { user_id: user.user_id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.user_id,
                name: user.name,
                email: user.email,
                hotel_name: user.hotel_name
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update hotel details
const updateHotelDetails = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const {
            hotel_name,
            address_line1,
            city,
            state,
            country,
            pin_code,
            gst_number
        } = req.body;
        
        // console.log(' Update Hotel Details Request:', {
        //     user_id,
        //     requestBody: req.body,
        //     hasFile: !!req.file
        // });
        
        // Get the logo URL from Cloudinary (similar to registration)
        let hotel_logo_url = req.logoUrl || req.body.hotel_logo_url;
        
        // Validate required fields
        const requiredFields = ['hotel_name', 'address_line1', 'city', 'state', 'country', 'pin_code'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            // console.log(' Validation Error: Missing required fields:', missingFields);
            return res.status(400).json({
                message: 'Missing required fields',
                missingFields
            });
        }

        // Validate PIN code format
        if (!/^\d{6}$/.test(pin_code)) {
            // console.log(' Validation Error: Invalid PIN code format');
            return res.status(400).json({
                message: 'PIN code must be 6 digits'
            });
        }

        // Validate GST number format if provided
        if (gst_number && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst_number)) {
            // console.log('Validation Error: Invalid GST number format');
            return res.status(400).json({
                message: 'Invalid GST number format'
            });
        }

        // Check if hotel details exist
        const { data: existingDetails, error: findError } = await supabase
            .from('hotel_details')
            .select('*')
            .eq('user_id', user_id)
            .single();

        if (findError && findError.code !== 'PGRST116') {
            // console.error(' Error checking existing hotel details:', findError);
            throw findError;
        }

        // console.log(' Existing hotel details check:', existingDetails ? 'Found' : 'Not found');

        let result;
        if (existingDetails) {
            // Update existing record
            const { data, error } = await supabase
                .from('hotel_details')
                .update({
                    hotel_name: hotel_name.trim(),
                    hotel_logo_url,
                    address_line1: address_line1.trim(),
                    city: city.trim(),
                    state: state.trim(),
                    country: country.trim(),
                    pin_code: pin_code.trim(),
                    gst_number: gst_number ? gst_number.trim() : null,
                    updated_at: new Date()
                })
                .eq('user_id', user_id)
                .select()
                .single();

            if (error) {
                // console.error(' Error updating hotel details:', error);
                throw error;
            }
            result = data;
        } else {
            // Create new record
            const { data, error } = await supabase
                .from('hotel_details')
                .insert([{
                    user_id,
                    hotel_name: hotel_name.trim(),
                    hotel_logo_url,
                    address_line1: address_line1.trim(),
                    city: city.trim(),
                    state: state.trim(),
                    country: country.trim(),
                    pin_code: pin_code.trim(),
                    gst_number: gst_number ? gst_number.trim() : null
                }])
                .select()
                .single();

            if (error) {
                // console.error(' Error creating hotel details:', error);
                throw error;
            }
            result = data;
        }

        // Update hotel_name in users table as well
        if (hotel_name) {
            const { error: userUpdateError } = await supabase
                .from('users')
                .update({ hotel_name: hotel_name.trim(), updated_at: new Date() })
                .eq('user_id', user_id);

            if (userUpdateError) {
                // console.error(' Warning: Failed to update hotel name in users table:', userUpdateError);
            }
        }

        // console.log(' Hotel details updated successfully:', {
        //     hotel_name: result.hotel_name,
        //     city: result.city,
        //     hasLogo: !!result.hotel_logo_url
        // });

        res.json(result);
    } catch (error) {
        // console.error(' Unexpected error in updateHotelDetails:', error);
        res.status(500).json({ 
            message: 'Failed to update hotel details',
            error: error.message
        });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
    getAllUsers,
    getUserDetails,
    getHotelDetails,
    updateHotelDetails
};
