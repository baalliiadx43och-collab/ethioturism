const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Super Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'USER' });

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single user
// @route   GET /api/v1/users/:userId
// @access  Private/Super Admin
exports.getUser = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.userId, role: 'USER' });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/v1/users/:userId
// @access  Private/Super Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.userId, role: 'USER' });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Block/Unblock user
// @route   PATCH /api/v1/users/:userId/status
// @access  Private/Super Admin
exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['ACTIVE', 'BLOCKED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be ACTIVE or BLOCKED'
      });
    }

    const user = await User.findOne({ _id: req.params.userId, role: 'USER' });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.status = status;
    await user.save();

    res.json({
      success: true,
      message: `User ${status === 'BLOCKED' ? 'blocked' : 'activated'} successfully`,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
