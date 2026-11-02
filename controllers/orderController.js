const Order = require('../models/Order');

exports.placeOrder = async (req, res) => {
  try {
    const { items, shippingAddress, subtotal, shipping, total } = req.body;
    if (!items?.length) return res.status(400).json({ success:false, message:'Cart is empty.' });
    const order = await Order.create({
      userId:    req.session.user.id,
      userEmail: req.session.user.email,
      items, shippingAddress,
      subtotal, shipping: shipping ?? 2500, total,
    });
    res.status(201).json({ success:true, orderId: order._id });
  } catch (e) { res.status(500).json({ success:false, message:'Could not place order.' }); }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.session.user.id }).sort({ placedAt: -1 });
    res.json({ success:true, orders });
  } catch (e) { res.status(500).json({ success:false, message:'Could not fetch orders.' }); }
};

exports.getAllOrders = async (req, res) => {
  try {
    const limit   = parseInt(req.query.limit) || 200;
    const orders  = await Order.find().sort({ placedAt: -1 }).limit(limit);
    res.json({ success:true, orders });
  } catch (e) { res.status(500).json({ success:false, message:'Could not fetch orders.' }); }
};

exports.updateStatus = async (req, res) => {
  try {
    const valid = ['pending','confirmed','shipped','delivered','cancelled'];
    if (!valid.includes(req.body.status)) return res.status(400).json({ success:false, message:'Invalid status.' });
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new:true });
    if (!order) return res.status(404).json({ success:false, message:'Order not found.' });
    res.json({ success:true, order });
  } catch (e) { res.status(500).json({ success:false, message:'Could not update order.' }); }
};
