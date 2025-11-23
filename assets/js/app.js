/* =====================================================
   CURRENCY SYSTEM — FINAL FULLY FIXED VERSION
   - Live FX using open.er-api.com (CORS SAFE)
   - Auto detect via IP
   - Dropdown override
   - Conversion BEFORE render
===================================================== */

/* ------------------------------
   GLOBAL FX TABLE (BASE GBP)
------------------------------ */
let exchangeRates = { rates: {} };

/* ------------------------------
   LOAD LIVE GBP → X RATES
------------------------------ */
async function loadRates() {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/GBP");
    const data = await res.json();

    if (data && data.result === "success") {
      exchangeRates.rates = data.rates;
    } else {
      exchangeRates = { rates: {} };
    }
  } catch (err) {
    exchangeRates = { rates: {} };
  }
}

/* ------------------------------
   AUTO-DETECT USER CURRENCY
------------------------------ */
async function detectUserCurrency() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    return data.currency || "GBP";
  } catch (err) {
    return "GBP";
  }
}

/* ------------------------------
   CONVERT PRICE (GBP → X)
------------------------------ */
function convertPrice(amountGBP, currency) {
  if (!exchangeRates.rates[currency]) return amountGBP;
  return amountGBP * exchangeRates.rates[currency];
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
   LOAD USER DROPDOWN OVERRIDE
------------------------------ */
let savedCurrency = localStorage.getItem("tamedblox_currency");
let userCurrency = "GBP";

/* ------------------------------
   WAIT FOR NAVBAR
------------------------------ */
function waitForNavbar(callback) {
  if (document.getElementById("currencySelector")) return callback();
  setTimeout(() => waitForNavbar(callback), 30);
}

/* ------------------------------
   INITIALIZE DROPDOWN
------------------------------ */
function initCurrencyDropdown() {
  const dropdown = document.getElementById("currencySelector");
  if (!dropdown) return;

  dropdown.value = savedCurrency || "AUTO";

  dropdown.addEventListener("change", () => {
    const val = dropdown.value;

    if (val === "AUTO") localStorage.removeItem("tamedblox_currency");
    else localStorage.setItem("tamedblox_currency", val);

    location.reload();
  });
}

/* =====================================================
   PRODUCT LIST (GBP BASE VALUES)
===================================================== */
const products = [
  {
    name: "La Grande Combinasion ($10M/s)",
    rarity: "Secret",
    price: 10.30,   // BASE GBP
    oldPrice: 13.38, // BASE GBP
    image: "https://i.postimg.cc/tCT9T6xC/Carti.webp"
  }
];

/* =====================================================
   DISCOUNT HELPERS
===================================================== */
function getDiscountPercent(price, oldPrice) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

/* =====================================================
   RENDER PRODUCTS — NOW USING formatPrice()
===================================================== */
function renderProducts(list) {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  grid.innerHTML = "";

  list.forEach(p => {
    const percent = getDiscountPercent(p.price, p.oldPrice);
    const rarityClass = `tag-${p.rarity.toLowerCase()}`;

    grid.innerHTML += `
      <div class="card">
        
        <div class="card-badges">
          <span class="tag ${rarityClass}">${p.rarity}</span>
          ${
            p.oldPrice
              ? `<span class="discount-tag">${percent}% OFF</span>`
              : ""
          }
        </div>

        <img src="${p.image}" class="product-img">

        <h3>${p.name}</h3>

        <div class="price-box">
          <span class="price">${formatPrice(p.price)}</span>
          ${
            p.oldPrice
              ? `<span class="old-price">${formatPrice(p.oldPrice)}</span>`
              : ""
          }
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
   SEARCH
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
   ADD TO CART
===================================================== */
function addToCart(name, btn) {
  const product = products.find(p => p.name === name);
  const card = btn.closest(".card");
  const img = card.querySelector(".product-img");

  window.Cart.addItem(product, img);
}

/* =====================================================
   3D TILT
===================================================== */
function initCardTilt() {
  const cards = document.querySelectorAll(".card");

  cards.forEach(card => {
    card.addEventListener("mousemove", e => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;

      const rotateX = ((y - r.height / 2) / (r.height / 2)) * -10;
      const rotateY = ((x - r.width / 2) / (r.width / 2)) * 10;

      card.style.transform = `perspective(800px)
                              rotateX(${rotateX}deg)
                              rotateY(${rotateY}deg)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(800px) rotateX(0) rotateY(0)";
    });
  });
}

/* =====================================================
   MAIN INITIALIZER — ORDER FIXED
===================================================== */
document.addEventListener("DOMContentLoaded", async () => {

  // 1. LOAD LIVE RATES FIRST
  await loadRates();

  // 2. AUTO-DETECT OR OVERRIDE
  if (!savedCurrency || savedCurrency === "AUTO") {
    userCurrency = await detectUserCurrency();
  } else {
    userCurrency = savedCurrency;
  }

  // 3. WAIT FOR NAVBAR → INITIALIZE DROPDOWN
  waitForNavbar(initCurrencyDropdown);

  // 4. NOW RENDER EVERYTHING WITH CORRECT CURRENCY
  renderProducts(products);
  setupSearch();

  // 5. INIT CART LAST
  if (window.Cart && window.Cart.init) window.Cart.init();
});
