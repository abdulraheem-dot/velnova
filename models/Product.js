const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  category:    { type: String, enum: ['men','women'], required: true },
  price:       { type: Number, required: true, min: 0 },
  oldPrice:    { type: Number, default: null },
  description: { type: String, required: true },
  sizes:       { type: [String], default: ['S','M','L','XL'] },
  images:      { type: [String], default: [] },
  badge:       { type: String, default: null },
  createdAt:   { type: Date, default: Date.now },
});
module.exports = mongoose.model('Product', productSchema);
