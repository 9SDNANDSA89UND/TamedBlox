/* =========================================
   CART SYSTEM (MODULAR)
========================================= */

window.Cart = {
  items: [],

  /* -----------------------------
     INIT CART FROM LOCALSTORAGE
  ----------------------------- */
  init() {
    const saved = localStorage.getItem("tamedblox_cart");
    this.items = saved ? JSON.parse(saved) : [];

    this.updateDot();
    this.updateDrawer();
  },

  /* -----------------------------
     SAVE CART
  ----------------------------- */
  save() {
    localStorage.setItem("tamedblox_cart", JSON.stringify(this.items));
    this.updateDot();
    this.updateDrawer();
  },

  /* -----------------------------
     ADD ITEM
  ----------------------------- */
  addItem(product) {
    const existing = this.items.find(i => i.name === product.name);

    if (existing) {
      existing.qty++;
    } else {
      this.items.push({
        name: product.name,
        price: product.price,
        image: product.image,
        qty: 1
      });
    }

    this.save();
  },

  /* -----------------------------
     CHANGE QUANTITY
  ----------------------------- */
  changeQty(name, amount) {
    const item = this.items.find(i => i.name === name);
    if (!item) return;

    item.qty += amount;
    if (item.qty <= 0) {
      this.items = this.items.filter(i => i.name !== name);
    }

    this.save();
  },

  /* -----------------------------
     REMOVE ITEM COMPLETELY
  ----------------------------- */
  remove(name) {
    this.items = this.items.filter(i => i.name !== name);
    this.save();
  },

  /* -----------------------------
     UPDATE CART DOT
  ----------------------------- */
  updateDot() {
    const dot = document.getElementById("cartDot");
    if (!dot) return;

    dot.style.display = this.items.length > 0 ? "block" : "none";
  },

  /* -----------------------------
     UPDATE CART DRAWER UI
  ----------------------------- */
  updateDrawer() {
    const drawer = document.getElementById("drawerContent");
    if (!drawer) return;

    if (this.items.length === 0) {
      drawer.innerHTML = `<p style="color:#9ca4b1;">Your cart is empty.</p>`;
      return;
    }

    let html = "";
    let total = 0;

    this.items.forEach(item => {
      total += item.price * item.qty;

      html += `
        <div class="drawer-item">
          <div class="drawer-row">
            <span class="drawer-name">${item.name}</span>
            <span class="drawer-price">£${item.price}</span>
          </div>

          <div class="drawer-controls">
            <button class="qty-btn" onclick="Cart.changeQty('${item.name}', -1)">−</button>
            <span class="drawer-qty">${item.qty}</span>
            <button class="qty-btn" onclick="Cart.changeQty('${item.name}', 1)">+</button>
            <button class="qty-btn remove" onclick="Cart.remove('${item.name}')">×</button>
          </div>
        </div>
      `;
    });

    html += `
      <hr class="drawer-line">
      <div class="drawer-total">Total: £${total.toFixed(2)}</div>
      <button class="checkout-btn" onclick="location.href='checkout.html'">
        Proceed to Checkout
      </button>
    `;

    drawer.innerHTML = html;
  }
};

