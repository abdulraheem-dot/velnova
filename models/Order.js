const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userEmail: { type: String, required: true },
  items: [{
    productId: String,
    name:  String,
    price: Number,
    qty:   Number,
    size:  String,
  }],
  shippingAddress: {
    fullName: String,
    phone:    String,
    address:  String,
    city:     String,
    state:    String,
    country:  { type: String, default: 'Nigeria' },
  },
  subtotal:  Number,
  shipping:  { type: Number, default: 2500 },
  total:     Number,
  status:    { type: String, enum: ['pending','confirmed','shipped','delivered','cancelled'], default: 'pending' },
  placedAt:  { type: Date, default: Date.now },
});
module.exports = mongoose.model('Order', orderSchema);
