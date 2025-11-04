import "/src/sass/style-catalog.scss";

const API_BASE = "https://ceramic-api.onrender.com";

function productToHTML(product) {
  return `
    <div class="products__card"> <img src="${API_BASE}${product.image}" alt="${product.title}" class="products__image" loading="lazy">
      <div class="products__card-description">      
        <h3 class="products__title">${product.title}</h3>
        <p class="products__price">${product.price} ${product.currency}</p>
      </div>
    </div>
    `;
}

async function fetchProducts() {
  const res = await fetch(`${API_BASE}/api/products`);
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status}`);
  }
  return res.json();
}

async function renderProducts(category = "tea") {
  const grid = document.getElementById("products-grid");
  if (!grid) return;

  grid.innerHTML = `
                    <div class="loading">
                      Loading...
                      <img src="/src/img/loading/timer.gif" alt="icon for load mode"/>
                    </div>
                    `;

  try {
    const products = await fetchProducts();

    const filteredProducts = products.filter(
      (product) => product.category === category,
    );

    if (filteredProducts.length === 0) {
      grid.innerHTML = `<div class="error">No products found in this category</div>`;
      return;
    }

    grid.innerHTML = filteredProducts.map(productToHTML).join("");
  } catch (error) {
    console.error("Error rendering products:", error);
    grid.innerHTML = `<div class="error">Failed to load products</div>`;
  }
}

function setupTabs() {
  const buttons = document.querySelectorAll(".catalog__filter button");
  if (!buttons.length) return;

  buttons.forEach((btn) =>
    btn.addEventListener("click", async () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const category = btn.dataset.category;
      await renderProducts(category);
    }),
  );
}

document.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  renderProducts("tea");
});
