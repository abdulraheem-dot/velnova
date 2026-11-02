/* ── VELNOVA Frontend JS ── */

// ── CART ────────────────────────────────────────────────
const CART_KEY = 'velnova_cart';
let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];

function saveCart() { localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartBadge(); }

function updateCartBadge() {
  const n = cart.reduce((s,i) => s+i.qty, 0);
  document.querySelectorAll('.cart-badge').forEach(el => {
    el.textContent = n;
    el.classList.toggle('show', n > 0);
  });
}

function addToCart(item) {
  const ex = cart.find(i => i.productId === item.productId && i.size === item.size);
  ex ? ex.qty++ : cart.push({...item, qty:1});
  saveCart();
  toast(`${item.name} added to cart`);
}

function removeFromCart(productId, size) {
  cart = cart.filter(i => !(i.productId === productId && i.size === size));
  saveCart();
}

function updateQty(productId, size, delta) {
  const i = cart.find(i => i.productId === productId && i.size === size);
  if (i) { i.qty = Math.max(1, i.qty + delta); saveCart(); }
}

function cartTotal() { return cart.reduce((s,i) => s + i.price * i.qty, 0); }

// ── TOAST ────────────────────────────────────────────────
function toast(msg, err=false) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg><span></span>`;
    document.body.appendChild(el);
  }
  el.querySelector('span').textContent = msg;
  el.querySelector('svg').style.color = err ? '#eb5757' : '#6fcf97';
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 3000);
}

// ── FORMAT ───────────────────────────────────────────────
const fmt = n => '₦' + Number(n).toLocaleString('en-NG');

// ── NAV ──────────────────────────────────────────────────
function initNav() {
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => nav?.classList.toggle('scrolled', scrollY > 20));

  document.querySelector('.hamburger')?.addEventListener('click', () =>
    document.querySelector('.mobile-nav')?.classList.add('open'));
  document.querySelector('.mobile-close')?.addEventListener('click', () =>
    document.querySelector('.mobile-nav')?.classList.remove('open'));

  // Active link
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(a => {
    if ((a.getAttribute('href') || '').includes(page)) a.classList.add('active');
  });

  // Check session → update account icon
  fetch('/api/auth/me', {credentials:'include'}).then(r=>r.json()).then(d => {
    const btn = document.getElementById('nav-acc');
    if (!btn) return;
    btn.href = d.success ? (d.user.role === 'admin' ? '/admin.html' : '/profile.html') : '/login.html';
  }).catch(()=>{});

  updateCartBadge();
}

// ── SCROLL ANIMATIONS ───────────────────────────────────
function initFade() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); obs.unobserve(e.target); } });
  }, {threshold:.1});
  document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));
}

// ── VALIDATE FORM ────────────────────────────────────────
function validateForm(form) {
  let ok = true;
  form.querySelectorAll('[required]').forEach(f => {
    const err = f.parentElement.querySelector('.form-err');
    const bad = !f.value.trim() || (f.type==='email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value));
    f.classList.toggle('err', bad);
    if (err) err.classList.toggle('show', bad);
    if (bad) ok = false;
  });
  return ok;
}

// ── PRODUCT CARD ─────────────────────────────────────────
function buildCard(p, delay=0) {
  // images is an array of full paths like "/uploads/filename.jpg"
  const img = (p.images && p.images[0]) ? p.images[0] : 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80';
  const badge = p.badge ? `<span class="prod-badge">${p.badge}</span>` : '';
  return `
    <div class="prod-card fade-in vis" style="animation-delay:${delay}ms" onclick="location.href='/product.html?id=${p._id}'">
      <div class="prod-img">
        ${badge}
        <img src="${img}" alt="${p.name}" loading="lazy">
        <div class="prod-overlay">
          <button class="btn btn-white btn-sm" onclick="event.stopPropagation();quickAdd('${p._id}','${p.name}',${p.price},'${img}')">Quick Add</button>
        </div>
      </div>
      <div class="prod-info">
        <div class="prod-cat">${p.category}</div>
        <div class="prod-name">${p.name}</div>
        <div class="prod-price">${fmt(p.price)}</div>
      </div>
    </div>`;
}

function quickAdd(id, name, price, image) {
  addToCart({ productId: id, name, price, size: 'M', image });
}

// ── NEWSLETTER ───────────────────────────────────────────
function initNewsletter() {
  document.querySelectorAll('.nl-form').forEach(f => {
    f.addEventListener('submit', e => {
      e.preventDefault();
      const inp = f.querySelector('input');
      inp.value && inp.value.includes('@') ? (toast('Subscribed! Thank you.'), inp.value='') : toast('Enter a valid email.', true);
    });
  });
}

// ── HOME ─────────────────────────────────────────────────
async function initHome() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;
  try {
    const res  = await fetch('/api/products?featured=true');
    const data = await res.json();
    let products = data.products || [];
    if (!products.length) {
      // Fall back to all products
      const r2 = await fetch('/api/products');
      const d2 = await r2.json();
      products = (d2.products || []).slice(0, 8);
    }
    grid.innerHTML = products.length
      ? products.map((p,i) => buildCard(p, i*60)).join('')
      : '<p style="color:var(--grey-400);grid-column:1/-1;text-align:center;padding:48px 0">No products yet. Admin can add them.</p>';
    initFade();
  } catch(e) {
    grid.innerHTML = '<p style="color:var(--grey-400);grid-column:1/-1;text-align:center;padding:48px 0">Could not load products.</p>';
  }
}

// ── SHOP ─────────────────────────────────────────────────
async function initShop() {
  const grid = document.getElementById('shop-grid');
  if (!grid) return;
  let cat = new URLSearchParams(location.search).get('cat') || 'all';

  async function load() {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:40px;color:var(--grey-400)">Loading...</p>';
    const url = cat === 'all' ? '/api/products' : `/api/products?cat=${cat}`;
    try {
      const res  = await fetch(url);
      const data = await res.json();
      const products = data.products || [];
      const cnt = document.getElementById('shop-count');
      if (cnt) cnt.textContent = `${products.length} Product${products.length!==1?'s':''}`;
      grid.innerHTML = products.length
        ? products.map((p,i) => buildCard(p, i*40)).join('')
        : '<p style="grid-column:1/-1;text-align:center;padding:48px 0;color:var(--grey-400)">No products in this category yet.</p>';
      initFade();
    } catch(e) {
      grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:40px;color:var(--grey-400)">Could not load products.</p>';
    }
  }

  document.querySelectorAll('.filter-item').forEach(btn => {
    if (btn.dataset.cat === cat) btn.classList.add('active');
    btn.addEventListener('click', () => {
      cat = btn.dataset.cat;
      document.querySelectorAll('.filter-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      load();
    });
  });

  load();
}

// ── PRODUCT DETAIL ───────────────────────────────────────
async function initProduct() {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) return;
  try {
    const res  = await fetch(`/api/products/${id}`);
    const data = await res.json();
    if (!data.success) return;
    const p = data.product;

    document.title = `${p.name} — VELNOVA`;
    const imgs = p.images && p.images.length
      ? p.images
      : ['https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80'];

    document.getElementById('pd-name').textContent  = p.name;
    document.getElementById('pd-price').textContent = fmt(p.price);
    document.getElementById('pd-desc').textContent  = p.description;
    document.getElementById('pd-cat').textContent   = p.category;
    document.getElementById('pd-name-bc').textContent = p.name;
    const mainImg = document.getElementById('pd-main-img');
    if (mainImg) mainImg.src = imgs[0];

    // Sizes
    const sizesEl = document.getElementById('pd-sizes');
    if (sizesEl) {
      sizesEl.innerHTML = p.sizes.map(s =>
        `<button class="sz-btn" data-size="${s}" onclick="selectSize(this,'${s}')">${s}</button>`
      ).join('');
    }

    let selectedSize = null, qty = 1;

    window.selectSize = (btn, s) => {
      document.querySelectorAll('.sz-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedSize = s;
    };

    document.getElementById('qty-plus')?.addEventListener('click', () => {
      qty = Math.min(10, qty+1);
      document.getElementById('qty-num').textContent = qty;
    });
    document.getElementById('qty-minus')?.addEventListener('click', () => {
      qty = Math.max(1, qty-1);
      document.getElementById('qty-num').textContent = qty;
    });

    document.getElementById('add-cart-btn')?.addEventListener('click', () => {
      if (!selectedSize) { toast('Please select a size', true); return; }
      for (let i=0;i<qty;i++) addToCart({ productId: p._id, name: p.name, price: p.price, size: selectedSize, image: imgs[0] });
      toast(`${p.name} added to cart`);
    });

    // Related
    const relGrid = document.getElementById('related-grid');
    if (relGrid) {
      const r2 = await fetch(`/api/products?cat=${p.category}`);
      const d2 = await r2.json();
      const rel = (d2.products || []).filter(x => x._id !== p._id).slice(0,4);
      relGrid.innerHTML = rel.map((x,i) => buildCard(x, i*60)).join('');
    }
  } catch(e) { console.error(e); }
}

// ── CART PAGE ────────────────────────────────────────────
function initCart() {
  const container = document.getElementById('cart-container');
  if (!container) return;

  function render() {
    if (!cart.length) {
      container.innerHTML = `
        <div class="empty-cart">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
          <h3>Your cart is empty</h3>
          <p>Add some items to get started</p>
          <a href="/shop.html" class="btn btn-dark">Shop Now</a>
        </div>`;
      document.getElementById('cart-sum-area').innerHTML = '';
      return;
    }

    container.innerHTML = `
      <div class="cart-hdr"><div>Product</div><div>Price</div><div>Quantity</div><div>Total</div><div></div></div>
      ${cart.map(item => `
        <div class="cart-row">
          <div class="cart-item-info">
            <div class="cart-item-img"><img src="${item.image || 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=200&q=60'}" alt="${item.name}"></div>
            <div>
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-meta">Size: ${item.size}</div>
            </div>
          </div>
          <div>${fmt(item.price)}</div>
          <div>
            <div class="cart-qty">
              <button class="cq-btn" onclick="cqty('${item.productId}','${item.size}',-1)">−</button>
              <div class="cq-num">${item.qty}</div>
              <button class="cq-btn" onclick="cqty('${item.productId}','${item.size}',1)">+</button>
            </div>
          </div>
          <div>${fmt(item.price * item.qty)}</div>
          <div class="cart-remove" onclick="cremove('${item.productId}','${item.size}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
          </div>
        </div>`).join('')}`;

    const sub = cartTotal(), delivery = 2000, total = sub + delivery;
    document.getElementById('cart-sum-area').innerHTML = `
      <div class="cart-summary">
        <h3>Order Summary</h3>
        <div class="sum-row"><span>Subtotal</span><span>${fmt(sub)}</span></div>
        <div class="sum-row"><span>Delivery Fee</span><span>${fmt(delivery)}</span></div>
        <div class="sum-row total"><span>Total</span><span>${fmt(total)}</span></div>
        <a href="/checkout.html" class="btn btn-dark btn-full btn-lg" style="margin-bottom:12px">Proceed to Checkout</a>
        <a href="/shop.html" class="btn btn-outline btn-full">Continue Shopping</a>
      </div>`;
  }

  render();
}

window.cqty = (id, size, d) => { updateQty(id, size, d); initCart(); };
window.cremove = (id, size) => { removeFromCart(id, size); initCart(); };

// ── CHECKOUT ─────────────────────────────────────────────
async function initCheckout() {
  const area = document.getElementById('co-items');
  if (!area) return;

  // Check login
  const me = await fetch('/api/auth/me', {credentials:'include'}).then(r=>r.json()).catch(()=>({success:false}));
  if (!me.success) { toast('Please log in first', true); setTimeout(()=>location.href='/login.html', 1500); return; }

  // Load bank details
  try {
    const bd = await fetch('/api/admin/settings').then(r=>r.json());
    const box = document.getElementById('bank-details-box');
    if (box && bd.bankDetails) {
      box.innerHTML = `
        <div class="bank-detail"><span>Bank Name</span><strong>${bd.bankDetails.bankName}</strong></div>
        <div class="bank-detail"><span>Account Name</span><strong>${bd.bankDetails.accountName}</strong></div>
        <div class="bank-detail"><span>Account Number</span><strong>${bd.bankDetails.accountNumber}</strong></div>`;
    } else if (box) {
      box.innerHTML = '<p style="color:var(--grey-400);font-size:.85rem">Bank details not set yet. Contact velnovaclothing@gmail.com</p>';
    }
  } catch(e){}

  // Cart items
  area.innerHTML = cart.map(i => `
    <div class="co-item">
      <div class="co-item-img"><img src="${i.image || 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=100&q=60'}" alt="${i.name}"></div>
      <div style="flex:1">
        <div class="co-item-name">${i.name}</div>
        <div class="co-item-meta">Size: ${i.size} · Qty: ${i.qty}</div>
      </div>
      <div style="font-size:.85rem">${fmt(i.price*i.qty)}</div>
    </div>`).join('');

  const sub = cartTotal(), delivery = 2000, total = sub + delivery;
  document.getElementById('co-sub').textContent      = fmt(sub);
  document.getElementById('co-delivery').textContent = fmt(delivery);
  document.getElementById('co-total').textContent    = fmt(total);

  document.getElementById('place-order-btn')?.addEventListener('click', async () => {
    const form = document.getElementById('co-form');
    if (!validateForm(form)) return;
    if (!cart.length) { toast('Cart is empty', true); return; }

    const btn = document.getElementById('place-order-btn');
    btn.textContent = 'Placing order...'; btn.disabled = true;

    const payload = {
      items: cart.map(i => ({ productId: i.productId, qty: i.qty, size: i.size })),
      shippingAddress: {
        fullName:   document.getElementById('s-name').value,
        phone:      document.getElementById('s-phone').value,
        address:    document.getElementById('s-address').value,
        city:       document.getElementById('s-city').value,
        state:      document.getElementById('s-state').value,
        lga:        document.getElementById('s-lga')?.value || '',
        landmark:   document.getElementById('s-landmark')?.value || '',
      },
      notes: document.getElementById('s-notes')?.value || '',
    };

    try {
      const res  = await fetch('/api/orders', { method:'POST', credentials:'include', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
      const data = await res.json();
      if (data.success) {
        localStorage.removeItem(CART_KEY);
        toast('Order placed! Complete your bank transfer.');
        setTimeout(() => location.href = '/profile.html', 2000);
      } else {
        toast(data.message, true);
        btn.textContent = 'Place Order'; btn.disabled = false;
      }
    } catch(e) {
      toast('Connection error.', true);
      btn.textContent = 'Place Order'; btn.disabled = false;
    }
  });
}

// ── PROFILE ──────────────────────────────────────────────
async function initProfile() {
  const nameEl = document.getElementById('p-name');
  if (!nameEl) return;

  const me = await fetch('/api/auth/me',{credentials:'include'}).then(r=>r.json()).catch(()=>({success:false}));
  if (!me.success) { location.href='/login.html'; return; }

  const u = me.user;
  document.getElementById('p-name').textContent  = u.name;
  document.getElementById('p-email').textContent = u.email;
  document.getElementById('pd-name-val').textContent  = u.name;
  document.getElementById('pd-email-val').textContent = u.email;
  document.title = `${u.name} — VELNOVA`;

  // Orders
  const ordersEl = document.getElementById('orders-list');
  if (ordersEl) {
    const od = await fetch('/api/orders/my',{credentials:'include'}).then(r=>r.json()).catch(()=>({success:false}));
    const statusColor = {pending:'#c9a96e',confirmed:'#2980b9',processing:'#8e44ad',shipped:'#6b7280',delivered:'#27ae60',cancelled:'#c0392b'};
    if (!od.success || !od.orders.length) {
      ordersEl.innerHTML = `<div style="text-align:center;padding:56px 0"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--grey-200)" stroke-width="1" style="margin:0 auto 14px;display:block"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg><h3 style="font-family:var(--font-display);font-size:1.3rem;margin-bottom:8px">No orders yet</h3><p style="color:var(--grey-400);margin-bottom:20px">Start shopping!</p><a href="/shop.html" class="btn btn-dark">Shop Now</a></div>`;
    } else {
      ordersEl.innerHTML = od.orders.map(o => `
        <div style="border:1px solid var(--grey-200);margin-bottom:16px">
          <div style="background:var(--grey-50);padding:14px 18px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
            <div><div style="font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--grey-400);margin-bottom:2px">Order</div><strong>#${String(o._id).slice(-6).toUpperCase()}</strong></div>
            <div><div style="font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--grey-400);margin-bottom:2px">Date</div>${new Date(o.placedAt).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})}</div>
            <div><div style="font-size:.65rem;letter-spacing:.12em;text-transform:uppercase;color:var(--grey-400);margin-bottom:2px">Total</div><strong>${fmt(o.total)}</strong></div>
            <span style="background:${statusColor[o.status]};color:white;padding:4px 12px;font-size:.62rem;letter-spacing:.1em;text-transform:uppercase">${o.status}</span>
          </div>
          <div style="padding:16px 18px">
            ${o.items.map(i=>`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--grey-50);font-size:.85rem"><span>${i.name} × ${i.qty} (${i.size})</span><span>${fmt(i.price*i.qty)}</span></div>`).join('')}
            <div style="padding-top:12px;font-size:.8rem;color:var(--grey-600)">
              <strong style="font-weight:400">Delivery to:</strong> ${o.shippingAddress.address}, ${o.shippingAddress.city}, ${o.shippingAddress.state}
            </div>
            ${o.paymentStatus==='pending'?`<div style="background:var(--grey-50);padding:12px 14px;margin-top:12px;font-size:.8rem;color:var(--grey-600)">⏳ Awaiting payment confirmation. After transfer, email <a href="mailto:velnovaclothing@gmail.com" style="color:var(--black)">velnovaclothing@gmail.com</a> with your order number.</div>`:''}
          </div>
        </div>`).join('');
    }
  }
}

window.showProfileTab = function(tab) {
  document.querySelectorAll('.p-panel').forEach(p => p.style.display='none');
  document.querySelectorAll('.p-nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('panel-'+tab).style.display='block';
  document.getElementById('ptab-'+tab)?.classList.add('active');
};

window.profileLogout = async function() {
  await fetch('/api/auth/logout',{method:'POST',credentials:'include'});
  localStorage.removeItem(CART_KEY);
  location.href='/login.html';
};

// ── AUTH ─────────────────────────────────────────────────
function initAuth() {
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach(t=>t.classList.remove('active'));
      document.querySelectorAll('.auth-form').forEach(f=>f.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.form)?.classList.add('active');
    });
  });
}

window.handleLogin = async function() {
  const form = document.getElementById('login-form-el');
  if (!validateForm(form)) return;
  const btn = form.querySelector('.btn-dark');
  btn.textContent='Signing in...'; btn.disabled=true;
  try {
    const res  = await fetch('/api/auth/login',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:form.querySelector('input[type="email"]').value,password:form.querySelector('input[type="password"]').value})});
    const data = await res.json();
    if (data.success) { toast('Welcome back!'); setTimeout(()=>location.href=data.redirect,900); }
    else { toast(data.message,true); btn.textContent='Sign In'; btn.disabled=false; }
  } catch(e) { toast('Connection error.',true); btn.textContent='Sign In'; btn.disabled=false; }
};

window.handleRegister = async function() {
  const form = document.getElementById('register-form-el');
  const pw = form.querySelectorAll('input[type="password"]');
  if (pw[0].value !== pw[1].value) { toast('Passwords do not match',true); return; }
  if (!validateForm(form)) return;
  const btn = form.querySelector('.btn-dark');
  btn.textContent='Creating...'; btn.disabled=true;
  const inputs = form.querySelectorAll('input');
  try {
    const res  = await fetch('/api/auth/signup',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:inputs[0].value,email:form.querySelector('input[type="email"]').value,password:pw[0].value,phone:inputs[inputs.length-2]?.value||''})});
    const data = await res.json();
    if (data.success) { toast('Account created! Welcome.'); setTimeout(()=>location.href=data.redirect,900); }
    else { toast(data.message,true); btn.textContent='Create Account'; btn.disabled=false; }
  } catch(e) { toast('Connection error.',true); btn.textContent='Create Account'; btn.disabled=false; }
};

// ── INIT ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNav(); initFade(); initNewsletter();
  initHome(); initShop(); initProduct();
  initCart(); initCheckout(); initProfile();
  initAuth();
});
