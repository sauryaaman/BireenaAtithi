const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getAllStaff,
  createStaff,
  updateStaff,
  updatePermissions,
  updateStatus,
  deleteStaff,
  staffLogin,
  getStaffProfile,
  getStaffProfileWithHotel,
} = require('../controllers/staffController');

// Public: staff login
router.post('/login', staffLogin);

// Protected: staff management (admin)
router.get('/', auth, getAllStaff);
router.post('/', auth, createStaff);
router.put('/:id', auth, updateStaff);
router.put('/:id/permissions', auth, updatePermissions);
router.put('/:id/status', auth, updateStatus);
router.delete('/:id', auth, deleteStaff);

// Protected: staff profile (staff token)
router.get('/profile', auth, getStaffProfile);
router.get('/profile-with-hotel', auth, getStaffProfileWithHotel);

module.exports = router;
