const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createBooking,
  checkAvailability,
  getMyBookings,
  cancelBooking
} = require('../controllers/bookingController');

// Public availability check
router.get('/availability', checkAvailability);

// Authenticated user routes
router.use(protect);
router.use(authorize('USER', 'ADMIN', 'SUPER_ADMIN'));

router.post('/', createBooking);
router.get('/my', getMyBookings);
router.patch('/:id/cancel', cancelBooking);

module.exports = router;
