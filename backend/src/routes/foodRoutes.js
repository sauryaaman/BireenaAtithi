const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createMenuItem,
  getMenuItems,
  getMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemStatus,
} = require('../controllers/foodController');

router.use(auth);

router.post('/', createMenuItem);
router.get('/', getMenuItems);
router.get('/:id', getMenuItem);
router.put('/:id', updateMenuItem);
router.patch('/:id/toggle-status', toggleMenuItemStatus);
router.delete('/:id', deleteMenuItem);

module.exports = router;
