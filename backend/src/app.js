require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const customerRoutes = require('./routes/customerRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');
const auth = require('./middleware/auth');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Test database connection
const supabase = require('./config/db');
app.get('/api/health', async (req, res) => {
    try {
        const { data, error } = await supabase.from('rooms').select('count');
        if (error) throw error;
        res.json({ status: 'ok', database: 'connected' });
    } catch (err) {
        console.error('Database connection error:', err);
        res.status(500).json({ status: 'error', database: 'disconnected', error: err.message });
    }
});


const allowedOrigins = [
   "http://localhost:3000", // local dev
    "https://bireena-atithi.vercel.app",
   "https://www.bireenaatithi.in",
    "https://bireenaatithi.in"    // prod frontend
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));


app.use(express.json());

// Routes
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        details: err
    });
    res.status(500).json({ 
        message: 'Internal server error',
        error: err.message
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    // console.log(`Server running on port ${PORT}`);
});
