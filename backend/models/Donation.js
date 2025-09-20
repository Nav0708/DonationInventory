// backend/models/Donation.js
const mongoose = require("mongoose");

const DonationSchema = new mongoose.Schema({
  donor_name: { type: String, required: true },
  type: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Donation", DonationSchema);
