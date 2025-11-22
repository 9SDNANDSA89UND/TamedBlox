// drawer.js — fully updated clean version

document.addEventListener("DOMContentLoaded", () => {
    const cartBtn = document.getElementById("cartBtn");
    const cartDrawer = document.getElementById("cartDrawer");
    const cartOverlay = document.getElementById("cartOverlay");
    const closeDrawer = document.getElementById("closeDrawer");

    if (!cartBtn) {
        console.error("Cart button missing!");
        return;
    }

    // Open drawer
    cartBtn.addEventListener("click", () => {
        cartDrawer.classList.add("open");
        cartOverlay.style.display = "block";
    });

    // Close drawer
    closeDrawer.addEventListener("click", () => {
        cartDrawer.classList.remove("open");
        cartOverlay.style.display = "none";
    });

    cartOverlay.addEventListener("click", () => {
        cartDrawer.classList.remove("open");
        cartOverlay.style.display = "none";
    });
});
