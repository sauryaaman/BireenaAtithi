const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    addRoom,
    getRooms,
    updateRoom,
    deleteRoom,
    getRoomHistory,
    getRoomTypes,
    getAvailableRooms
} = require('../controllers/roomController');

router.use(auth);  // All room routes require authentication

// Room types and availability routes
router.get('/types', getRoomTypes);
router.get('/available', getAvailableRooms);

// Basic room operations
router.post('/', addRoom);
router.get('/', getRooms);
router.put('/:room_id', updateRoom);
router.delete('/:room_id', deleteRoom);
router.get('/:room_id/history', getRoomHistory);

module.exports = router;
