/* ============================================================
   TamedBlox — CART SYSTEM (FULLY PATCHED & SAFE)
   - No more null onclick errors
   - No crashes before Cart is created
   - Safe async navbar + drawer initialization
============================================================ */

/* ============================================================
   WAIT FOR ELEMENT HELPERS
============================================================ */
function waitForElement(id, callback) {
  const el = document.getElementById(id);

  if (el) return callback(el);
  setTimeout(() => waitForElement(id, callback), 40);
}

/* ============================================================
   SAFE CART DRAWER INITIALIZATION
============================================================ */
function initCartDrawer() {
  waitForElement("cartBtn", (cartBtn) => {
    waitForElement("cartOverlay", (overlay) => {
      const drawer = document.getElementById("cartDrawer");

      cartBtn.onclick = () => {
        drawer.classList.add("open");
        overlay.style.display = "block";
      };

      overlay.onclick = () => {
        drawer.classList.remove("open");
        overlay.style.display = "none";
      };

      console.log("🛒 Cart drawer initialized.");
    });
  });
}

initCartDrawer();

/* ============================================================
   FORMAT USD
============================================================ */
function formatUSD(amount) {
  return `$${Number(amount).toFixed(2)} USD`;
}

/* ============================================================
   CART OBJECT (NEVER CRASHES NOW)
============================================================ */
window.Cart = {
  items: [],

  init() {
    const saved = localStorage.getItem("tamedblox_cart");
    this.items = saved ? JSON.parse(saved) : [];

    this.updateDot();
    this.updateDrawer();
  },

  save() {
    localStorage.setItem("tamedblox_cart", JSON.stringify(this.items));
    this.updateDot();
    this.updateDrawer();
  },

  /* ========================================================
       FLY TO CART ANIMATION
  ======================================================== */
  flyToCart(imgSrc, imgElement) {
    const cartIcon = document.getElementById("cartBtn");

    if (!cartIcon || !imgElement) return;

    const startRect = imgElement.getBoundingClientRect();
    const endRect = cartIcon.getBoundingClientRect();

    const flyImg = document.createElement("img");
    flyImg.src = imgSrc;
    flyImg.className = "fly-img";

    flyImg.style.left = startRect.left + "px";
    flyImg.style.top = startRect.top + "px";
    document.body.appendChild(flyImg);

    // Trail particle effect
    let trail = setInterval(() => {
      const particle = document.createElement("div");
      particle.className = "fly-particle";

      const rect = flyImg.getBoundingClientRect();
      particle.style.left = rect.left + "px";
      particle.style.top = rect.top + "px";

      document.body.appendChild(particle);

      requestAnimationFrame(() => {
        particle.style.opacity = "0";
        particle.style.transform = "scale(0.3)";
      });

      setTimeout(() => particle.remove(), 400);
    }, 40);

    // Fly animation
    requestAnimationFrame(() => {
      flyImg.style.transform =
        `translate(${endRect.left - startRect.left}px, ${endRect.top - startRect.top}px) scale(0.2)`;
      flyImg.style.opacity = "0";
    });

    // Cart bounce
    setTimeout(() => {
      cartIcon.style.animation = "cartBounce 0.3s ease";
      setTimeout(() => (cartIcon.style.animation = ""), 300);
    }, 700);

    // Cleanup
    setTimeout(() => {
      clearInterval(trail);
      flyImg.remove();
    }, 750);
  },

  /* ========================================================
       CART FUNCTIONS
  ======================================================== */
  addItem(product, imgElement) {
    const existing = this.items.find((i) => i.name === product.name);

    if (existing) {
      existing.qty++;
    } else {
      this.items.push({
        name: product.name,
        price: Number(product.price),
        image: product.image,
        qty: 1
      });
    }

    this.save();
    this.flyToCart(product.image, imgElement);
  },

  changeQty(name, amount) {
    const item = this.items.find((i) => i.name === name);
    if (!item) return;

    item.qty += amount;
    if (item.qty <= 0)
      this.items = this.items.filter((i) => i.name !== name);

    this.save();
  },

  remove(name) {
    this.items = this.items.filter((i) => i.name !== name);
    this.save();
  },

  updateDot() {
    waitForElement("cartDot", (dot) => {
      dot.style.display = this.items.length > 0 ? "block" : "none";
    });
  },

  updateDrawer() {
    waitForElement("drawerContent", (drawer) => {
      if (this.items.length === 0) {
        drawer.innerHTML = `<p style="color:#9ca4b1;">Your cart is empty.</p>`;
        document.getElementById("drawerTotal").innerText = formatUSD(0);
        return;
      }

      let html = "";
      let total = 0;

      this.items.forEach((item) => {
        total += item.price * item.qty;

        html += `
          <div class="cart-item">
            <img src="${item.image}" class="cart-img">

            <div class="cart-info">
              <div class="cart-name">${item.name}</div>
              <div class="cart-price">${formatUSD(item.price)}</div>
            </div>

            <div class="cart-qty-controls">
              <div class="cart-qty-row">
                <button class="qty-btn" onclick="Cart.changeQty('${item.name}', -1)">−</button>
                <span class="qty-display">${item.qty}</span>
                <button class="qty-btn" onclick="Cart.changeQty('${item.name}', 1)">+</button>
              </div>

              <button class="qty-btn cart-remove" onclick="Cart.remove('${item.name}')">×</button>
            </div>
          </div>
        `;
      });

      drawer.innerHTML = html;
      document.getElementById("drawerTotal").innerText = formatUSD(total);
    });
  }
};
