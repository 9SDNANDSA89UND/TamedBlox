/* =========================================
   PRODUCT DATA
========================================= */

const products = [
  {
    name: "Mystic Blade",
    rarity: "God",
    price: 12.99,
    oldPrice: 19.99,
    image: "https://static.wikia.nocookie.net/stealabr/images/5/58/Strawberryelephant.png/revision/latest?cb=20250830235735"
  },
  {
    name: "Shadow Cloak",
    rarity: "Secret",
    price: 8.49,
    oldPrice: 12.0,
    image: "https://static.wikia.nocookie.net/stealabr/images/5/58/Strawberryelephant.png/revision/latest?cb=20250830235735"
  },
  {
    name: "OG Emblem",
    rarity: "OG",
    price: 4.2,
    oldPrice: null,
    image: "https://static.wikia.nocookie.net/stealabr/images/5/58/Strawberryelephant.png/revision/latest?cb=20250830235735"
  }
];

/* =========================================
   DISCOUNT SYSTEM
========================================= */

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

/* =========================================
   PRODUCT RENDERING
========================================= */

function renderProducts(list) {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  grid.innerHTML = "";

  list.forEach(p => {
    const discountPercent = getDiscountPercent(p.price, p.oldPrice);
    const rarityClass = `tag-${p.rarity.toLowerCase()}`;

    const discountHTML = discountPercent
      ? `<span class="discount-tag ${getDiscountClass(discountPercent)}">-${discountPercent}%</span>`
      : "";

    grid.innerHTML += `
      <div class="card">
        <div class="card-badges">
          <span class="tag ${rarityClass}">${p.rarity}</span>
          ${discountHTML}
        </div>

        <img src="${p.image}" alt="${p.name}" class="product-img">
        <h3>${p.name}</h3>

        <div class="price-box">
          <span class="price">£${p.price}</span>
          ${p.oldPrice ? `<span class="old-price">£${p.oldPrice}</span>` : ""}
        </div>

        <!-- ⭐ Add to Cart button with Lucide icon -->
        <button class="buy-btn" onclick="addToCart('${p.name}', this)">
          <svg xmlns="http://www.w3.org/2000/svg" 
            class="btn-cart-icon" width="16" height="16" 
            viewBox="0 0 24 24" fill="none" 
            stroke="currentColor" stroke-width="2" 
            stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          Add to Cart
        </button>

      </div>
    `;
  });
}

/* =========================================
   SEARCH BAR
========================================= */

function setupSearch() {
  const input = document.getElementById("searchInput");
  if (!input) return;

  input.addEventListener("input", () => {
    const value = input.value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(value));
    renderProducts(filtered);
  });
}

/* =========================================
   CART SYSTEM (fly animation)
========================================= */

function addToCart(name, btn) {
  const product = products.find(p => p.name === name);
  if (!product) return;

  const card = btn.closest(".card");
  const img = card.querySelector(".product-img");

  window.Cart.addItem(product, img);
}

/* =========================================
   INITIALIZER
========================================= */

function initApp() {
  renderProducts(products);
  setupSearch();

  if (window.Cart && window.Cart.init) {
    window.Cart.init();
  }
}

document.addEventListener("DOMContentLoaded", initApp);
