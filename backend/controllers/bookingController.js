const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const HistoricalSite = require('../models/HistoricalSite');
const NationalPark = require('../models/NationalPark');
const CulturalFestival = require('../models/CulturalFestival');

const MODEL_MAP = {
  historical: { Model: HistoricalSite, type: 'HistoricalSite' },
  parks: { Model: NationalPark, type: 'NationalPark' },
  festivals: { Model: CulturalFestival, type: 'CulturalFestival' }
};

// @desc  Create a booking with overbooking prevention
// @route POST /api/v1/bookings
// @access Private (USER)
exports.createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { category, destinationId, bookingDate, numberOfPeople, notes } = req.body;

    if (!category || !destinationId || !bookingDate || !numberOfPeople) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'category, destinationId, bookingDate and numberOfPeople are required' });
    }

    const entry = MODEL_MAP[category];
    if (!entry) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'Invalid category' });
    }

    const destination = await entry.Model.findById(destinationId).session(session);
    if (!destination || !destination.isActive) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'Destination not found or inactive' });
    }

    // Normalise date to midnight UTC
    const targetDate = new Date(bookingDate);
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Get effective quota for the date
    const quota = destination.getQuotaForDate(targetDate);

    // Sum already-booked seats for this destination + date (atomic read inside transaction)
    const bookedAgg = await Booking.aggregate([
      {
        $match: {
          destinationId: new mongoose.Types.ObjectId(destinationId),
          bookingDate: { $gte: targetDate, $lt: nextDay },
          status: { $in: ['PENDING', 'CONFIRMED'] }
        }
      },
      { $group: { _id: null, total: { $sum: '$numberOfPeople' } } }
    ]).session(session);

    const alreadyBooked = bookedAgg[0]?.total || 0;
    const remaining = quota - alreadyBooked;

    if (numberOfPeople > remaining) {
      await session.abortTransaction();
      return res.status(409).json({
        success: false,
        message: `Not enough availability. Only ${remaining} spot(s) left for this date.`,
        remaining
      });
    }

    const totalPrice = destination.basePrice * numberOfPeople;

    const [booking] = await Booking.create([{
      user: req.user._id,
      destinationType: entry.type,
      destinationId: destination._id,
      destinationName: destination.name,
      bookingDate: targetDate,
      numberOfPeople,
      totalPrice,
      status: 'CONFIRMED',
      notes: notes || ''
    }], { session });

    await session.commitTransaction();

    res.status(201).json({ success: true, booking });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

// @desc  Check availability for a destination on a date
// @route GET /api/v1/bookings/availability?category=&destinationId=&date=
// @access Public
exports.checkAvailability = async (req, res) => {
  try {
    const { category, destinationId, date } = req.query;
    if (!category || !destinationId || !date) {
      return res.status(400).json({ success: false, message: 'category, destinationId and date are required' });
    }

    const entry = MODEL_MAP[category];
    if (!entry) return res.status(400).json({ success: false, message: 'Invalid category' });

    const destination = await entry.Model.findById(destinationId);
    if (!destination || !destination.isActive) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const quota = destination.getQuotaForDate(targetDate);

    const bookedAgg = await Booking.aggregate([
      {
        $match: {
          destinationId: new mongoose.Types.ObjectId(destinationId),
          bookingDate: { $gte: targetDate, $lt: nextDay },
          status: { $in: ['PENDING', 'CONFIRMED'] }
        }
      },
      { $group: { _id: null, total: { $sum: '$numberOfPeople' } } }
    ]);

    const alreadyBooked = bookedAgg[0]?.total || 0;
    const remaining = quota - alreadyBooked;

    res.json({ success: true, quota, alreadyBooked, remaining, available: remaining > 0 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get logged-in user's bookings
// @route GET /api/v1/bookings/my
// @access Private (USER)
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Cancel a booking
// @route PATCH /api/v1/bookings/:id/cancel
// @access Private (USER)
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'Booking already cancelled' });
    }
    booking.status = 'CANCELLED';
    await booking.save();
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
