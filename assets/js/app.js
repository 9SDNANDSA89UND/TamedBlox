/* =====================================================
   CURRENCY SYSTEM — FIXED + BACKEND PRODUCT SUPPORT
===================================================== */

/* ------------------------------
   FALLBACK EXCHANGE RATES (GBP→X)
   Used if API fails
------------------------------ */
const fallbackRates = {
  USD: 1.27,
  EUR: 1.17,
  CAD: 1.74,
  AUD: 1.96,
  JPY: 187.3,
  AED: 4.67,
  HKD: 9.94,
  SGD: 1.71,
  NOK: 13.58,
  SEK: 13.62,
  DKK: 8.72,
  PLN: 5.06
};

/* ------------------------------
   LIVE EXCHANGE RATES
------------------------------ */
let exchangeRates = { rates: {} };

async function loadRates() {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/GBP");
    const data = await res.json();

    if (data && data.result === "success" && data.rates) {
      exchangeRates.rates = data.rates;
      return;
    }
  } catch (err) {}

  // API failed → fallback
  exchangeRates.rates = fallbackRates;
}

/* ------------------------------
   AUTO-DETECT USER CURRENCY
------------------------------ */
async function detectUserCurrency() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    if (data.currency) return data.currency;
  } catch (err) {}

  return "GBP";
}

/* ------------------------------
   CONVERT PRICE (GBP → userCurrency)
------------------------------ */
function convertPrice(amountGBP, currency) {
  const rate = exchangeRates.rates[currency];
  if (!rate) return amountGBP;
  return amountGBP * rate;
}

/* ------------------------------
   FORMAT PRICE
------------------------------ */
function formatPrice(amountGBP) {
  const converted = convertPrice(amountGBP, userCurrency);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: userCurrency,
    minimumFractionDigits: 2
  }).format(converted);
}

/* ------------------------------
   CURRENCY DROPDOWN SETUP
------------------------------ */

let savedCurrency = localStorage.getItem("tamedblox_currency");
let userCurrency = "GBP";

function waitForNavbar(cb) {
  if (document.getElementById("currencySelector")) return cb();
  setTimeout(() => waitForNavbar(cb), 20);
}

function initCurrencyDropdown() {
  const dropdown = document.getElementById("currencySelector");
  if (!dropdown) return;

  dropdown.value = savedCurrency || "AUTO";

  dropdown.addEventListener("change", () => {
    const val = dropdown.value;

    if (val === "AUTO") {
      localStorage.removeItem("tamedblox_currency");
    } else {
      localStorage.setItem("tamedblox_currency", val);
    }

    location.reload();
  });
}

/* =====================================================
   LOAD PRODUCTS FROM BACKEND
===================================================== */

let products = [];

async function loadProducts() {
  try {
    const res = await fetch("https://website-5eml.onrender.com/products");
    products = await res.json();

    normalizeProducts();
    renderProducts(products);

  } catch (err) {
    console.error("❌ Failed to load products from backend:", err);
  }
}

/* Ensure numeric fields */
function normalizeProducts() {
  products.forEach(p => {
    p.price = Number(p.price);
    if (p.oldPrice) p.oldPrice = Number(p.oldPrice);
  });
}

/* =====================================================
   DISCOUNTS
===================================================== */
function getDiscountPercent(price, oldPrice) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

/* =====================================================
   RENDER PRODUCT CARDS
===================================================== */
function renderProducts(list) {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  grid.innerHTML = "";

  list.forEach(p => {
    const percent = getDiscountPercent(p.price, p.oldPrice);
    const rarityClass = `tag-${p.rarity?.toLowerCase() || "secret"}`;

    grid.innerHTML += `
      <div class="card">

        <div class="card-badges">
          <span class="tag ${rarityClass}">${p.rarity || "Secret"}</span>
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
   CART ADDING
===================================================== */
function addToCart(name, btn) {
  const product = products.find(p => p.name === name);
  const img = btn.closest(".card").querySelector(".product-img");
  window.Cart.addItem(product, img);
}

/* =====================================================
   3D TILT EFFECT
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

  // 1. Load FX rates
  await loadRates();

  // 2. Detect or load currency
  if (!savedCurrency || savedCurrency === "AUTO") {
    userCurrency = await detectUserCurrency();
  } else {
    userCurrency = savedCurrency;
  }

  // 3. Wait for navbar then init dropdown
  waitForNavbar(initCurrencyDropdown);

  // 4. Load backend products
  await loadProducts();

  // 5. Search
  setupSearch();

  // 6. Init cart last
  if (window.Cart && window.Cart.init) {
    window.Cart.init();
  }
});
