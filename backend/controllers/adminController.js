const User = require('../models/User');

// @desc    Create admin (Super Admin only)
// @route   POST /api/v1/admins
// @access  Private/Super Admin
exports.createAdmin = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }

    const admin = await User.create({
      fullName,
      email,
      password,
      phone,
      role: 'ADMIN'
    });

    res.status(201).json({
      success: true,
      admin: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        phone: admin.phone,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all admins
// @route   GET /api/v1/admins
// @access  Private/Super Admin
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'ADMIN' });

    res.json({
      success: true,
      count: admins.length,
      admins
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single admin
// @route   GET /api/v1/admins/:adminId
// @access  Private/Super Admin
exports.getAdmin = async (req, res) => {
  try {
    const admin = await User.findOne({ _id: req.params.adminId, role: 'ADMIN' });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      admin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update admin
// @route   PATCH /api/v1/admins/:adminId
// @access  Private/Super Admin
exports.updateAdmin = async (req, res) => {
  try {
    const { fullName, email, phone } = req.body;

    const admin = await User.findOne({ _id: req.params.adminId, role: 'ADMIN' });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    if (fullName) admin.fullName = fullName;
    if (email) admin.email = email;
    if (phone) admin.phone = phone;

    await admin.save();

    res.json({
      success: true,
      admin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete admin
// @route   DELETE /api/v1/admins/:adminId
// @access  Private/Super Admin
exports.deleteAdmin = async (req, res) => {
  try {
    const admin = await User.findOne({ _id: req.params.adminId, role: 'ADMIN' });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    await admin.deleteOne();

    res.json({
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
