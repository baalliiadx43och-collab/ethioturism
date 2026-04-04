const mongoose = require('mongoose');

const festivalDateSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  availableQuota: { type: Number, required: true, min: 0 },
  eventName: { type: String, default: '' }
}, { _id: false });

const culturalFestivalSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  location: { type: String, required: [true, 'Location is required'], trim: true },
  description: { type: String, required: [true, 'Description is required'] },
  images: [{ type: String }],
  videoUrl: { type: String, default: '' },
  basePrice: { type: Number, required: [true, 'Base price is required'], min: 0 },
  dailyQuota: { type: Number, required: [true, 'Daily quota is required'], min: 1 },
  // Festivals have explicit date entries (calendar-driven)
  festivalDates: [festivalDateSchema],
  transportationOptions: [{ type: String }],
  // e.g. 'Timkat', 'Meskel', 'Irreecha', 'Ashenda'
  festivalType: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

culturalFestivalSchema.methods.getQuotaForDate = function (date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const entry = this.festivalDates.find(fd => {
    const fd2 = new Date(fd.date);
    fd2.setHours(0, 0, 0, 0);
    return fd2.getTime() === d.getTime();
  });
  return entry ? entry.availableQuota : this.dailyQuota;
};

module.exports = mongoose.model('CulturalFestival', culturalFestivalSchema);
