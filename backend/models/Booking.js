const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  destinationType: {
    type: String,
    enum: ['HistoricalSite', 'NationalPark', 'CulturalFestival'],
    required: true
  },
  destinationId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'destinationType' },
  destinationName: { type: String, required: true },
  bookingDate: { type: Date, required: true },
  numberOfPeople: { type: Number, required: true, min: 1 },
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED'],
    default: 'PENDING'
  },
  notes: { type: String, default: '' }
}, { timestamps: true });

// Compound index for quota check queries
bookingSchema.index({ destinationId: 1, bookingDate: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
