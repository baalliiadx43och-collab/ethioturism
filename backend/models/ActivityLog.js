const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    adminName: { type: String, required: true },
    action: {
      type: String,
      required: true,
      // e.g. 'CREATED_SITE', 'UPDATED_QUOTA', 'DELETED_PARK', 'CREATED_ADMIN', etc.
    },
    targetType: {
      type: String,
      enum: ['HISTORICAL_SITE', 'PARK', 'FESTIVAL', 'USER', 'ADMIN', 'BOOKING'],
      required: true
    },
    targetId: { type: mongoose.Schema.Types.ObjectId },
    targetName: { type: String },
    details: { type: String },
    ipAddress: { type: String }
  },
  { timestamps: true }
);

// Index for fast dashboard queries
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ admin: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
