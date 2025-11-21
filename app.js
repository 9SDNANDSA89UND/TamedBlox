const products = [
  {
    name: "Mystic Blade",
    rarity: "God",
    price: 12.99,
    oldPrice: 19.99,
    image: "https://via.placeholder.com/300"
  },
  {
    name: "Shadow Cloak",
    rarity: "Secret",
    price: 8.49,
    oldPrice: 12.0,
    image: "https://via.placeholder.com/300"
  },
  {
    name: "OG Emblem",
    rarity: "OG",
    price: 4.2,
    image: "https://via.placeholder.com/300"
  }
];

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartDrawer();
  updateCartDot();
}

function addToCart(name) {
  const p = products.find(x => x.name === name);
  if (!p) return;

  const existing = cart.find(i => i.name === name);

  if (existing) existing.qty++;
  else cart.push({ name: p.name, price: p.price, qty: 1 });

  saveCart();
  showToast(`${p.name} added to cart`);
}

function updateCartDot() {
  const dot = document.getElementById("cartDot");
  if (!dot) return;
  dot.style.display = cart.length > 0 ? "block" : "none";
}

function changeQty(name, amt) {
  const item = cart.find(i => i.name === name);
  if (!item) return;

  item.qty += amt;
  if (item.qty <= 0) cart = cart.filter(i => i.name !== name);

  saveCart();
}

function removeItem(name) {
  cart = cart.filter(i => i.name !== name);
  saveCart();
}

function openCart() {
  document.getElementById("cartDrawer").classList.add("open");
  document.getElementById("cartOverlay").classList.add("show");
}

function closeCart() {
  document.getElementById("cartDrawer").classList.remove("open");
  document.getElementById("cartOverlay").classList.remove("show");
}

function showToast(msg) {
  const box = document.querySelector(".toast-container");
  const t = document.createElement("div");
  t.className = "toast";
  t.innerText = msg;
  box.appendChild(t);
  setTimeout(() => t.classList.add("show"), 20);
  setTimeout(() => { t.classList.remove("show"); t.remove(); }, 2500);
}

function goToCheckout() {
  window.location.href = "checkout.html";
}

function updateCartDrawer() {
  const box = document.getElementById("drawerContent");

  if (cart.length === 0) {
    box.innerHTML = `<p style="color:#8b92a1;">Your cart is empty.</p>`;
    return;
  }

  let html = "";
  let total = 0;

  cart.forEach(item => {
    total += item.qty * item.price;

    html += `
      <div style="margin-bottom:18px;">
        <div style="font-weight:600">${item.name}</div>
        <div style="color:#4ef58a;font-weight:700">£${item.price}</div>
        <div style="margin-top:10px; display:flex; gap:8px;">
          <button class="qty-btn" onclick="changeQty('${item.name}', -1)">−</button>
          <button class="qty-btn" onclick="changeQty('${item.name}', 1)">+</button>
          <button class="qty-btn remove" onclick="removeItem('${item.name}')">×</button>
        </div>
      </div>
    `;
  });

  html += `
    <hr style="border-color:rgba(255,255,255,0.1);margin:15px 0;">
    <div style="font-size:18px;font-weight:700;color:#4ef58a;margin-bottom:12px;">
      Total: £${total.toFixed(2)}
    </div>
    <button class="checkout-btn" onclick="goToCheckout()">Proceed to Checkout</button>
  `;

  box.innerHTML = html;
}

function renderProducts(list) {
  const grid = document.getElementById("productGrid");
  grid.innerHTML = "";

  list.forEach(p => {
    const rarityClass = `tag-${p.rarity.toLowerCase()}`;

    grid.innerHTML += `
      <div class="card scroll-fade">
        <span class="tag ${rarityClass}">${p.rarity}</span>
        <img src="${p.image}">
        <h3>${p.name}</h3>
        <p>Instant delivery • Trusted seller</p>

        <div class="price-box">
          <span class="price">£${p.price}</span>
          ${p.oldPrice ? `<span class="old-price">£${p.oldPrice}</span>` : ""}
        </div>

        <button class="buy-btn" onclick="addToCart('${p.name}')">Buy</button>
      </div>
    `;
  });

  setTimeout(() => {
    document.querySelectorAll(".scroll-fade").forEach(el => el.classList.add("visible"));
  }, 50);
}

document.getElementById("searchInput")?.addEventListener("input", e => {
  const q = e.target.value.toLowerCase();
  renderProducts(products.filter(p => p.name.toLowerCase().includes(q)));
});

renderProducts(products);
updateCartDrawer();
updateCartDot();

document.getElementById("cartBtn")?.addEventListener("click", openCart);
document.getElementById("closeDrawer")?.addEventListener("click", closeCart);
document.getElementById("cartOverlay")?.addEventListener("click", closeCart);
