/* VELNOVA — Layout partials */
const NAV_HTML = `
<nav class="nav">
  <div class="container nav-inner">
    <a href="index.html" class="nav-logo">VEL<span>NOVA</span></a>
    <div class="nav-links">
      <a href="index.html">Home</a>
      <a href="shop.html">Shop</a>
      <a href="about.html">About</a>
      <a href="contact.html">Contact</a>
    </div>
    <div class="nav-right">
      <a href="cart.html" class="nav-btn" title="Cart">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
        <span class="cart-badge">0</span>
      </a>
      <a href="login.html" class="nav-btn" id="nav-acc-btn" title="Account">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </a>
      <button class="hamburger" aria-label="Menu"><span></span><span></span><span></span></button>
    </div>
  </div>
</nav>
<div class="mob-nav">
  <span class="mob-close">✕</span>
  <a href="index.html">Home</a>
  <a href="shop.html">Shop</a>
  <a href="about.html">About</a>
  <a href="contact.html">Contact</a>
  <a href="cart.html">Cart</a>
  <a href="login.html">Account</a>
</div>`;

const FOOTER_HTML = `
<footer class="footer">
  <div class="container">
    <div class="footer-top">
      <div class="footer-brand">
        <span class="nav-logo">VEL<span style="font-style:italic;font-weight:400">NOVA</span></span>
        <p>Premium clothing crafted for the modern Nigerian. Quality pieces designed to last, built for those who value style without compromise.</p>
        <div class="footer-socials">
          <a href="#" class="soc-btn" title="Instagram">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          </a>
          <a href="#" class="soc-btn" title="Twitter">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
          </a>
          <a href="#" class="soc-btn" title="WhatsApp">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
          </a>
        </div>
      </div>
      <div class="footer-col">
        <h4>Shop</h4>
        <ul>
          <li><a href="shop.html">All Products</a></li>
          <li><a href="shop.html?cat=men">Men</a></li>
          <li><a href="shop.html?cat=women">Women</a></li>
          <li><a href="shop.html?cat=new">New Arrivals</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Help</h4>
        <ul>
          <li><a href="contact.html">Contact Us</a></li>
          <li><a href="about.html">About VELNOVA</a></li>
          <li><a href="contact.html">Returns</a></li>
          <li><a href="contact.html">Size Guide</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2025 VELNOVA. All rights reserved.</span>
      <span>velnovaclothing@gmail.com</span>
    </div>
  </div>
</footer>`;

document.getElementById('nav-ph')?.insertAdjacentHTML('afterbegin', NAV_HTML);
document.getElementById('footer-ph')?.insertAdjacentHTML('afterbegin', FOOTER_HTML);
