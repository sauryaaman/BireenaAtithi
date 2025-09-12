const express = require('express');
const router = express.Router();
const {
    getAllCustomers,
    getCurrentCustomers,
    getPastCustomers,
    getCustomerDetails,
    updateCustomer,
    searchCustomers
} = require('../controllers/customerController');
const { updateAdditionalGuests } = require('../controllers/additionalGuestController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get all customers
router.get('/', getAllCustomers);

// Get current checked-in customers
router.get('/current', getCurrentCustomers);

// Get past customers (checked-out)
router.get('/past', getPastCustomers);

// Search customers
router.get('/search', searchCustomers);

// Get specific customer details with history
router.get('/:customer_id', getCustomerDetails);

// Update customer details
router.put('/:customer_id', updateCustomer);

// Update additional guests
router.put('/:customer_id/additional-guests', updateAdditionalGuests);

module.exports = router;
