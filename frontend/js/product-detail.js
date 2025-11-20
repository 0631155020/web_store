import { initializeCart, addToCart } from './cart.js';

document.addEventListener('DOMContentLoaded', () => {
    const productDetailContainer = document.getElementById('product-detail-container');

    // --- State ---
    let photos = [];
    let currentProduct = null;

    // --- Initialize Cart ---
    initializeCart({
        cartIcon: document.getElementById('cartIcon'),
        cartCount: document.getElementById('cartCount'),
        cartModal: document.getElementById('cartModal'),
        closeButton: document.querySelector('.close-button'),
        cartItems: document.getElementById('cartItems'),
        cartTotal: document.getElementById('cartTotal'),
        checkoutButton: document.getElementById('checkoutButton'),
        photos: photos
    });

    const fetchProductDetails = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (!productId) {
            productDetailContainer.innerHTML = '<p>Product not found.</p>';
            return;
        }

        try {
            const response = await fetch(`/photos/${productId}`);
            if (!response.ok) {
                throw new Error('Product not found');
            }
            const product = await response.json();
            currentProduct = product;
            photos.push(product); // Add to the photos array for the cart
            displayProductDetails(product);
        } catch (error) {
            console.error('Error fetching product details:', error);
            productDetailContainer.innerHTML = `<p>${error.message}</p>`;
        }
    };

    const displayProductDetails = (product) => {
        const sizesHTML = product.sizes && product.sizes.length > 0 ? `
            <div class="size-selector">
                ${product.sizes.map((size, index) => `
                    <input type="radio" id="size-${product.id}-${index}" name="size-${product.id}" value="${size}" ${index === 0 ? 'checked' : ''}>
                    <label for="size-${product.id}-${index}">${size}</label>
                `).join('')}
            </div>
        ` : '';

        productDetailContainer.innerHTML = `
            <div class="product-detail">
                <img src="${product.path}" alt="${product.description || product.filename}" class="product-detail-image">
                <div class="product-detail-info">
                    <h2>${product.description || 'No description'}</h2>
                    <p class="price">$${product.price.toFixed(2)}</p>
                    ${sizesHTML}
                    <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
                </div>
            </div>
        `;

        document.querySelector('.add-to-cart-btn').addEventListener('click', () => {
            const sizeSelector = document.querySelector(`input[name="size-${product.id}"]:checked`);
            const size = sizeSelector ? sizeSelector.value : null;
            addToCart(product, size);
        });
    };

    // --- Initialization ---
    fetchProductDetails();
});
