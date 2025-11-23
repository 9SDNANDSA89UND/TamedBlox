/* =====================================================
   FRONTEND-ONLY CURRENCY SYSTEM — FINAL VERSION
   Backend always returns GBP — we convert it here.
===================================================== */

/* ------------------------------
   STATIC EXCHANGE RATES (BASE GBP)
------------------------------ */
const exchangeRates = {
  GBP: 1,
  USD: 1.27,
  EUR: 1.17,
  CAD: 1.74,
  AUD: 1.96,
  JPY: 187.30,
  AED: 4.67,
  HKD: 9.94,
  SGD: 1.71,
  NOK: 13.58,
  SEK: 13.62,
  DKK: 8.72,
  PLN: 5.06
};

/* =====================================================
   LOAD SAVED CURRENCY (DEFAULT GBP)
===================================================== */

let userCurrency = localStorage.getItem("tamedblox_currency") || "GBP";

/* =====================================================
   CURRENCY CONVERSION (SIMPLE & RELIABLE)
===================================================== */

function convertPrice(amountGBP) {
  return amountGBP * (exchangeRates[userCurrency] || 1);
}

function formatPrice(amountGBP) {
  const converted = convertPrice(amountGBP);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: userCurrency
  }).format(converted);
}

/* =====================================================
   CURRENCY DROPDOWN (INSTANT RE-RENDER)
===================================================== */

function initCurrencyDropdown() {
  const dropdown = document.getElementById("currencySelector");
  if (!dropdown) return;

  dropdown.value = userCurrency;

  dropdown.addEventListener("change", () => {
    userCurrency = dropdown.value;
    localStorage.setItem("tamedblox_currency", userCurrency);

    // Re-render products instantly
    renderProducts(products);
  });
}

/* =====================================================
   BACKEND PRODUCT LOADING
===================================================== */

let products = [];

async function loadProducts() {
  try {
    const res = await fetch("https://website-5eml.onrender.com/products");
    products = await res.json();

    // Ensure number format
    products.forEach(p => {
      p.price = Number(p.price);
      if (p.oldPrice) p.oldPrice = Number(p.oldPrice);
    });

    renderProducts(products);

  } catch (err) {
    console.error("❌ Failed to load products:", err);
  }
}

/* =====================================================
   PRODUCT RENDERER (CURRENCY APPLIED HERE)
===================================================== */

function getDiscountPercent(price, oldPrice) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

function renderProducts(list) {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  grid.innerHTML = "";

  list.forEach(p => {
    const percent = getDiscountPercent(p.price, p.oldPrice);

    grid.innerHTML += `
      <div class="card">

        <div class="card-badges">
          <span class="tag tag-${(p.rarity || "Secret").toLowerCase()}">${p.rarity || "Secret"}</span>
          ${p.oldPrice ? `<span class="discount-tag">${percent}% OFF</span>` : ""}
        </div>

        <img src="${p.image}" class="product-img">

        <h3>${p.name}</h3>

        <div class="price-box">
          <span class="price">${formatPrice(p.price)}</span>
          ${p.oldPrice ? `<span class="old-price">${formatPrice(p.oldPrice)}</span>` : ""}
        </div>

        <button class="buy-btn" onclick="addToCart('${p.name}', this)">
          Add to Cart
        </button>

      </div>
    `;
  });

  initCardTilt();
}

/* =====================================================
   SEARCH BAR
===================================================== */

function setupSearch() {
  const input = document.getElementById("searchInput");
  if (!input) return;

  input.addEventListener("input", () => {
    const q = input.value.toLowerCase();
    renderProducts(products.filter(p => p.name.toLowerCase().includes(q)));
  });
}

/* =====================================================
   CART INTEGRATION
===================================================== */

function addToCart(name, btn) {
  const product = products.find(p => p.name === name);
  const img = btn.closest(".card").querySelector(".product-img");
  window.Cart.addItem(product, img);
}

/* =====================================================
   3D CARD TILT
===================================================== */

function initCardTilt() {
  const cards = document.querySelectorAll(".card");

  cards.forEach(card => {
    card.addEventListener("mousemove", e => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;

      const rx = ((y - r.height / 2) / (r.height / 2)) * -10;
      const ry = ((x - r.width / 2) / (r.width / 2)) * 10;

      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(800px) rotateX(0) rotateY(0)";
    });
  });
}

/* =====================================================
   MAIN INITIALIZER
===================================================== */

document.addEventListener("DOMContentLoaded", async () => {

  // Wait for navbar to exist
  const wait = setInterval(() => {
    if (document.getElementById("currencySelector")) {
      clearInterval(wait);
      initCurrencyDropdown();
    }
  }, 20);

  await loadProducts();
  setupSearch();

  if (window.Cart && window.Cart.init) {
    window.Cart.init();
  }
});
