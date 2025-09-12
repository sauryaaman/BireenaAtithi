const getAllUsers = async (req, res) => {
    try {
        // Since this is called by super admin, get all users
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
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