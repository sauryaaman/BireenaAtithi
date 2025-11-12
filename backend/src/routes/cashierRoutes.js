const express = require('express');
const router = express.Router();
const  auth  = require('../middleware/auth');
const {
    getSummary,
    getDailyTransactions,
    getPaymentTrends
} = require('../controllers/cashierController');

// All routes protected with auth middleware
router.get('/summary', auth, getSummary);
router.get('/daily-transactions', auth, getDailyTransactions);
router.get('/payment-trends', auth, getPaymentTrends);

module.exports = router;