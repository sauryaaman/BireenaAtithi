const express = require('express');
const router = express.Router();
const foodPaymentController = require('../controllers/foodPaymentController');
const authMiddleware = require('../middleware/auth');

// Protect all routes with auth middleware
router.use(authMiddleware);

/**
 * @route POST /api/food-payments/record
 * @desc Record a payment for food order
 * @access Private
 */
router.post('/record', foodPaymentController.recordFoodPayment);

/**
 * @route GET /api/food-payments/food-order/:food_order_id
 * @desc Get all payment transactions for a specific food order
 * @access Private
 */
router.get('/food-order/:food_order_id', foodPaymentController.getFoodOrderTransactions);

/**
 * @route GET /api/food-payments/booking/:booking_id
 * @desc Get all payment transactions for a booking (all food orders)
 * @access Private
 */
router.get('/booking/:booking_id', foodPaymentController.getBookingFoodPaymentTransactions);

/**
 * @route GET /api/food-payments/summary
 * @desc Get food payment summary/report
 * @query start_date, end_date
 * @access Private
 */
router.get('/summary', foodPaymentController.getFoodPaymentSummary);

/**
 * @route GET /api/food-payments/trends
 * @desc Get food payment trends for dashboard
 * @query start_date, end_date
 * @access Private
 */
router.get('/trends', foodPaymentController.getFoodPaymentTrends);

/**
 * @route GET /api/food-payments/transactions
 * @desc Get daily food payment transactions
 * @query date OR start_date and end_date
 * @access Private
 */
router.get('/transactions', foodPaymentController.getFoodPaymentTransactions);

module.exports = router;
