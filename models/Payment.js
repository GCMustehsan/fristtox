const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  stripe_charge_id: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  cardholder_first_name: {
    type: String,
    required: true,
  },
  cardholder_last_name: {
    type: String,
    required: true,
  },
  card_number: {
    type: String,
    required: true,
  },
  expiration_date: {
    type: String,
    required: true,
  },
  cvc: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Payment', PaymentSchema);

