/* ============================================================
   VELNOVA — Main Frontend JavaScript
   ============================================================ */

const API = '';  // same origin — server serves frontend

// ── CART ──────────────────────────────────────────────────
let cart = JSON.parse(localStorage.getItem('velnova_cart')) || [];

function saveCart() {
  localStorage.setItem('velnova_cart', JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('.cart-badge').forEach(el => {
    el.textContent = total;
    el.classList.toggle('on', total > 0);
  });
}

function addToCart(product) {
  const ex = cart.find(i => i.id === product.id && i.size === product.size);
  if (ex) ex.qty += product.qty || 1;
  else cart.push({ ...product, qty: product.qty || 1 });
  saveCart();
  toast(`${product.name} added to cart`);
}

function removeFromCart(id, size) {
  cart = cart.filter(i => !(i.id === id && i.size === size));
  saveCart();
}

function updateCartQty(id, size, delta) {
  const item = cart.find(i => i.id === id && i.size === size);
  if (item) { item.qty = Math.max(1, item.qty + delta); saveCart(); }
}

function cartTotal() {
  return cart.reduce((s, i) => s + i.price * i.qty, 0);
}

function fmt(n) { return '₦' + Number(n).toLocaleString('en-NG'); }

// ── TOAST ─────────────────────────────────────────────────
function toast(msg, type = 'ok') {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg><span></span>`;
    document.body.appendChild(el);
  }
  el.querySelector('span').textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 3400);
}

function initNav() {
  const nav  = document.querySelector('.nav');
  const ham  = document.querySelector('.hamburger');
  const mob  = document.querySelector('.mob-nav');
  const cls  = document.querySelector('.mob-close');

  window.addEventListener('scroll', () => nav?.classList.toggle('scrolled', scrollY > 10));

  ham?.addEventListener('click', () => mob?.classList.add('open'));
  cls?.addEventListener('click', () => mob?.classList.remove('open'));
  mob?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mob.classList.remove('open')));

  // active link
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mob-nav a').forEach(a => {
    if (a.getAttribute('href') === page) a.classList.add('active');
  });

  // smart account btn
  (async () => {
    try {
      const r = await fetch('/api/auth/me', { credentials: 'include' });
      const d = await r.json();
      const btn = document.getElementById('nav-acc-btn');
      if (!btn) return;
      if (d.success) btn.href = d.user.role === 'admin' ? '/admin.html' : '/profile.html';
      else btn.href = '/login.html';
    } catch {}
  })();

  updateCartBadge();
}

// ── SCROLL ANIMATIONS ────────────────────────────────────
function initScrollAnim() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('vis'), i * 80);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));
}

// ── NEWSLETTER ────────────────────────────────────────────
function initNewsletter() {
  document.querySelectorAll('.nl-form').forEach(f => {
    f.addEventListener('submit', e => {
      e.preventDefault();
      const inp = f.querySelector('input');
      if (inp.value.includes('@')) { toast('Subscribed! Thank you.'); inp.value = ''; }
      else toast('Please enter a valid email.');
    });
  });
}

// ── FORM VALIDATE ─────────────────────────────────────────
function validateForm(form) {
  let ok = true;
  form.querySelectorAll('[required]').forEach(f => {
    const err  = f.parentElement.querySelector('.form-err');
    const bad  = !f.value.trim() || (f.type === 'email' && !/\S+@\S+\.\S+/.test(f.value));
    f.classList.toggle('err', bad);
    err?.classList.toggle('show', bad);
    if (bad) ok = false;
  });
  return ok;
}

// ── HOME PAGE ─────────────────────────────────────────────
async function initHome() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;
  try {
    const r = await fetch('/api/products?limit=8');
    const d = await r.json();
    if (d.success && d.products.length) {
      grid.innerHTML = d.products.map((p, i) => productCard(p, i * 55)).join('');
    } else {
      grid.innerHTML = '<p style="color:var(--grey-400);text-align:center;grid-column:1/-1;padding:40px">No products yet. Check back soon.</p>';
    }
  } catch { grid.innerHTML = '<p style="color:var(--grey-400);text-align:center;grid-column:1/-1;padding:40px">Could not load products.</p>'; }
  initScrollAnim();
}

// ── SHOP PAGE ─────────────────────────────────────────────
async function initShop() {
  const grid = document.getElementById('shop-grid');
  if (!grid) return;
  let currentCat = new URLSearchParams(location.search).get('cat') || 'all';

  // set active filter
  document.querySelectorAll('.filter-opt').forEach(btn => {
    if (btn.dataset.filter === currentCat) btn.classList.add('on');
    btn.addEventListener('click', () => {
      currentCat = btn.dataset.filter;
      document.querySelectorAll('.filter-opt').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      loadShopProducts();
    });
  });

  async function loadShopProducts() {
    grid.innerHTML = '<p style="color:var(--grey-400);grid-column:1/-1;padding:24px">Loading...</p>';
    try {
      const url = currentCat === 'all' ? '/api/products' : `/api/products?cat=${currentCat}`;
      const r   = await fetch(url);
      const d   = await r.json();
      const count = document.getElementById('shop-count');
      if (count) count.textContent = `${d.products?.length || 0} Products`;
      if (d.success && d.products.length) grid.innerHTML = d.products.map((p, i) => productCard(p, i * 40)).join('');
      else grid.innerHTML = '<p style="color:var(--grey-400);grid-column:1/-1;padding:40px;text-align:center">No products in this category yet.</p>';
      initScrollAnim();
    } catch { grid.innerHTML = '<p style="color:var(--grey-400);grid-column:1/-1;padding:24px">Could not load products.</p>'; }
  }
  loadShopProducts();
}

// ── PRODUCT CARD HTML ─────────────────────────────────────
function productCard(p, delay = 0) {
  const img = p.images && p.images[0] ? p.images[0] : '';
  const badge = p.badge ? `<span class="p-badge ${p.badge === 'New In' ? 'new-in' : 'sale'}">${p.badge}</span>` : '';
  return `
    <div class="p-card fade-in vis" style="animation-delay:${delay}ms" onclick="location.href='product.html?id=${p._id}'">
      <div style="width:100%;height:380px;overflow:hidden;background:#f2f2f0;position:relative;">
        ${badge}
        ${img ? `<img src="${img}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;display:block;">` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#9a9a98;font-size:0.8rem;">No Image</div>`}
      </div>
      <div style="padding:12px 0 6px;">
        <div style="font-size:0.62rem;letter-spacing:0.12em;text-transform:uppercase;color:#9a9a98;margin-bottom:5px;">${p.category}</div>
        <div style="font-family:'Playfair Display',serif;font-size:1.05rem;margin-bottom:7px;">${p.name}</div>
        <div style="font-size:0.875rem;">₦${Number(p.price).toLocaleString('en-NG')}</div>
      </div>
    </div>`;
}

// ── PRODUCT DETAIL ────────────────────────────────────────
async function initProduct() {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) return;
  try {
    const r = await fetch(`/api/products/${id}`);
    const d = await r.json();
    if (!d.success) return;
    const p = d.product;

    document.title = `${p.name} — VELNOVA`;
    document.getElementById('pd-cat').textContent   = p.category;
    document.getElementById('pd-name').textContent  = p.name;
    document.getElementById('pd-price').textContent = fmt(p.price);
    document.getElementById('pd-desc').textContent  = p.description;
    document.getElementById('pd-name-bc').textContent = p.name;

    // Gallery
    const imgs = p.images?.length ? p.images : ['https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80'];
    document.getElementById('pd-main-img').src = imgs[0];
    document.getElementById('pd-thumbs').innerHTML = imgs.map((src, i) =>
      `<div class="pd-thumb ${i===0?'on':''}" onclick="switchThumb(this,'${src}')"><img src="${src}" loading="lazy"></div>`
    ).join('');

    // Sizes
    const sizes = p.sizes?.length ? p.sizes : ['XS','S','M','L','XL'];
    document.getElementById('pd-sizes').innerHTML = sizes.map(s =>
      `<button class="sz-btn" data-size="${s}" onclick="selectSize(this)">${s}</button>`
    ).join('');

    // Related
    const relGrid = document.getElementById('related-grid');
    if (relGrid) {
      const r2 = await fetch(`/api/products?cat=${p.category}&limit=4`);
      const d2 = await r2.json();
      const related = (d2.products || []).filter(x => x._id !== p._id).slice(0, 4);
      relGrid.innerHTML = related.map(rp => productCard(rp)).join('') || '';
    }

    // Cart button
    let qty = 1;
    document.getElementById('qty-num').textContent = qty;
    document.getElementById('qty-plus').onclick  = () => { qty = Math.min(10, qty+1); document.getElementById('qty-num').textContent = qty; };
    document.getElementById('qty-minus').onclick = () => { qty = Math.max(1, qty-1); document.getElementById('qty-num').textContent = qty; };

    document.getElementById('add-to-cart').onclick = () => {
      const active = document.querySelector('.sz-btn.on');
      if (!active) { toast('Please select a size'); return; }
      addToCart({ id: p._id, name: p.name, price: p.price, size: active.dataset.size, qty, image: imgs[0], category: p.category });
    };
  } catch (e) { console.error(e); }
}

window.switchThumb = (el, src) => {
  document.getElementById('pd-main-img').src = src;
  document.querySelectorAll('.pd-thumb').forEach(t => t.classList.remove('on'));
  el.classList.add('on');
};
window.selectSize = (el) => {
  document.querySelectorAll('.sz-btn').forEach(b => b.classList.remove('on'));
  el.classList.add('on');
};
window.quickAdd = async (id) => {
  const r = await fetch(`/api/products/${id}`);
  const d = await r.json();
  if (d.success) addToCart({ id: d.product._id, name: d.product.name, price: d.product.price, size: 'M', qty: 1, image: d.product.images?.[0], category: d.product.category });
};

// ── CART PAGE ─────────────────────────────────────────────
function initCartPage() {
  const container = document.getElementById('cart-container');
  const summaryEl = document.getElementById('cart-summary');
  if (!container) return;

  function render() {
    if (!cart.length) {
      container.innerHTML = `
        <div class="empty-cart" style="grid-column:1/-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
          <h3>Your cart is empty</h3>
          <p>Explore our collections and find something you love.</p>
          <a href="shop.html" class="btn btn-dark">Shop Now</a>
        </div>`;
      if (summaryEl) summaryEl.innerHTML = '';
      return;
    }

    container.innerHTML = `
      <div class="cart-hdr"><div>Product</div><div>Price</div><div>Quantity</div><div>Total</div><div></div></div>
      ${cart.map(item => `
        <div class="cart-row">
          <div class="cart-item-info">
            <div class="cart-item-img"><img src="${item.image || ''}" alt="${item.name}"></div>
            <div>
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-var">Size: ${item.size} · ${item.category}</div>
            </div>
          </div>
          <div>${fmt(item.price)}</div>
          <div>
            <div class="cart-qty">
              <button class="cart-qty-btn" onclick="cartQtyChange('${item.id}','${item.size}',-1)">−</button>
              <div class="cart-qty-num">${item.qty}</div>
              <button class="cart-qty-btn" onclick="cartQtyChange('${item.id}','${item.size}',1)">+</button>
            </div>
          </div>
          <div>${fmt(item.price * item.qty)}</div>
          <button class="cart-del" onclick="cartDel('${item.id}','${item.size}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>`).join('')}`;

    const sub      = cartTotal();
    const shipping = sub > 50000 ? 0 : 2500;
    const total    = sub + shipping;

    if (summaryEl) summaryEl.innerHTML = `
      <div class="cart-summary-box">
        <h3>Order Summary</h3>
        <div class="sum-row"><span>Subtotal</span><span>${fmt(sub)}</span></div>
        <div class="sum-row"><span>Shipping</span><span>${shipping === 0 ? 'Free' : fmt(shipping)}</span></div>
        <div class="sum-row total"><span>Total</span><span>${fmt(total)}</span></div>
        <a href="checkout.html" class="btn btn-dark btn-full btn-lg" style="margin-bottom:12px">Proceed to Checkout</a>
        <a href="shop.html" class="btn btn-ghost btn-full btn-sm">Continue Shopping</a>
      </div>`;
  }

  render();
}

window.cartQtyChange = (id, size, delta) => { updateCartQty(id, size, delta); initCartPage(); };
window.cartDel = (id, size) => { removeFromCart(id, size); initCartPage(); };

// ── CHECKOUT PAGE ─────────────────────────────────────────
async function initCheckout() {
  const orderItems = document.getElementById('order-items');
  if (!orderItems) return;

  // Check login
  try {
    const r = await fetch('/api/auth/me', { credentials: 'include' });
    const d = await r.json();
    if (!d.success) { toast('Please log in to checkout'); setTimeout(() => location.href = '/login.html', 1500); return; }
  } catch { return; }

  if (!cart.length) { toast('Your cart is empty'); setTimeout(() => location.href = '/cart.html', 1500); return; }

  // Populate order summary
  const sub      = cartTotal();
  const shipping = sub > 50000 ? 0 : 2500;
  const total    = sub + shipping;

  orderItems.innerHTML = cart.map(i => `
    <div class="order-item-row">
      <div class="order-item-img"><img src="${i.image || ''}" alt="${i.name}"></div>
      <div class="order-item-info">
        <div class="order-item-name">${i.name}</div>
        <div class="order-item-var">Size: ${i.size} · Qty: ${i.qty}</div>
      </div>
      <div class="order-item-price">${fmt(i.price * i.qty)}</div>
    </div>`).join('');

  document.getElementById('co-sub').textContent      = fmt(sub);
  document.getElementById('co-ship').textContent     = shipping === 0 ? 'Free' : fmt(shipping);
  document.getElementById('co-total').textContent    = fmt(total);

  // Bank details from admin settings
  try {
    const r = await fetch('/api/settings/bank');
    const d = await r.json();
    if (d.success && d.bank) {
      document.getElementById('bank-name').textContent    = d.bank.bankName   || '—';
      document.getElementById('bank-account').textContent = d.bank.accountNo  || '—';
      document.getElementById('bank-holder').textContent  = d.bank.accountName|| '—';
    }
  } catch {}

  // Place order
  document.getElementById('place-order-btn').onclick = async () => {
    const form = document.getElementById('co-form');
    if (!validateForm(form)) return;

    const btn = document.getElementById('place-order-btn');
    btn.textContent = 'Placing order...'; btn.disabled = true;

    const payload = {
      items: cart.map(i => ({ productId: i.id, name: i.name, price: i.price, qty: i.qty, size: i.size })),
      shippingAddress: {
        fullName: form.querySelector('#co-fullname').value,
        phone:    form.querySelector('#co-phone').value,
        address:  form.querySelector('#co-address').value,
        city:     form.querySelector('#co-city').value,
        state:    form.querySelector('#co-state').value,
        country:  'Nigeria',
      },
      subtotal: sub, shipping, total,
    };

    try {
      const r = await fetch('/api/orders', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const d = await r.json();
      if (d.success) {
        localStorage.removeItem('velnova_cart');
        toast('Order placed! Thank you.');
        setTimeout(() => location.href = `/order-confirm.html?id=${d.orderId}`, 1500);
      } else {
        toast(d.message); btn.textContent = 'Place Order'; btn.disabled = false;
      }
    } catch { toast('Error. Try again.'); btn.textContent = 'Place Order'; btn.disabled = false; }
  };
}

// ── AUTH PAGE ─────────────────────────────────────────────
function initAuth() {
  document.querySelectorAll('.auth-tab').forEach(t => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach(x => x.classList.remove('on'));
      document.querySelectorAll('.auth-form').forEach(x => x.classList.remove('on'));
      t.classList.add('on');
      document.getElementById(t.dataset.form)?.classList.add('on');
    });
  });

  document.getElementById('login-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateForm(e.target)) return;
    const btn = e.target.querySelector('button[type="submit"]');
    btn.textContent = 'Signing in...'; btn.disabled = true;
    const email    = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;
    try {
      const r = await fetch('/api/auth/login', { method:'POST', credentials:'include', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email, password }) });
      const d = await r.json();
      if (d.success) { toast(`Welcome back, ${d.user.name}!`); setTimeout(() => location.href = d.redirect, 1000); }
      else { toast(d.message); btn.textContent = 'Sign In'; btn.disabled = false; }
    } catch { toast('Connection error.'); btn.textContent = 'Sign In'; btn.disabled = false; }
  });

  document.getElementById('register-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateForm(e.target)) return;
    const pw = e.target.querySelectorAll('input[type="password"]');
    if (pw[0].value !== pw[1].value) { toast('Passwords do not match'); return; }
    const btn = e.target.querySelector('button[type="submit"]');
    btn.textContent = 'Creating...'; btn.disabled = true;
    const name     = e.target.querySelector('input[name="name"]').value;
    const email    = e.target.querySelector('input[type="email"]').value;
    const password = pw[0].value;
    try {
      const r = await fetch('/api/auth/signup', { method:'POST', credentials:'include', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ name, email, password }) });
      const d = await r.json();
      if (d.success) { toast('Account created! Welcome to VELNOVA.'); setTimeout(() => location.href = d.redirect, 1000); }
      else { toast(d.message); btn.textContent = 'Create Account'; btn.disabled = false; }
    } catch { toast('Connection error.'); btn.textContent = 'Create Account'; btn.disabled = false; }
  });
}

// ── PROFILE PAGE ──────────────────────────────────────────
async function initProfile() {
  if (!document.getElementById('profile-name-display')) return;
  try {
    const r = await fetch('/api/auth/me', { credentials: 'include' });
    const d = await r.json();
    if (!d.success) { location.href = '/login.html'; return; }
    const u = d.user;
    document.getElementById('profile-name-display').textContent  = u.name;
    document.getElementById('profile-email-display').textContent = u.email;
    document.getElementById('detail-name').value  = u.name;
    document.getElementById('detail-email').value = u.email;
    document.title = `${u.name} — VELNOVA`;
  } catch { location.href = '/login.html'; }

  await loadMyOrders();
}

async function loadMyOrders() {
  const el = document.getElementById('my-orders');
  if (!el) return;
  try {
    const r = await fetch('/api/orders/my', { credentials: 'include' });
    const d = await r.json();
    if (!d.success || !d.orders.length) {
      el.innerHTML = '<div style="text-align:center;padding:48px;color:var(--grey-400)"><p style="margin-bottom:16px">No orders yet.</p><a href="shop.html" class="btn btn-dark btn-sm">Shop Now</a></div>';
      return;
    }
    const sc = { pending:'status-pending', confirmed:'status-confirmed', shipped:'status-shipped', delivered:'status-delivered', cancelled:'status-cancelled' };
    el.innerHTML = d.orders.map(o => `
      <div style="border:1px solid var(--grey-100);margin-bottom:18px;">
        <div style="background:var(--grey-50);padding:14px 20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
          <div><div class="eyebrow" style="color:var(--grey-400);margin-bottom:3px;">Order</div><strong>#${String(o._id).slice(-6).toUpperCase()}</strong></div>
          <div><div class="eyebrow" style="color:var(--grey-400);margin-bottom:3px;">Date</div>${new Date(o.placedAt).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})}</div>
          <div><div class="eyebrow" style="color:var(--grey-400);margin-bottom:3px;">Total</div><strong>${fmt(o.total)}</strong></div>
          <span class="status-pill ${sc[o.status]||''}">${o.status}</span>
        </div>
        <div style="padding:16px 20px;">
          ${o.items.map(i => `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--grey-50);font-size:0.875rem;"><span>${i.name} <span style="color:var(--grey-400)">× ${i.qty} (${i.size})</span></span><span>${fmt(i.price*i.qty)}</span></div>`).join('')}
          <div style="padding-top:12px;font-size:0.8rem;color:var(--grey-600);">
            <strong style="font-weight:500;">Delivery to:</strong> ${o.shippingAddress?.address}, ${o.shippingAddress?.city}, ${o.shippingAddress?.state}
          </div>
        </div>
      </div>`).join('');
  } catch { el.innerHTML = '<p style="color:var(--grey-600)">Could not load orders.</p>'; }
}

// profile tab switcher
window.profileTab = (tab) => {
  document.querySelectorAll('.profile-panel').forEach(p => p.classList.remove('on'));
  document.querySelectorAll('.profile-nav-btn').forEach(b => b.classList.remove('on'));
  document.getElementById(`panel-${tab}`)?.classList.add('on');
  event.currentTarget.classList.add('on');
};

// ── LOGOUT ────────────────────────────────────────────────
window.doLogout = async () => {
  await fetch('/api/auth/logout', { method:'POST', credentials:'include' });
  localStorage.removeItem('velnova_cart');
  location.href = '/login.html';
};

// ── INIT ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initScrollAnim();
  initNewsletter();
  initHome();
  initShop();
  initProduct();
  initCartPage();
  initCheckout();
  initAuth();
  initProfile();
});