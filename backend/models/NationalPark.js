const mongoose = require('mongoose');

const quotaDateSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  availableQuota: { type: Number, required: true, min: 0 }
}, { _id: false });

const nationalParkSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  location: { type: String, required: [true, 'Location is required'], trim: true },
  description: { type: String, required: [true, 'Description is required'] },
  images: [{ type: String }],
  videoUrl: { type: String, default: '' },
  basePrice: { type: Number, required: [true, 'Base price is required'], min: 0 },
  dailyQuota: { type: Number, required: [true, 'Daily quota is required'], min: 1 },
  quotaOverrides: [quotaDateSchema],
  transportationOptions: [{ type: String }],
  wildlife: [{ type: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

nationalParkSchema.methods.getQuotaForDate = function (date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const override = this.quotaOverrides.find(q => {
    const qd = new Date(q.date);
    qd.setHours(0, 0, 0, 0);
    return qd.getTime() === d.getTime();
  });
  return override ? override.availableQuota : this.dailyQuota;
};

module.exports = mongoose.model('NationalPark', nationalParkSchema);
