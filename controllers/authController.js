const User = require('../models/User');

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success:false, message:'All fields required.' });
    if (await User.findOne({ email })) return res.status(409).json({ success:false, message:'Email already registered.' });
    const user = await User.create({ name, email, password });
    req.session.user = { id: user._id, name: user.name, email: user.email, role: user.role };
    res.status(201).json({ success:true, user: req.session.user, redirect: '/profile.html' });
  } catch (e) { res.status(500).json({ success:false, message:'Server error.' }); }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success:false, message:'Email and password required.' });
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ success:false, message:'Invalid email or password.' });
    req.session.user = { id: user._id, name: user.name, email: user.email, role: user.role };
    res.json({ success:true, user: req.session.user, redirect: user.role === 'admin' ? '/admin.html' : '/profile.html' });
  } catch (e) { res.status(500).json({ success:false, message:'Server error.' }); }
};

exports.logout = (req, res) => {
  req.session.destroy(() => { res.clearCookie('connect.sid'); res.json({ success:true }); });
};

exports.getMe = (req, res) => {
  if (!req.session.user) return res.status(401).json({ success:false });
  res.json({ success:true, user: req.session.user });
};
