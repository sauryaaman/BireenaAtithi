const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const verifyBookingAccess = require('../middleware/verifyBookingAccess');
const {
    createBooking,
    checkinBooking,
    checkoutBooking,
    getBookings,
    updatePaymentStatus,
    getBookingForBill,
    downloadInvoice,
} = require('../controllers/bookingController');

router.use(auth);  // All booking routes require authentication

// Routes that don't require booking access verification
router.post('/', createBooking);
router.get('/', getBookings);

// Routes that require booking access verification
router.put('/:booking_id/checkin', verifyBookingAccess, checkinBooking);
router.put('/:booking_id/checkout', verifyBookingAccess, checkoutBooking);
router.put('/:booking_id/payment', verifyBookingAccess, updatePaymentStatus);
router.get('/:booking_id/bill', verifyBookingAccess, getBookingForBill);
router.get('/:booking_id/invoice/download', verifyBookingAccess, downloadInvoice);

module.exports = router;
