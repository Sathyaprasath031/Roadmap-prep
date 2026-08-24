const mongoose = require('mongoose');

const notificationPreferenceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  emailEnabled: { type: Boolean, default: true },
  weeklyReminder: { type: Boolean, default: true },
  motivationalNudge: { type: Boolean, default: true },
  lastSentAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('NotificationPreference', notificationPreferenceSchema);
