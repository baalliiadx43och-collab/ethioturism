const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const {
  getAll, getOne, create, update, remove,
  updateQuota, uploadMedia, getBookings
} = require('../controllers/destinationController');

// All routes require at least ADMIN
router.use(protect);
router.use(authorize('ADMIN', 'SUPER_ADMIN'));

// Standalone media upload
router.post('/upload', upload.array('files', 10), uploadMedia);

// Category-based CRUD  (:category = historical | parks | festivals)
router.route('/:category')
  .get(getAll)
  .post(upload.array('images', 10), create);

router.route('/:category/:id')
  .get(getOne)
  .patch(upload.array('images', 10), update)
  .delete(remove);

// Quota management
router.patch('/:category/:id/quota', updateQuota);

// Booking review
router.get('/:category/:id/bookings', getBookings);

module.exports = router;
