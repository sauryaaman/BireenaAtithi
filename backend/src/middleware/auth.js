const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const authHeader = req.header('Authorization') || '';
        const token = authHeader.replace('Bearer ', '').trim();
        if (!token) return res.status(401).json({ message: 'Authentication required' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach decoded token to req.user
        req.user = decoded || {};

        // If this token belongs to a staff (has staff_id and created_by),
        // set req.user.user_id to created_by so existing controllers that
        // expect req.user.user_id (owner/admin) continue to work for staff.
        if (decoded && decoded.staff_id && decoded.created_by) {
            req.user.user_id = decoded.created_by;
            // keep staff_id as well
            req.user.staff_id = decoded.staff_id;
            req.user.created_by = decoded.created_by;
        }

        next();
    } catch (error) {
        res.status(401).json({ message: 'Authentication required' });
    }
};
