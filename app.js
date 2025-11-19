const API = "https://website-5eml.onrender.com";

async function loadProducts() {
    const res = await fetch(API + "/products");
    const data = await res.json();

    const list = document.getElementById("product-list");
    list.innerHTML = "";

    data.forEach(p => {
        list.innerHTML += `
            <div class="product">
                <h3>${p.name}</h3>
                <p>${p.description}</p>
                <p>£${p.price}</p>
                <button onclick="addToCart('${p.id}')">Add to Cart</button>
            </div>
        `;
    });
}

async function addToCart(id) {
    await fetch(API + "/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id })
    });
    alert("Added!");
}

loadProducts();

