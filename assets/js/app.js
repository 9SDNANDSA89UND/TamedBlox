/* =====================================================
   CURRENCY: AUTO-DETECT + LIVE CONVERSION + DROPDOWN
===================================================== */

// Live FX rates (base = GBP)
let exchangeRates = { rates: {} };

// Detect user's real currency by IP
async function detectUserCurrency() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    return data.currency || "GBP";
  } catch (err) {
    return "GBP";
  }
}

// Load live exchange rates
async function loadRates() {
  try {
    const res = await fetch("https://api.exchangerate.host/latest?base=GBP");
    exchangeRates = await res.json();
  } catch (err) {
    exchangeRates = { rates: {} };
  }
}

// Convert GBP → user currency
function convertPrice(amountGBP, targetCurrency) {
  if (!exchangeRates.rates[targetCurrency]) return amountGBP;
  return amountGBP * exchangeRates.rates[targetCurrency];
}

// Load saved override
let savedCurrency = localStorage.getItem("tamedblox_currency");
let userCurrency = "GBP"; // will be overwritten below

// Format the price after conversion
function formatPrice(amountGBP) {
  const converted = convertPrice(amountGBP, userCurrency);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: userCurrency,
    minimumFractionDigits: 2
  }).format(converted);
}

/* =====================================================
   CURRENCY DROPDOWN (Manual Override)
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const dropdown = document.getElementById("currencySelector");

  if (dropdown) {
    dropdown.value = savedCurrency || "AUTO";

    dropdown.addEventListener("change", () => {
      const selection = dropdown.value;

      if (selection === "AUTO") {
        localStorage.removeItem("tamedblox_currency");
      } else {
        localStorage.setItem("tamedblox_currency", selection);
      }

      location.reload();
    });
  }
});


/* =====================================================
   PRODUCT LIST (GBP BASE PRICES)
===================================================== */
const products = [
  {
    name: "La Grande Combinasion ($10M/s)",
    rarity: "Secret",
    price: 10.30,     // stored in GBP
    oldPrice: 13.38,  // stored in GBP
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
   RENDER PRODUCTS
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
          <span class="tag ${rarityClass}">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.5 3 8 9l4 13 4-13-2.5-6"/>
              <path d="M17 3a2 2 0 0 1 1.6.8l3 4a2 2 0 0 1 .013 2.382l-7.99 10.986a2 2 0 0 1-3.247 0l-7.99-10.986A2 2 0 0 1 2.4 7.8l2.998-3.997A2 2 0 0 1 7 3z"/>
              <path d="M2 9h20"/>
            </svg>
            ${p.rarity}
          </span>

          ${p.oldPrice ? `
          <span class="discount-tag ${getDiscountClass(percent)}">
            ${percent}% OFF
          </span>` : ""}
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
   ADD TO CART WRAPPER
===================================================== */
function addToCart(name, btn) {
  const product = products.find(p => p.name === name);
  if (!product) return;

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
   INIT EVERYTHING (NOW ASYNC)
===================================================== */
document.addEventListener("DOMContentLoaded", async () => {

  await loadRates(); // load conversion table

  // If not manually overridden:
  if (!savedCurrency || savedCurrency === "AUTO") {
    userCurrency = await detectUserCurrency();
  } else {
    userCurrency = savedCurrency;
  }

  renderProducts(products);
  setupSearch();

  if (window.Cart && window.Cart.init)
    window.Cart.init();
});
