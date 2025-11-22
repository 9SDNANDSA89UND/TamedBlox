/* ============================
   CART DRAWER HANDLING
============================ */

// OPEN + CLOSE BUTTONS
let cartBtn;
let closeDrawerBtn;
let cartDrawer = document.getElementById("cartDrawer");
let cartOverlay = document.getElementById("cartOverlay");

/* Observe navbar load (because it's loaded dynamically) */
const navObserver = new MutationObserver(() => {
  let btn = document.getElementById("cartBtn");
  if (btn) {
    cartBtn = btn;
    cartBtn.addEventListener("click", openDrawer);
    console.log("Cart button detected — drawer listeners attached");
    navObserver.disconnect();
  }
});

navObserver.observe(document.body, { childList: true, subtree: true });

/* Close button may also load dynamically */
const drawerObserver = new MutationObserver(() => {
  let btn = document.getElementById("closeDrawer");
  if (btn) {
    closeDrawerBtn = btn;
    closeDrawerBtn.addEventListener("click", closeDrawer);
    drawerObserver.disconnect();
  }
});

drawerObserver.observe(document.body, { childList: true, subtree: true });

function openDrawer() {
  cartDrawer.classList.add("open");
  cartOverlay.style.display = "block";
}

cartOverlay.addEventListener("click", closeDrawer);

function closeDrawer() {
  cartDrawer.classList.remove("open");
  cartOverlay.style.display = "none";
}

/* ============================
   RENDER CART CONTENT
============================ */

function updateCartDrawer() {
  const drawer = document.getElementById("drawerContent");

  if (!drawer) return;
  if (cart.length === 0) {
    drawer.innerHTML = `
      <p style="color:#9ca4b1; margin-top:10px;">Your cart is empty.</p>
    `;
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
          
          <!-- Minus -->
          <button class="qty-btn" onclick="changeQty('${item.name}', -1)">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>

          <div class="qty-display">${item.qty}</div>

          <!-- Plus -->
          <button class="qty-btn" onclick="changeQty('${item.name}', 1)">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>

          <!-- Remove -->
          <button class="qty-btn qty-remove" onclick="removeItem('${item.name}')">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

        </div>
      </div>
    `;
  });

  html += `
    <div class="cart-total-line">Total: £${total.toFixed(2)}</div>
    <button class="checkout-btn" onclick="goToCheckout()">
      Proceed to Checkout
    </button>
  `;

  drawer.innerHTML = html;
}

/* Initialize drawer on page load */
updateCartDrawer();
