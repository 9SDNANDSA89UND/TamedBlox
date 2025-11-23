/* =====================================================
   FRONTEND CURRENCY SYSTEM — v9 (INSPIRED BY EXAMPLE)
===================================================== */

const exchangeRates = {
  GBP: 1,
  USD: 1.27,
  EUR: 1.17,
  CAD: 1.74,
  AUD: 1.96,
  JPY: 187.30,
  AED: 4.67,
  HKD: 9.94,
  SGD: 1.71
};

// Always valid currency:
let userCurrency = localStorage.getItem("tamedblox_currency") || "GBP";

/* ------------------------------
   Conversion & Format
------------------------------ */
function convertPrice(amountGBP) {
  return amountGBP * exchangeRates[userCurrency];
}

function formatPrice(amountGBP) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: userCurrency
  }).format(convertPrice(amountGBP));
}

/* ------------------------------
   Dropdown
------------------------------ */
function initCurrencyDropdown() {
  const dropdown = document.getElementById("currencySelector");
  if (!dropdown) return;

  dropdown.value = userCurrency;

  dropdown.addEventListener("change", () => {
    userCurrency = dropdown.value;
    localStorage.setItem("tamedblox_currency", userCurrency);

    // Just like your example: re-render display
    renderProducts(products);
  });
}

/* ------------------------------
   Load Products (GBP base)
------------------------------ */
let products = [];

async function loadProducts() {
  const res = await fetch("https://website-5eml.onrender.com/products");
  products = await res.json();

  products.forEach(p => {
    p.price = Number(p.price);
    if (p.oldPrice) p.oldPrice = Number(p.oldPrice);
  });

  renderProducts(products);
}

/* ------------------------------
   Render Cards (CONVERT HERE)
------------------------------ */
function renderProducts(items) {
  const grid = document.getElementById("productGrid");
  grid.innerHTML = "";

  items.forEach(p => {
    const discount = p.oldPrice ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;

    grid.innerHTML += `
      <div class="card">
        <div class="card-badges">
          <span class="tag tag-${(p.rarity || "Secret").toLowerCase()}">${p.rarity || "Secret"}</span>
          ${discount ? `<span class="discount-tag">${discount}% OFF</span>` : ""}
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
}

/* ------------------------------
   Initialize
------------------------------ */
document.addEventListener("DOMContentLoaded", async () => {

  // Initialize dropdown FIRST
  const waitNavbar = setInterval(() => {
    if (document.getElementById("currencySelector")) {
      clearInterval(waitNavbar);
      initCurrencyDropdown();
    }
  }, 30);

  await loadProducts();
});
