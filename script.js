const API_BASE = 'http:/ / localhost: 5050 / api';
const productsContainer = document.getElementById('products-container');

// Fetch products from backend
async function fetchProducts() {
    try {
        const response = await fetch(`${API_BASE}/products`);
        const data = await response.json();

        if (!data.success) {
            productsContainer.innerHTML = '<p>Failed to load products</p>';
            return;
        }

        // Clear existing content
        productsContainer.innerHTML = '';

        // Loop through each product
        data.data.forEach(product => {
            const col = document.createElement('div');
            col.classList.add('col-md-4', 'mb-4');

            col.innerHTML = `
                <div class="card product-card">
                    <img src="${product.imageUrl}" class="product-image card-img-top" alt="${product.name}">
                    <div class="card-body">
                        <h5>${product.name}</h5>
                        <p class="product-description">${product.description}</p>
                        <p class="product-price">${product.price} ${product.currency}</p>
                        <button class="add-btn btn btn-primary"><i class="fas fa-shopping-cart"></i> Add</button>
                    </div>
                </div>
            `;

            productsContainer.appendChild(col);
        });

    } catch (err) {
        console.error('Error fetching products:', err);
        productsContainer.innerHTML = '<p>Error loading products</p>';
    }
}

// Load products when page loads
window.addEventListener('DOMContentLoaded', fetchProducts);
