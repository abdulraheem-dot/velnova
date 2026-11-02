const User    = require('../models/User');
const Order   = require('../models/Order');
const Product = require('../models/Product');
const Setting = require('../models/Setting');

exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalOrders, totalProducts, rev] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments(),
      Order.aggregate([{ $match:{ status:{ $ne:'cancelled' } } }, { $group:{ _id:null, total:{ $sum:'$total' } } }]),
    ]);
    res.json({ success:true, stats: { totalUsers, totalOrders, totalProducts, revenue: rev[0]?.total || 0 } });
  } catch (e) { res.status(500).json({ success:false, message:'Could not fetch stats.' }); }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success:true, users });
  } catch (e) { res.status(500).json({ success:false }); }
};

exports.getBankSettings = async (req, res) => {
  try {
    const s = await Setting.findOne({ key: 'bank' });
    res.json({ success:true, bank: s?.value || null });
  } catch (e) { res.status(500).json({ success:false }); }
};

exports.saveBankSettings = async (req, res) => {
  try {
    await Setting.findOneAndUpdate({ key:'bank' }, { key:'bank', value: req.body }, { upsert:true });
    res.json({ success:true, message:'Saved.' });
  } catch (e) { res.status(500).json({ success:false }); }
};
