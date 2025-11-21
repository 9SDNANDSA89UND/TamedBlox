/* ============================
   CART DRAWER TOGGLE SYSTEM
============================ */

const cartBtn = document.getElementById("cartBtn");
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const closeDrawerBtn = document.getElementById("closeDrawer");

/* Open Drawer */
function openDrawer() {
  cartDrawer.classList.add("open");
  cartOverlay.style.display = "block";

  // Disable background scroll
  document.body.style.overflow = "hidden";
}

/* Close Drawer */
function closeDrawer() {
  cartDrawer.classList.remove("open");
  cartOverlay.style.display = "none";

  // Restore scroll
  document.body.style.overflow = "";
}

/* Button listeners */
cartBtn?.addEventListener("click", openDrawer);
closeDrawerBtn?.addEventListener("click", closeDrawer);

/* Click outside to close */
cartOverlay?.addEventListener("click", closeDrawer);

/* ESC key closes drawer */
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeDrawer();
});
