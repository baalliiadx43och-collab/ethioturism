const express = require('express');
const router = express.Router();
const {
  createAdmin,
  getAllAdmins,
  getAdmin,
  updateAdmin,
  deleteAdmin
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes require Super Admin
router.use(protect);
router.use(authorize('SUPER_ADMIN'));

router.route('/')
  .post(createAdmin)
  .get(getAllAdmins);

router.route('/:adminId')
  .get(getAdmin)
  .patch(updateAdmin)
  .delete(deleteAdmin);

module.exports = router;
