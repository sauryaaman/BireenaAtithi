const express = require('express');
const router = express.Router();
const { 
    register, 
    login, 
    getProfile, 
    updateProfile, 
    changePassword,
    getAllUsers 
} = require('../controllers/userController');
const auth = require('../middleware/auth');
const isSuperAdmin = require('../middleware/isSuperAdmin');

router.post('/register', isSuperAdmin, register);
router.post('/login', login);
router.get('/profile', auth, getProfile);
router.get('/', isSuperAdmin, getAllUsers);
router.put('/profile', auth, updateProfile);
router.put('/change-password', auth, changePassword);

module.exports = router;
