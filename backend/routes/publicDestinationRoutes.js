const express = require('express');
const router = express.Router();
const HistoricalSite = require('../models/HistoricalSite');
const NationalPark = require('../models/NationalPark');
const CulturalFestival = require('../models/CulturalFestival');

const MODEL_MAP = {
  historical: HistoricalSite,
  parks: NationalPark,
  festivals: CulturalFestival
};

// GET /api/v1/public/destinations
// Query: ?category=historical|parks|festivals&search=&page=&limit=
router.get('/destinations', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;

    let items = [];
    let total = 0;

    const buildQuery = (search) => {
      const q = { isActive: true };
      if (search) q.name = { $regex: search, $options: 'i' };
      return q;
    };

    const skip = (Number(page) - 1) * Number(limit);

    if (category && MODEL_MAP[category]) {
      const Model = MODEL_MAP[category];
      const q = buildQuery(search);
      [items, total] = await Promise.all([
        Model.find(q).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).select('-quotaOverrides -festivalDates -createdBy'),
        Model.countDocuments(q)
      ]);
      items = items.map(i => ({ ...i.toObject(), category }));
    } else {
      // Fetch all categories
      const q = buildQuery(search);
      const [historical, parks, festivals] = await Promise.all([
        HistoricalSite.find(q).sort({ createdAt: -1 }).select('-quotaOverrides -createdBy'),
        NationalPark.find(q).sort({ createdAt: -1 }).select('-quotaOverrides -createdBy'),
        CulturalFestival.find(q).sort({ createdAt: -1 }).select('-festivalDates -createdBy')
      ]);
      items = [
        ...historical.map(i => ({ ...i.toObject(), category: 'historical' })),
        ...parks.map(i => ({ ...i.toObject(), category: 'parks' })),
        ...festivals.map(i => ({ ...i.toObject(), category: 'festivals' }))
      ];
      total = items.length;
      // Sort by createdAt desc then paginate
      items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      items = items.slice(skip, skip + Number(limit));
    }

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/v1/public/destinations/:category/:id
router.get('/destinations/:category/:id', async (req, res) => {
  try {
    const Model = MODEL_MAP[req.params.category];
    if (!Model) return res.status(400).json({ success: false, message: 'Invalid category' });

    const item = await Model.findOne({ _id: req.params.id, isActive: true });
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });

    res.json({ success: true, item: { ...item.toObject(), category: req.params.category } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
