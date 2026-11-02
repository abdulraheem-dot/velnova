const requireLogin = (req, res, next) => {
  if (req.session?.user) return next();
  res.status(401).json({ success: false, message: 'Please log in.' });
};
const requireAdmin = (req, res, next) => {
  if (req.session?.user?.role === 'admin') return next();
  res.status(403).json({ success: false, message: 'Admin access required.' });
};
module.exports = { requireLogin, requireAdmin };
