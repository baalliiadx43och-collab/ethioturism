const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { generateAccessToken } = require('../utils/generateToken');
const bcrypt = require('bcryptjs');

// ─── ADMIN MANAGEMENT ────────────────────────────────────────────────────────

// @desc  Create admin account
// @route POST /api/v1/super-admin/admins
exports.createAdmin = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    const admin = await User.create({ fullName, email, password, phone, role: 'ADMIN' });

    await ActivityLog.create({
      admin: req.user._id,
      adminName: req.user.fullName,
      action: 'CREATED_ADMIN',
      targetType: 'ADMIN',
      targetId: admin._id,
      targetName: admin.fullName,
      details: `Created admin account for ${admin.email}`,
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      admin: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        status: admin.status,
        createdAt: admin.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get all admins (with search + filter)
// @route GET /api/v1/super-admin/admins
exports.getAllAdmins = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;

    const query = { role: 'ADMIN' };
    if (status) query.status = status.toUpperCase();
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [admins, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      admins
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update admin credentials
// @route PATCH /api/v1/super-admin/admins/:id
exports.updateAdmin = async (req, res) => {
  try {
    const { fullName, email, phone } = req.body;
    const admin = await User.findOne({ _id: req.params.id, role: 'ADMIN' });

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    if (fullName) admin.fullName = fullName;
    if (email) admin.email = email;
    if (phone) admin.phone = phone;
    await admin.save();

    await ActivityLog.create({
      admin: req.user._id,
      adminName: req.user.fullName,
      action: 'UPDATED_ADMIN',
      targetType: 'ADMIN',
      targetId: admin._id,
      targetName: admin.fullName,
      details: `Updated credentials for ${admin.email}`,
      ipAddress: req.ip
    });

    res.json({ success: true, admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Deactivate / reactivate admin
// @route PATCH /api/v1/super-admin/admins/:id/status
exports.updateAdminStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['ACTIVE', 'BLOCKED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const admin = await User.findOne({ _id: req.params.id, role: 'ADMIN' });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    admin.status = status;
    await admin.save();

    await ActivityLog.create({
      admin: req.user._id,
      adminName: req.user.fullName,
      action: status === 'BLOCKED' ? 'DEACTIVATED_ADMIN' : 'ACTIVATED_ADMIN',
      targetType: 'ADMIN',
      targetId: admin._id,
      targetName: admin.fullName,
      details: `${status === 'BLOCKED' ? 'Deactivated' : 'Activated'} admin ${admin.email}`,
      ipAddress: req.ip
    });

    res.json({ success: true, message: `Admin ${status === 'BLOCKED' ? 'deactivated' : 'activated'}`, admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Delete admin
// @route DELETE /api/v1/super-admin/admins/:id
exports.deleteAdmin = async (req, res) => {
  try {
    const admin = await User.findOne({ _id: req.params.id, role: 'ADMIN' });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    await admin.deleteOne();

    await ActivityLog.create({
      admin: req.user._id,
      adminName: req.user.fullName,
      action: 'DELETED_ADMIN',
      targetType: 'ADMIN',
      targetId: admin._id,
      targetName: admin.fullName,
      details: `Deleted admin account ${admin.email}`,
      ipAddress: req.ip
    });

    res.json({ success: true, message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── USER MANAGEMENT ─────────────────────────────────────────────────────────

// @desc  Get all tourist users
// @route GET /api/v1/super-admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;

    const query = { role: 'USER' };
    if (status) query.status = status.toUpperCase();
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(query)
    ]);

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Deactivate / reactivate tourist user
// @route PATCH /api/v1/super-admin/users/:id/status
exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['ACTIVE', 'BLOCKED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const user = await User.findOne({ _id: req.params.id, role: 'USER' });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = status;
    await user.save();

    res.json({ success: true, message: `User ${status === 'BLOCKED' ? 'deactivated' : 'activated'}`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Reset any user's password (super admin privilege)
// @route PATCH /api/v1/super-admin/users/:id/reset-password
exports.resetUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    await ActivityLog.create({
      admin: req.user._id,
      adminName: req.user.fullName,
      action: 'RESET_PASSWORD',
      targetType: 'USER',
      targetId: user._id,
      targetName: user.fullName,
      details: `Reset password for ${user.email}`,
      ipAddress: req.ip
    });

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── SYSTEM OVERVIEW ─────────────────────────────────────────────────────────

// @desc  Aggregated platform stats
// @route GET /api/v1/super-admin/overview
exports.getSystemOverview = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // User & admin counts via $facet
    const [userStats] = await User.aggregate([
      {
        $facet: {
          totalUsers: [{ $match: { role: 'USER' } }, { $count: 'count' }],
          activeUsers: [{ $match: { role: 'USER', status: 'ACTIVE' } }, { $count: 'count' }],
          blockedUsers: [{ $match: { role: 'USER', status: 'BLOCKED' } }, { $count: 'count' }],
          totalAdmins: [{ $match: { role: 'ADMIN' } }, { $count: 'count' }],
          activeAdmins: [{ $match: { role: 'ADMIN', status: 'ACTIVE' } }, { $count: 'count' }],
          newUsersToday: [
            { $match: { role: 'USER', createdAt: { $gte: todayStart } } },
            { $count: 'count' }
          ]
        }
      }
    ]);

    // Recent activity logs (last 20)
    const recentActivity = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('admin', 'fullName email');

    // Activity breakdown by targetType (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activityBreakdown = await ActivityLog.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$targetType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const extract = (arr) => (arr && arr[0] ? arr[0].count : 0);

    res.json({
      success: true,
      overview: {
        users: {
          total: extract(userStats.totalUsers),
          active: extract(userStats.activeUsers),
          blocked: extract(userStats.blockedUsers),
          newToday: extract(userStats.newUsersToday)
        },
        admins: {
          total: extract(userStats.totalAdmins),
          active: extract(userStats.activeAdmins)
        },
        activityBreakdown,
        recentActivity
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ACTIVITY LOG ─────────────────────────────────────────────────────────────

// @desc  Get paginated activity logs
// @route GET /api/v1/super-admin/activity-logs
exports.getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, adminId, targetType } = req.query;
    const query = {};
    if (adminId) query.admin = adminId;
    if (targetType) query.targetType = targetType.toUpperCase();

    const skip = (Number(page) - 1) * Number(limit);
    const [logs, total] = await Promise.all([
      ActivityLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('admin', 'fullName email'),
      ActivityLog.countDocuments(query)
    ]);

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
