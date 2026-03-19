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
            productDetailContainer.innerHTML = `<p>${window.t('productNotFound')}</p>`;
            return;
        }

        try {
            const response = await fetch(`/photos/${productId}`);
            if (!response.ok) {
                throw new Error(window.t('productNotFound'));
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
        if (!product) return;

        // Main container
        productDetailContainer.innerHTML = ''; // Clear

        // Left side: Image Gallery
        const galleryContainer = document.createElement('div');
        galleryContainer.className = 'product-gallery';

        const mainImage = document.createElement('img');
        mainImage.className = 'main-product-image';
        mainImage.src = product.path;
        mainImage.alt = product.name || window.t('noDescription');

        galleryContainer.appendChild(mainImage);

        // Right side: Product Info
        const infoContainer = document.createElement('div');
        infoContainer.className = 'product-info';

        const productName = document.createElement('h1');
        productName.textContent = product.name || window.t('noDescription');

        const productPrice = document.createElement('p');
        productPrice.className = 'price';
        productPrice.textContent = `${product.price.toFixed(2)} ${window.t('currency')}`;

        // Size selector
        const sizeSelectorContainer = document.createElement('div');
        sizeSelectorContainer.className = 'size-selector-container';
        if (product.sizes && product.sizes.length > 0) {
            const sizeLabel = document.createElement('p');
            sizeLabel.textContent = window.t('selectSize');
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

        // Item Description
        const itemDescription = document.createElement('p');
        itemDescription.className = 'item-description';
        itemDescription.textContent = product.item_description || '';

        // Add to cart button
        const addToCartBtn = document.createElement('button');
        addToCartBtn.className = 'add-to-cart-btn';
        addToCartBtn.textContent = window.t('addToCart');
        addToCartBtn.addEventListener('click', () => {
            const selectedSizeEl = document.querySelector(`input[name="size-${product.id}"]:checked`);
            const selectedSize = selectedSizeEl ? selectedSizeEl.value : null;
            addToCart(product, selectedSize);
        });

        infoContainer.appendChild(productName);
        infoContainer.appendChild(productPrice);

        // Display size table photo if it exists
        if (product.size_table_photo_path) {
            const sizeTableImg = document.createElement('img');
            sizeTableImg.src = product.size_table_photo_path;
            sizeTableImg.alt = 'Size Table';
            sizeTableImg.className = 'size-table-photo'; // For styling
            infoContainer.appendChild(sizeTableImg);
        }

        infoContainer.appendChild(sizeSelectorContainer);
        infoContainer.appendChild(itemDescription);
        infoContainer.appendChild(addToCartBtn);

        productDetailContainer.appendChild(galleryContainer);
        productDetailContainer.appendChild(infoContainer);
    };

    window.addEventListener('languageLoaded', () => {
        if (currentProduct) {
            displayProductDetails(currentProduct);
        } else if (!new URLSearchParams(window.location.search).get('id')) {
            productDetailContainer.innerHTML = `<p>${window.t('productNotFound')}</p>`;
        }
    });

    // --- Initialization ---
    // Only fetch if language is already loaded, else wait for languageLoaded event.
    // However, fetchProductDetails takes time, so we can start fetching,
    // and display will use window.t which might be loaded or not.
    // It's safe to just fetch.
    fetchProductDetails();
});
