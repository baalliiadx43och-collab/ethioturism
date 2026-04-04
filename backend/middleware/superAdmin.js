const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Dedicated Super Admin middleware.
 * Verifies JWT AND explicitly checks role === 'SUPER_ADMIN'.
 * Use this instead of protect + authorize('SUPER_ADMIN') on sensitive routes.
 */
const superAdminMiddleware = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized — no token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (user.status === 'BLOCKED') {
      return res.status(403).json({ success: false, message: 'Account is blocked' });
    }

    // Hard role check — no other role can pass
    if (user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied — Super Admin only'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = superAdminMiddleware;
