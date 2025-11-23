/* =====================================================
   CURRENCY: AUTO-DETECT + LIVE CONVERSION + DROPDOWN
   (FINAL FULLY WORKING VERSION)
===================================================== */


/* ------------------------------
   LIVE EXCHANGE RATES (GBP BASE)
------------------------------ */
let exchangeRates = { rates: {} };

async function loadRates() {
  try {
    const res = await fetch("https://api.exchangerate.host/latest?base=GBP");
    exchangeRates = await res.json();
  } catch (err) {
    exchangeRates = { rates: {} };
  }
}

/* -----------------------------------
   AUTO-DETECT USER CURRENCY BY IP
----------------------------------- */
async function detectUserCurrency() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    return data.currency || "GBP";
  } catch (err) {
    return "GBP";
  }
}

/* -----------------------------------
   PRICE CONVERSION (GBP → X)
----------------------------------- */
function convertPrice(amountGBP, currency) {
  if (!exchangeRates.rates[currency]) return amountGBP;
  return amountGBP * exchangeRates.rates[currency];
}

/* -----------------------------------
   PRICE FORMATTER
----------------------------------- */
function formatPrice(amountGBP) {
  const converted = convertPrice(amountGBP, userCurrency);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: userCurrency,
    minimumFractionDigits: 2
  }).format(converted);
}

/* -----------------------------------
   LOAD USER CURRENCY OVERRIDE
----------------------------------- */
let savedCurrency = localStorage.getItem("tamedblox_currency");
let userCurrency = "GBP"; // will be replaced later

/* -----------------------------------
   WAIT FOR NAVBAR BEFORE INIT
----------------------------------- */
function waitForNavbar(callback) {
  if (document.getElementById("currencySelector")) return callback();
  setTimeout(() => waitForNavbar(callback), 50);
}

/* -----------------------------------
   DROPDOWN INITIALIZER
----------------------------------- */
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
   PRODUCT LIST
===================================================== */
const products = [
  {
    name: "La Grande Combinasion ($10M/s)",
    rarity: "Secret",
    price: 10.30, // stored as GBP
    oldPrice: 13.38,
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

function getDiscountClass(percent) {
  if (percent > 90) return "discount-red";
  if (percent > 50) return "discount-orange";
  if (percent > 20) return "discount-yellow";
  return "discount-green";
}

/* =====================================================
   RENDER PRODUCTS (NOW USES FORMATPRICE)
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
    const filtered = products.filter(p => p.name.toLowerCase().includes(q));
    renderProducts(filtered);
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
  if (!cards.length) return;

  cards.forEach(card => {
    card.addEventListener("mousemove", e => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;

      const rotateX = ((y - r.height/2) / (r.height/2)) * -10;
      const rotateY = ((x - r.width/2) / (r.width/2)) * 10;

      card.style.transform =
        `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(800px) rotateX(0) rotateY(0)";
    });
  });
}

/* =====================================================
   MAIN INITIALIZER (FINAL FIXED)
===================================================== */
document.addEventListener("DOMContentLoaded", async () => {
  await loadRates(); // load FX first

  if (!savedCurrency || savedCurrency === "AUTO") {
    userCurrency = await detectUserCurrency(); // auto detect
  } else {
    userCurrency = savedCurrency; // dropdown override
  }

  waitForNavbar(initCurrencyDropdown); // dropdown always works

  renderProducts(products); // now prices are correct
  setupSearch();

  if (window.Cart && window.Cart.init)
    window.Cart.init();
});
