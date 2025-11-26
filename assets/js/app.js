/* ============================================================
   TamedBlox — Product Loader + Add to Cart Handler
   FIXED FOR CART.JS LOADING ORDER + NAVBAR DELAYS
============================================================ */

/* ============================================================
   SAFE WAIT FUNCTION (waits for any value to exist)
============================================================ */
function waitFor(checkFn, callback, retry = 0) {
  if (checkFn()) return callback();
  if (retry > 50) return console.warn("Timeout waiting for:", checkFn);

  setTimeout(() => waitFor(checkFn, callback, retry + 1), 50);
}

/* ============================================================
   PRODUCT RENDERER
============================================================ */
async function loadProducts() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  grid.innerHTML = `<p style="color:#9ca4b1;">Loading products...</p>`;

  const res = await fetch("https://website-5eml.onrender.com/products");
  const products = await res.json();

  grid.innerHTML = products
    .map(
      (p) => `
      <div class="card">
        <img src="${p.image}" class="card-img">

        <h3>${p.name}</h3>
        <div class="price-box">
          <span class="price">$${p.price} USD</span>
        </div>

        <button class="buy-btn" data-product='${JSON.stringify(p)}'>
          <img class="btn-cart-icon"
               src="https://cdn-icons-png.flaticon.com/512/833/833314.png">
          Add to Cart
        </button>
      </div>
    `
    )
    .join("");
}

/* ============================================================
   ATTACH ADD-TO-CART LISTENERS (AFTER EVERYTHING EXISTS)
============================================================ */
function enableAddToCart() {
  const buttons = document.querySelectorAll(".buy-btn");

  if (!buttons.length) {
    console.warn("No add-to-cart buttons found yet. Retrying...");
    return setTimeout(enableAddToCart, 50);
  }

  if (!window.Cart) {
    console.warn("Cart.js not loaded yet. Retrying...");
    return setTimeout(enableAddToCart, 50);
  }

  buttons.forEach((btn) => {
    btn.onclick = () => {
      const product = JSON.parse(btn.getAttribute("data-product"));
      window.Cart.addItem(product, btn.closest(".card").querySelector(".card-img"));
    };
  });

  console.log("✅ Add-to-cart enabled.");
}

/* ============================================================
   MAIN INIT — RUNS WHEN PAGE IS READY
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  // Wait for productGrid to exist
  waitFor(() => document.getElementById("productGrid"), () => {
    loadProducts();

    // Then wait for Cart to exist
    waitFor(() => window.Cart, () => {
      // Then attach listeners
      enableAddToCart();
    });
  });
});
