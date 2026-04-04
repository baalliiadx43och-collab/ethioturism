const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUser,
  deleteUser,
  updateUserStatus
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// All routes require Super Admin
router.use(protect);
router.use(authorize('SUPER_ADMIN'));

router.get('/', getAllUsers);
router.route('/:userId')
  .get(getUser)
  .delete(deleteUser);

router.patch('/:userId/status', updateUserStatus);

module.exports = router;
