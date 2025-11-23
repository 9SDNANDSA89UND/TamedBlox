/* =====================================================
   CURRENCY SYSTEM — FINAL FULLY FIXED VERSION
===================================================== */

/* ------------------------------
   LIVE EXCHANGE RATES (BASE = GBP)
------------------------------ */
let exchangeRates = { rates: {} };

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
   AUTO-DETECT USER CURRENCY VIA IP
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
   CONVERT PRICE (GBP → currency)
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
   LOAD DROPDOWN OVERRIDE
------------------------------ */
let savedCurrency = localStorage.getItem("tamedblox_currency");
let userCurrency = "GBP";

/* ------------------------------
   WAIT UNTIL NAVBAR EXISTS
------------------------------ */
function waitForNavbar(callback) {
  if (document.getElementById("currencySelector")) return callback();
  setTimeout(() => waitForNavbar(callback), 30);
}

/* ------------------------------
   INITIALIZE DROPDOWN (ALWAYS WORKS)
------------------------------ */
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
   PRODUCT LIST (BASE GBP PRICES)
===================================================== */

const products = [
  {
    name: "La Grande Combinasion ($10M/s)",
    rarity: "Secret",
    price: 10.30,      // base GBP
    oldPrice: 13.38,   // base GBP
    image: "https://i.postimg.cc/tCT9T6xC/Carti.webp"
  }
];

/* =====================================================
   FIX FOR PRICE CONVERSION BUG
===================================================== */
function normalizeProducts() {
  products.forEach(p => {
    p.price = Number(p.price);
    if (p.oldPrice) p.oldPrice = Number(p.oldPrice);
  });
}

/* =====================================================
   DISCOUNT HELPERS
===================================================== */
function getDiscountPercent(price, oldPrice) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

function getDiscountClass(percent) {
  if (percent > 90) return "discount-red";
  if (percent > 50) return "discount-orange";
  if (percent > 20) return "discount-yellow";
  return "discount-green";
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
    const rarityClass = `tag-${p.rarity.toLowerCase()}`;

    grid.innerHTML += `
      <div class="card">

        <div class="card-badges">
          <span class="tag ${rarityClass}">${p.rarity}</span>
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
  const img = btn.closest(".card").querySelector(".product-img");
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
   MAIN INITIALIZER (ORDER FIXED)
===================================================== */
document.addEventListener("DOMContentLoaded", async () => {

  // 1. Normalise number types BEFORE conversion
  normalizeProducts();

  // 2. Load live FX rates
  await loadRates();

  // 3. Auto-detect local currency OR load saved override
  if (!savedCurrency || savedCurrency === "AUTO") {
    userCurrency = await detectUserCurrency();
  } else {
    userCurrency = savedCurrency;
  }

  // 4. Wait for navbar → then init dropdown
  waitForNavbar(initCurrencyDropdown);

  // 5. Render with correct converted prices
  renderProducts(products);

  setupSearch();

  // 6. Initialize Cart LAST
  if (window.Cart && window.Cart.init) {
    window.Cart.init();
  }
});
