// ===============================
// PRODUCT DATA (EMPTY FOR NOW)
// ===============================

const products = []; // You will add items later



// ===============================
// RENDER PRODUCTS
// ===============================
function renderProducts(list) {
    const grid = document.getElementById("productGrid");
    grid.innerHTML = ""; // clear old items

    if (list.length === 0) {
        grid.innerHTML = `
            <div style="
                grid-column: 1 / -1;
                text-align: center;
                color: #8b92a1;
                padding: 40px 0;
                font-size: 18px;
            ">
                No items available yet.
            </div>
        `;
        return;
    }

    list.forEach(product => {
        const card = document.createElement("div");
        card.className = "card scroll-fade";

        card.innerHTML = `
            <span class="tag">${product.rarity}</span>

            <img src="${product.image}" alt="${product.name}" />

            <h3>${product.name}</h3>
            <p>Instant delivery • Trusted seller</p>

            <div class="price-box" style="margin-top:10px;">
                <span class="price">£${product.price}</span>
                ${
                    product.oldPrice
                        ? `<span class="old-price">£${product.oldPrice}</span>`
                        : ""
                }
            </div>

            <div class="stock">${product.stock} left</div>

            <button class="buy-btn">Buy</button>
        `;

        grid.appendChild(card);
    });

    // animate cards
    setTimeout(() => {
        document.querySelectorAll(".scroll-fade").forEach(el => {
            el.classList.add("visible");
        });
    }, 100);
}



// ===============================
// FILTER SYSTEM
// ===============================
const filterButtons = document.querySelectorAll(".filter");

filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const filter = btn.textContent.toLowerCase();

        if (filter === "all") {
            renderProducts(products);
        } else {
            const filtered = products.filter(p => p.rarity.toLowerCase() === filter);
            renderProducts(filtered);
        }
    });
});


// ===============================
// INITIAL LOAD
// ===============================
renderProducts(products);
