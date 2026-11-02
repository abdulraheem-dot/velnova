// Shared layout injector
const NAV = `
<nav class="nav">
  <div class="wrap nav-inner">
    <a href="/index.html" class="nav-logo">VELNOVA</a>
    <div class="nav-links">
      <a href="/index.html">Home</a>
      <a href="/shop.html">Shop</a>
      <a href="/about.html">About</a>
      <a href="/contact.html">Contact</a>
    </div>
    <div class="nav-right">
      <a href="/cart.html" class="nav-icon" title="Cart">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
        <span class="cart-badge">0</span>
      </a>
      <a href="/login.html" class="nav-icon" id="nav-acc" title="Account">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </a>
      <button class="hamburger" aria-label="Menu"><span></span><span></span><span></span></button>
    </div>
  </div>
</nav>
<div class="mobile-nav">
  <span class="mobile-close">✕</span>
  <a href="/index.html">Home</a>
  <a href="/shop.html">Shop</a>
  <a href="/about.html">About</a>
  <a href="/contact.html">Contact</a>
  <a href="/cart.html">Cart</a>
  <a href="/login.html">Account</a>
</div>`;

const FOOTER = `
<footer class="footer">
  <div class="wrap">
    <div class="footer-top">
      <div class="footer-brand">
        <span class="nav-logo">VELNOVA</span>
        <p>Premium clothing for men and women. Quality you can feel, style that endures.</p>
        <div class="footer-socials">
          <a href="https://instagram.com/velnovaclothing" target="_blank" class="soc-btn" title="Instagram">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          </a>
          <a href="mailto:velnovaclothing@gmail.com" class="soc-btn" title="Email">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </a>
          <a href="https://wa.me" target="_blank" class="soc-btn" title="WhatsApp">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
          </a>
        </div>
      </div>
      <div class="footer-col">
        <h4>Shop</h4>
        <ul>
          <li><a href="/shop.html">All Products</a></li>
          <li><a href="/shop.html?cat=men">Men</a></li>
          <li><a href="/shop.html?cat=women">Women</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Help</h4>
        <ul>
          <li><a href="/contact.html">Contact Us</a></li>
          <li><a href="/contact.html">Shipping Info</a></li>
          <li><a href="/contact.html">Returns</a></li>
          <li><a href="/contact.html">Size Guide</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Company</h4>
        <ul>
          <li><a href="/about.html">Our Story</a></li>
          <li><a href="/login.html">My Account</a></li>
          <li><a href="mailto:velnovaclothing@gmail.com">velnovaclothing@gmail.com</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-btm">
      <span>© ${new Date().getFullYear()} VELNOVA. All rights reserved.</span>
      <span>Made in Nigeria 🇳🇬</span>
    </div>
  </div>
</footer>`;

document.getElementById('nav-ph')?.insertAdjacentHTML('afterbegin', NAV);
document.getElementById('footer-ph')?.insertAdjacentHTML('afterbegin', FOOTER);
