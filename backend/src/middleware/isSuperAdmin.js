const jwt = require('jsonwebtoken');
const supabase = require('../config/db');

const isSuperAdmin = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if it's a super admin token
        if (decoded.role !== 'super_admin') {
            return res.status(403).json({ message: 'Not authorized as super admin' });
        }

        // Get super admin from database to verify they still exist
        const { data: superAdmin, error } = await supabase
            .from('super_admins')
            .select('id')
            .eq('id', decoded.id)
            .single();

        if (error || !superAdmin) {
            return res.status(401).json({ message: 'Invalid super admin token' });
        }

        // Add super admin info to request
        req.superAdmin = {
            id: decoded.id,
            role: decoded.role
        };

        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = isSuperAdmin;