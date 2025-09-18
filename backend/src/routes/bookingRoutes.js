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
    getInvoiceDetails,
} = require('../controllers/bookingController');
const {
    updateBooking,
    getAvailableRooms
} = require('../controllers/updateBookingController');
const {getBookingDetails} = require('../controllers/getBookingDetailsController');
const {cancelBooking} = require('../controllers/cancelBookingController');

router.use(auth);  // All booking routes require authentication

// Routes that don't require booking access verification
router.post('/', createBooking);
router.get('/', getBookings);
router.get('/:booking_id/invoice/details', verifyBookingAccess, getInvoiceDetails);
router.get('/:booking_id', verifyBookingAccess, getBookingDetails);

// Routes that require booking access verification
router.put('/:booking_id/checkin', verifyBookingAccess, checkinBooking);
router.put('/:booking_id/checkout', verifyBookingAccess, checkoutBooking);
router.put('/:booking_id/cancel', verifyBookingAccess, cancelBooking);  // New cancel endpoint
router.put('/:booking_id/checkout', verifyBookingAccess, checkoutBooking);
router.put('/:booking_id/payment', verifyBookingAccess, updatePaymentStatus);
router.get('/:booking_id/bill', verifyBookingAccess, getBookingForBill);
router.get('/:booking_id/invoice/download', verifyBookingAccess, downloadInvoice);
router.get('/:booking_id/details', verifyBookingAccess, getBookingDetails);

// New routes for booking updates
router.put('/:booking_id',verifyBookingAccess, updateBooking);
router.get('/available-rooms', getAvailableRooms);

module.exports = router;
