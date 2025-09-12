const supabase = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Get all users (Super Admin only)
const getAllUsers = async (req, res) => {
    try {
        // Since this is called by super admin, get all users
        const { data: users, error } = await supabase
            .from('users')
            .select('user_id, name, email, hotel_name, owner_phone, created_at')
            .order('created_at', { ascending: false });

        if (error) {
            // console.error('Get all users error:', error);
            return res.status(500).json({ message: 'Error fetching users' });
        }

        res.json(users);
    } catch (error) {
        // console.error('Get all users error:', error);
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

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const { name, hotel_name, owner_phone } = req.body;

        const { data: user, error } = await supabase
            .from('users')
            .update({ name, hotel_name, owner_phone, updated_at: new Date() })
            .eq('user_id', user_id)
            .select()
            .single();

        if (error) throw error;
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        // console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
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

const register = async (req, res) => {
    try {
        const { name, email, password, hotel_name, owner_phone } = req.body;
        
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

        // Create user
        const { data: newUser, error } = await supabase
            .from('users')
            .insert([
                { name, email, password_hash, hotel_name, owner_phone }
            ])
            .select()
            .single();

        if (error) throw error;

        // Create token
        const token = jwt.sign(
            { user_id: newUser.user_id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser.user_id,
                name: newUser.name,
                email: newUser.email,
                hotel_name: newUser.hotel_name
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

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

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
    getAllUsers
};
