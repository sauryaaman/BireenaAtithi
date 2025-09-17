const express = require('express');
const { handleUpload } = require('../utils/cloudinary');


const router = express.Router();
const { 
    register, 
    login, 
    getProfile, 
    updateProfile, 
    changePassword,
    getAllUsers,
    getHotelDetails,
    updateHotelDetails ,

} = require('../controllers/userController');
const auth = require('../middleware/auth');
const isSuperAdmin = require('../middleware/isSuperAdmin');
const validateHotelDetails = require('../middleware/validateHotelDetails');
const processFileUpload = require('../middleware/fileUpload');

// Registration with hotel details
router.post('/register', handleUpload, validateHotelDetails, register);
router.post('/login', login);
router.get('/profile', auth, getProfile);
router.get('/', auth, isSuperAdmin, getAllUsers);
router.put('/profile', auth, updateProfile);
router.put('/change-password', auth, changePassword);
router.get('/hotel-details', auth, getHotelDetails);
router.put('/hotel-details', auth, handleUpload, validateHotelDetails, updateHotelDetails);

module.exports = router;
