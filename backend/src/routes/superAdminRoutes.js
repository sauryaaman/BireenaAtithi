const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');

// Super admin login
router.post('/login', superAdminController.login);

module.exports = router;