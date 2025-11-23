const products = [
  {
    name: "La Grande Combinasion ($10M/s)",
    rarity: "Secret",
    price: 10.30,
    oldPrice: 13.38,
    image: "https://i.postimg.cc/tCT9T6xC/Carti.webp"
  }
];

function getDiscountPercent(price, oldPrice) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

function renderProducts(list) {
  const grid = document.getElementById("productGrid");
  grid.innerHTML = "";

  list.forEach(p => {
    const percent = getDiscountPercent(p.price, p.oldPrice);

    const iconTag = `
      <svg xmlns="http://www.w3.org/2000/svg" 
        width="16" height="16" viewBox="0 0 24 24" 
        fill="none" stroke="currentColor" stroke-width="2" 
        stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 10V5a2 2 0 0 0-2-2h-5L2 11l9 9 9-9z"></path>
        <path d="M7 7h.01"></path>
      </svg>
    `;

    grid.innerHTML += `
      <div class="card">

        <div class="card-badges">
          <span class="tag tag-${p.rarity.toLowerCase()}">
            ${iconTag} ${p.rarity}
          </span>

          <span class="discount-tag">
            ${iconTag} ${percent}% Discount
          </span>
        </div>

        <img src="${p.image}" class="product-img">

        <h3>${p.name}</h3>

        <div class="price-box">
          <span class="price">£${p.price}</span>
          <span class="old-price">£${p.oldPrice}</span>
        </div>

        <button class="buy-btn">
          <svg xmlns="http://www.w3.org/2000/svg" 
            width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2"
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

document.addEventListener("DOMContentLoaded", () => {
  renderProducts(products);
});
