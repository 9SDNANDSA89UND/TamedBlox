/* ==========================================
   CART DRAWER — FINAL WORKING VERSION
========================================== */

// Global references
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");

// Wait for navbar to load dynamically before adding listeners
document.addEventListener("DOMContentLoaded", () => {
  const observer = new MutationObserver(() => {
    const cartBtn = document.getElementById("cartBtn");
    const closeDrawer = document.getElementById("closeDrawer");

    if (cartBtn && closeDrawer) {
      console.log("Cart button detected — listeners attached ✔");

      cartBtn.onclick = () => openCart();
      closeDrawer.onclick = () => closeCart();
      cartOverlay.onclick = () => closeCart();

      observer.disconnect();
    }
  });

  // Watch DOM for injected navbar
  observer.observe(document.body, { childList: true, subtree: true });
});

/* ==========================================
   OPEN / CLOSE DRAWER
========================================== */

function openCart() {
  cartDrawer.classList.add("open");
  cartOverlay.style.display = "block";
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartOverlay.style.display = "none";
}

/* ==========================================
   UPDATE CART UI
========================================== */

function updateCartDrawer() {
  const drawer = document.getElementById("drawerContent");
  if (!drawer) return;

  if (cart.length === 0) {
    drawer.innerHTML = `<p style="color:#9ca4b1; margin-top:20px;">Your cart is empty.</p>`;
    return;
  }

  let html = "";
  let total = 0;

  cart.forEach(item => {
    total += item.price * item.qty;

    html += `
      <div class="cart-item">

        <div class="cart-item-title">${item.name}</div>
        <div class="cart-item-price">£${item.price}</div>

        <div class="cart-qty-row">
          <button class="qty-btn" onclick="changeQty('${item.name}', -1)">−</button>
          <div class="qty-display">${item.qty}</div>
          <button class="qty-btn" onclick="changeQty('${item.name}', 1)">+</button>
          <button class="qty-btn qty-remove" onclick="removeItem('${item.name}')">×</button>
        </div>

      </div>
    `;
  });

  html += `
    <div class="cart-total-line">Total: £${total.toFixed(2)}</div>
    <button class="checkout-btn" onclick="goToCheckout()">Proceed to Checkout</button>
  `;

  drawer.innerHTML = html;
}

/* ==========================================
   CHANGE QTY / REMOVE ITEM
========================================== */

function changeQty(name, amount) {
  const item = cart.find(i => i.name === name);
  if (!item) return;

  item.qty += amount;

  if (item.qty <= 0) {
    cart = cart.filter(i => i.name !== name);
  }

  saveCart();
}

function removeItem(name) {
  cart = cart.filter(i => i.name !== name);
  saveCart();
}

/* ==========================================
   SAVE CART STATE
========================================== */

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartDrawer();
  updateCartDot();
}

/* ==========================================
   CART DOT
========================================== */

function updateCartDot() {
  const dot = document.getElementById("cartDot");
  if (!dot) return;

  dot.style.display = cart.length > 0 ? "block" : "none";
}

/* ==========================================
   CHECKOUT REDIRECT
========================================== */

function goToCheckout() {
  window.location.href = "checkout.html";
}
