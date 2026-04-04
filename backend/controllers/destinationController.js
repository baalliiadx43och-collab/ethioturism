const HistoricalSite = require('../models/HistoricalSite');
const NationalPark = require('../models/NationalPark');
const CulturalFestival = require('../models/CulturalFestival');
const Booking = require('../models/Booking');
const ActivityLog = require('../models/ActivityLog');
const { cloudinary } = require('../config/cloudinary');

// Map category string to model
const getModel = (category) => {
  const map = {
    historical: HistoricalSite,
    parks: NationalPark,
    festivals: CulturalFestival
  };
  return map[category] || null;
};

const getCategoryLabel = (category) => {
  const map = {
    historical: 'HISTORICAL_SITE',
    parks: 'PARK',
    festivals: 'FESTIVAL'
  };
  return map[category] || 'HISTORICAL_SITE';
};

// ─── CRUD ─────────────────────────────────────────────────────────────────────

// GET /api/v1/destinations/:category
exports.getAll = async (req, res) => {
  try {
    const Model = getModel(req.params.category);
    if (!Model) return res.status(400).json({ success: false, message: 'Invalid category' });

    const { search, page = 1, limit = 12 } = req.query;
    const query = {};
    if (search) query.name = { $regex: search, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Model.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('createdBy', 'fullName'),
      Model.countDocuments(query)
    ]);

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/v1/destinations/:category/:id
exports.getOne = async (req, res) => {
  try {
    const Model = getModel(req.params.category);
    if (!Model) return res.status(400).json({ success: false, message: 'Invalid category' });

    const item = await Model.findById(req.params.id).populate('createdBy', 'fullName email');
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });

    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/v1/destinations/:category
exports.create = async (req, res) => {
  try {
    const Model = getModel(req.params.category);
    if (!Model) return res.status(400).json({ success: false, message: 'Invalid category' });

    const {
      name, location, description, videoUrl, basePrice,
      dailyQuota, transportationOptions, festivalDates,
      festivalType, wildlife
    } = req.body;

    // Images uploaded via multer are in req.files
    const images = req.files ? req.files.map(f => f.path) : [];

    const data = {
      name, location, description,
      videoUrl: videoUrl || '',
      basePrice: Number(basePrice),
      dailyQuota: Number(dailyQuota),
      images,
      transportationOptions: Array.isArray(transportationOptions)
        ? transportationOptions
        : transportationOptions ? JSON.parse(transportationOptions) : [],
      createdBy: req.user._id
    };

    if (req.params.category === 'festivals') {
      data.festivalDates = festivalDates
        ? (typeof festivalDates === 'string' ? JSON.parse(festivalDates) : festivalDates)
        : [];
      data.festivalType = festivalType || '';
    }
    if (req.params.category === 'parks') {
      data.wildlife = Array.isArray(wildlife)
        ? wildlife
        : wildlife ? JSON.parse(wildlife) : [];
    }

    const item = await Model.create(data);

    await ActivityLog.create({
      admin: req.user._id,
      adminName: req.user.fullName,
      action: `CREATED_${getCategoryLabel(req.params.category)}`,
      targetType: getCategoryLabel(req.params.category),
      targetId: item._id,
      targetName: item.name,
      details: `Created ${item.name} in ${item.location}`,
      ipAddress: req.ip
    });

    res.status(201).json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/v1/destinations/:category/:id
exports.update = async (req, res) => {
  try {
    const Model = getModel(req.params.category);
    if (!Model) return res.status(400).json({ success: false, message: 'Invalid category' });

    const item = await Model.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });

    const fields = ['name', 'location', 'description', 'videoUrl', 'basePrice', 'dailyQuota', 'isActive', 'festivalType'];
    fields.forEach(f => { if (req.body[f] !== undefined) item[f] = req.body[f]; });

    if (req.body.transportationOptions) {
      item.transportationOptions = Array.isArray(req.body.transportationOptions)
        ? req.body.transportationOptions
        : JSON.parse(req.body.transportationOptions);
    }
    if (req.body.wildlife && req.params.category === 'parks') {
      item.wildlife = Array.isArray(req.body.wildlife) ? req.body.wildlife : JSON.parse(req.body.wildlife);
    }

    // Append new uploaded images
    if (req.files && req.files.length > 0) {
      item.images.push(...req.files.map(f => f.path));
    }

    await item.save();

    await ActivityLog.create({
      admin: req.user._id,
      adminName: req.user.fullName,
      action: `UPDATED_${getCategoryLabel(req.params.category)}`,
      targetType: getCategoryLabel(req.params.category),
      targetId: item._id,
      targetName: item.name,
      details: `Updated ${item.name}`,
      ipAddress: req.ip
    });

    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/v1/destinations/:category/:id
exports.remove = async (req, res) => {
  try {
    const Model = getModel(req.params.category);
    if (!Model) return res.status(400).json({ success: false, message: 'Invalid category' });

    const item = await Model.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });

    // Delete images from Cloudinary
    for (const imgUrl of item.images) {
      const publicId = imgUrl.split('/').slice(-2).join('/').split('.')[0];
      await cloudinary.uploader.destroy(publicId).catch(() => {});
    }

    await item.deleteOne();

    await ActivityLog.create({
      admin: req.user._id,
      adminName: req.user.fullName,
      action: `DELETED_${getCategoryLabel(req.params.category)}`,
      targetType: getCategoryLabel(req.params.category),
      targetId: item._id,
      targetName: item.name,
      details: `Deleted ${item.name}`,
      ipAddress: req.ip
    });

    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── QUOTA MANAGEMENT ─────────────────────────────────────────────────────────

// PATCH /api/v1/destinations/:category/:id/quota
// Body: { date: "2026-01-19", availableQuota: 50 }
exports.updateQuota = async (req, res) => {
  try {
    const Model = getModel(req.params.category);
    if (!Model) return res.status(400).json({ success: false, message: 'Invalid category' });

    const { date, availableQuota, eventName } = req.body;
    if (!date || availableQuota === undefined) {
      return res.status(400).json({ success: false, message: 'date and availableQuota are required' });
    }

    const item = await Model.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    // For festivals use festivalDates array, others use quotaOverrides
    const arrayField = req.params.category === 'festivals' ? 'festivalDates' : 'quotaOverrides';
    const idx = item[arrayField].findIndex(q => {
      const qd = new Date(q.date);
      qd.setHours(0, 0, 0, 0);
      return qd.getTime() === targetDate.getTime();
    });

    if (idx >= 0) {
      item[arrayField][idx].availableQuota = Number(availableQuota);
      if (eventName !== undefined) item[arrayField][idx].eventName = eventName;
    } else {
      const entry = { date: targetDate, availableQuota: Number(availableQuota) };
      if (eventName !== undefined) entry.eventName = eventName;
      item[arrayField].push(entry);
    }

    await item.save();

    await ActivityLog.create({
      admin: req.user._id,
      adminName: req.user.fullName,
      action: 'UPDATED_QUOTA',
      targetType: getCategoryLabel(req.params.category),
      targetId: item._id,
      targetName: item.name,
      details: `Set quota for ${date} to ${availableQuota}`,
      ipAddress: req.ip
    });

    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── MEDIA UPLOAD ─────────────────────────────────────────────────────────────

// POST /api/v1/destinations/upload
// Standalone upload endpoint — returns Cloudinary URLs
exports.uploadMedia = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }
    const urls = req.files.map(f => ({ url: f.path, type: f.mimetype.startsWith('video/') ? 'video' : 'image' }));
    res.json({ success: true, files: urls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── BOOKING REVIEW ───────────────────────────────────────────────────────────

// GET /api/v1/destinations/:category/:id/bookings
exports.getBookings = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, date } = req.query;
    const query = { destinationId: req.params.id };
    if (status) query.status = status.toUpperCase();
    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      query.bookingDate = { $gte: d, $lt: next };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .sort({ bookingDate: 1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('user', 'fullName email phone'),
      Booking.countDocuments(query)
    ]);

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
