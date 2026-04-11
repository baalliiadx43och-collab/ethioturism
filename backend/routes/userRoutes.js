const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUser,
  deleteUser,
  updateUserStatus,
  getProfile,
  updateProfile,
  updateProfileImage,
  updateEmail,
  changePassword,
  uploadProfileImage
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// User profile routes (authenticated users)
router.use(protect);

router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.post('/profile/upload', upload.single('file'), uploadProfileImage);
router.patch('/profile/image', updateProfileImage);
router.patch('/profile/email', updateEmail);
router.patch('/profile/password', changePassword);

// Super Admin only routes
router.use(authorize('SUPER_ADMIN'));

router.get('/', getAllUsers);
router.route('/:userId')
  .get(getUser)
  .delete(deleteUser);

router.patch('/:userId/status', updateUserStatus);

module.exports = router;
