const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/db');

async function login(req, res) {
    try {
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide both email and password' });
        }

        // Get super admin from database
        const { data: superAdmin, error } = await supabase
            .from('super_admins')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !superAdmin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, superAdmin.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign(
            { 
                id: superAdmin.id,
                role: 'super_admin' 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: superAdmin.id,
                username: superAdmin.username,
                email: superAdmin.email,
                role: 'super_admin'
            }
        });

    } catch (error) {
        // console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = {
    login
};