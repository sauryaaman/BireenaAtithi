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

// Middleware
const allowedOrigins = [
  "https://bireena-atithi.vercel.app"    // prod frontend
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
    // console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    // console.log(`Server running on port ${PORT}`);
});
