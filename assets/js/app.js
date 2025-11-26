/* ============================================================
   TamedBlox — PRODUCT SYSTEM (PATCHED & SAFE)
   Works with new patched Cart.js + async navbar
============================================================ */

/* Format product numbers as USD strings */
function formatUSD(amount) {
  return `$${Number(amount).toFixed(2)} USD`;
}

let products = [];

/* ============================================================
   WAIT FOR CONDITION
============================================================ */
function waitFor(checkFn, callback, retry = 0) {
  if (checkFn()) return callback();
  if (retry > 50) {
    console.warn("⚠️ Timeout waiting for condition:", checkFn);
    return;
  }
  setTimeout(() => waitFor(checkFn, callback, retry + 1), 40);
}

/* ============================================================
   LOAD PRODUCTS
============================================================ */
async function loadProducts() {
  try {
    const res = await fetch("https://website-5eml.onrender.com/products");
    products = await res.json();

    products.forEach((p) => {
      p.price = Number(p.price);
      p.oldPrice = p.oldPrice ? Number(p.oldPrice) : null;
    });

    renderProducts(products);
  } catch (err) {
    console.error("❌ Failed to load products:", err);
  }
}

/* ============================================================
   DISCOUNT CALCULATOR
============================================================ */
function getDiscountPercent(price, oldPrice) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

/* ============================================================
   RENDER PRODUCTS
============================================================ */
function renderProducts(list) {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  grid.innerHTML = "";

  list.forEach((p) => {
    const discount = getDiscountPercent(p.price, p.oldPrice);

    grid.innerHTML += `
      <div class="card">

        <div class="card-badges">
          <span class="tag tag-${(p.rarity || "Secret").toLowerCase()}">
            ${p.rarity || "Secret"}
          </span>
          ${discount ? `<span class="discount-tag">${discount}% OFF</span>` : ""}
        </div>

        <img src="${p.image}" class="product-img" />

        <h3>${p.name}</h3>

        <div class="price-box">
          <span class="price">${formatUSD(p.price)}</span>
          ${p.oldPrice ? `<span class="old-price">${formatUSD(p.oldPrice)}</span>` : ""}
        </div>

        <!-- Buttons use data attributes instead of raw JS in HTML -->
        <button class="buy-btn" data-name="${p.name}">
          Add to Cart
        </button>

      </div>
    `;
  });

  initCardTilt();
  bindCartButtons();
}

/* ============================================================
   BIND ADD-TO-CART BUTTONS (SAFE)
============================================================ */
function bindCartButtons() {
  const buttons = document.querySelectorAll(".buy-btn");

  if (!buttons.length) {
    return setTimeout(bindCartButtons, 40);
  }

  waitFor(
    () => window.Cart && typeof window.Cart.addItem === "function",
    () => {
      buttons.forEach((btn) => {
        btn.onclick = () => {
          const name = btn.getAttribute("data-name");
          const imgElement = btn.closest(".card").querySelector(".product-img");
          addToCart(name, imgElement);
        };
      });

      console.log("🛒 Add-to-cart buttons are active.");
    }
  );
}

/* ============================================================
   ADD TO CART (PATCHED)
============================================================ */
function addToCart(name, imgElement) {
  const product = products.find((p) => p.name === name);
  if (!product) return console.error("❌ Product not found:", name);

  const fixedProduct = {
    ...product,
    price: Number(product.price),
    oldPrice: product.oldPrice ? Number(product.oldPrice) : null
  };

  window.Cart.addItem(fixedProduct, imgElement);
}

/* ============================================================
   SEARCH BAR
============================================================ */
function setupSearch() {
  const input = document.getElementById("searchInput");
  if (!input) return;

  input.addEventListener("input", () => {
    const q = input.value.toLowerCase();
    const filtered = products.filter((p) =>
      p.name.toLowerCase().includes(q)
    );
    renderProducts(filtered);
  });
}

/* ============================================================
   CARD TILT EFFECT
============================================================ */
function initCardTilt() {
  const cards = document.querySelectorAll(".card");

  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
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

/* ============================================================
   INIT EVERYTHING
============================================================ */
document.addEventListener("DOMContentLoaded", async () => {
  await loadProducts();
  setupSearch();

  waitFor(
    () => window.Cart && typeof window.Cart.init === "function",
    () => {
      window.Cart.init();
      console.log("🛒 Cart initialized.");
    }
  );
});
