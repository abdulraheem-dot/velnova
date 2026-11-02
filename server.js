require('dotenv').config();
const express   = require('express');
const session   = require('express-session');
const cors      = require('cors');
const path      = require('path');
const fs        = require('fs');
const connectDB = require('./config/db');

const app  = express();
const PORT = process.env.PORT || 3000;

connectDB();

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// ── Serve uploads FIRST before any auth middleware ────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret:            process.env.SESSION_SECRET || 'velnova_secret',
  resave:            false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 },
}));

// Serve all frontend files
app.use(express.static(__dirname));

// API Routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/admin',    require('./routes/admin'));

const Setting = require('./models/Setting');
app.get('/api/settings/bank', async (req, res) => {
  try { const s = await Setting.findOne({ key:'bank' }); res.json({ success:true, bank: s?.value || null }); }
  catch { res.json({ success:false, bank:null }); }
});
app.post('/api/settings/bank', async (req, res) => {
  try { await Setting.findOneAndUpdate({ key:'bank' }, { key:'bank', value:req.body }, { upsert:true }); res.json({ success:true }); }
  catch { res.status(500).json({ success:false }); }
});

app.get('/api/health', (req, res) => res.json({ success:true }));

const User = require('./models/User');
app.get('/api/make-admin', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.send('❌ Add your email like this: /api/make-admin?email=you@gmail.com');
  try {
    const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
    if (!user) return res.send(`❌ No account found for <b>${email}</b>. Please register first at <a href="/login.html">/login.html</a>`);
    res.send(`✅ <b>${user.name}</b> (${user.email}) is now an ADMIN! <a href="/login.html">Click here to log in</a>`);
  } catch (e) { res.send('❌ Error: ' + e.message); }
});

app.listen(PORT, () => {
  console.log('\n🚀 VELNOVA running at http://localhost:' + PORT);
  console.log('📦 Open http://localhost:' + PORT + '/index.html');
  console.log('🔧 Admin:  http://localhost:' + PORT + '/admin.html\n');
});