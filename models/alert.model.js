const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  asset: {
    type: String,
    required: true
  },
  metric: {
    type: String,
    required: true
  },
  exchange: {
    type: String,
    required: true
  },
  condition: {
    type: String,
    required: true
  },
  threshold: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  cool_down: {
    type: String,
    required: true
  },
  channels: {
    type: [String],
    required: true
  },
  note: {
    type: String,
    default: ""
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert;