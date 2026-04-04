const express = require('express');
const router = express.Router();
const superAdmin = require('../middleware/superAdmin');
const {
  createAdmin,
  getAllAdmins,
  updateAdmin,
  updateAdminStatus,
  deleteAdmin,
  getAllUsers,
  updateUserStatus,
  resetUserPassword,
  getSystemOverview,
  getActivityLogs
} = require('../controllers/superAdminController');

// All routes protected by dedicated super admin middleware
router.use(superAdmin);

// System overview
router.get('/overview', getSystemOverview);

// Activity logs
router.get('/activity-logs', getActivityLogs);

// Admin management
router.route('/admins')
  .get(getAllAdmins)
  .post(createAdmin);

router.route('/admins/:id')
  .patch(updateAdmin)
  .delete(deleteAdmin);

router.patch('/admins/:id/status', updateAdminStatus);

// User management
router.get('/users', getAllUsers);
router.patch('/users/:id/status', updateUserStatus);
router.patch('/users/:id/reset-password', resetUserPassword);

module.exports = router;
