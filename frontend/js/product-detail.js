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
        // Main container
        productDetailContainer.innerHTML = ''; // Clear

        // Left side: Image Gallery
        const galleryContainer = document.createElement('div');
        galleryContainer.className = 'product-gallery';

        const mainImage = document.createElement('img');
        mainImage.className = 'main-product-image';
        mainImage.src = product.path; // Use the single path from the existing API response
        mainImage.alt = product.description;

        // The current backend model only supports one image, so no thumbnails are created.
        galleryContainer.appendChild(mainImage);

        // Right side: Product Info
        const infoContainer = document.createElement('div');
        infoContainer.className = 'product-info';

        const productName = document.createElement('h1');
        productName.textContent = product.description || 'Product'; // 'name' field doesn't exist in the model

        const productPrice = document.createElement('p');
        productPrice.className = 'price';
        productPrice.textContent = `$${product.price.toFixed(2)}`;

        // Size selector
        const sizeSelectorContainer = document.createElement('div');
        sizeSelectorContainer.className = 'size-selector-container';
        if (product.sizes && product.sizes.length > 0) {
            const sizeLabel = document.createElement('p');
            sizeLabel.textContent = 'Select Size:';
            sizeSelectorContainer.appendChild(sizeLabel);

            const sizeSelector = document.createElement('div');
            sizeSelector.className = 'size-selector';
            product.sizes.forEach((size, index) => {
                const sizeInput = document.createElement('input');
                sizeInput.type = 'radio';
                sizeInput.id = `size-${product.id}-${index}`;
                sizeInput.name = `size-${product.id}`;
                sizeInput.value = size;
                if (index === 0) sizeInput.checked = true;

                const sizeOptionLabel = document.createElement('label');
                sizeOptionLabel.htmlFor = `size-${product.id}-${index}`;
                sizeOptionLabel.textContent = size;

                sizeSelector.appendChild(sizeInput);
                sizeSelector.appendChild(sizeOptionLabel);
            });
            sizeSelectorContainer.appendChild(sizeSelector);
        }

        // Add to cart button
        const addToCartBtn = document.createElement('button');
        addToCartBtn.className = 'add-to-cart-btn';
        addToCartBtn.textContent = 'Add to Cart';
        addToCartBtn.addEventListener('click', () => {
            const selectedSizeEl = document.querySelector(`input[name="size-${product.id}"]:checked`);
            const selectedSize = selectedSizeEl ? selectedSizeEl.value : null;
            addToCart(product, selectedSize);
        });

        infoContainer.appendChild(productName);
        infoContainer.appendChild(productPrice);
        infoContainer.appendChild(sizeSelectorContainer);
        infoContainer.appendChild(addToCartBtn);

        productDetailContainer.appendChild(galleryContainer);
        productDetailContainer.appendChild(infoContainer);
    };

    // --- Initialization ---
    fetchProductDetails();
});
