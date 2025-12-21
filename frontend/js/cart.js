// --- State ---
let cart = [];
let photos = []; // This will be populated by the calling script

// --- DOM Elements (to be set by the calling script) ---
let cartCount, cartItems, cartTotal, cartModal;

// --- Functions for localStorage ---
const saveCart = () => {
    localStorage.setItem('cart', JSON.stringify(cart));
};

const loadCart = () => {
    const cartData = localStorage.getItem('cart');
    cart = cartData ? JSON.parse(cartData) : [];
    updateCartView();
};

// --- Cart Management Functions ---
export const addToCart = (photo, size) => {
    if (photo.sizes && photo.sizes.length > 0 && !size) {
        alert('Please select a size.');
        return;
    }

    const existingItem = cart.find(item => item.photo.id === photo.id && item.size === size);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ photo: photo, quantity: 1, size: size });
    }
    saveCart();
    updateCartView();
    if (cartModal) {
        cartModal.style.display = 'block';
    }
};

const decreaseQuantity = (photoId, size) => {
    const itemIndex = cart.findIndex(item => item.photo.id === photoId && item.size === size);
    if (itemIndex > -1) {
        cart[itemIndex].quantity--;
        if (cart[itemIndex].quantity === 0) {
            cart.splice(itemIndex, 1);
        }
    }
    saveCart();
    updateCartView();
};

const removeAllFromCart = (photoId, size) => {
    cart = cart.filter(item => !(item.photo.id === photoId && item.size === size));
    saveCart();
    updateCartView();
};

const updateCartView = () => {
    if (!cartCount || !cartItems || !cartTotal) return;

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Also update the mobile cart count if it exists
    const cartCountMobile = document.getElementById('cartCountMobile');
    if (cartCountMobile) {
        cartCountMobile.textContent = totalItems;
    }

    cartItems.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        const itemTotal = parseFloat(item.photo.price) * item.quantity;
        cartItem.innerHTML = `
            <img src="${item.photo.path}" alt="${item.photo.description}" class="cart-item-image">
            <span>${item.photo.description || item.photo.filename}${item.size ? ` (${item.size})` : ''}</span>
            <span class="cart-item-controls">
                <button class="decrease-quantity-btn" data-id="${item.photo.id}" data-size="${item.size}">-</button>
                <span class="quantity">x${item.quantity}</span>
                <button class="increase-quantity-btn" data-id="${item.photo.id}" data-size="${item.size}">+</button>
            </span>
            <span>${itemTotal.toFixed(2)} UAH</span>
            <button class="remove-all-btn" data-id="${item.photo.id}" data-size="${item.size}">Remove All</button>
        `;
        cartItems.appendChild(cartItem);
        total += itemTotal;
    });

    cartTotal.textContent = total.toFixed(2);

    // Attach event listeners to the new buttons in the cart
    document.querySelectorAll('.increase-quantity-btn').forEach(button => {
        button.addEventListener('click', () => {
            const photoId = button.dataset.id;
            const size = button.dataset.size;
            const item = cart.find(i => i.photo.id === photoId && i.size === size);
            if (item) {
                addToCart(item.photo, item.size);
            }
        });
    });

    document.querySelectorAll('.decrease-quantity-btn').forEach(button => {
        button.addEventListener('click', () => {
            const photoId = button.dataset.id;
            const size = button.dataset.size;
            decreaseQuantity(photoId, size);
        });
    });

    document.querySelectorAll('.remove-all-btn').forEach(button => {
        button.addEventListener('click', () => {
            const photoId = button.dataset.id;
            const size = button.dataset.size;
            removeAllFromCart(photoId, size);
        });
    });
};

// --- Initialization Function ---
export const initializeCart = (config) => {
    cartCount = config.cartCount;
    cartItems = config.cartItems;
    cartTotal = config.cartTotal;
    cartModal = config.cartModal; // Set the cartModal
    photos = config.photos; // The calling script will provide the photos array
    loadCart();

    // Modal Management
    const cartIcons = document.querySelectorAll('.cart-icon');
    const closeButton = config.closeButton;
    const checkoutButton = config.checkoutButton;

    cartIcons.forEach(icon => {
        icon.addEventListener('click', () => cartModal.style.display = 'block');
    });

    if (closeButton) {
        closeButton.addEventListener('click', () => cartModal.style.display = 'none');
    }
    window.addEventListener('click', (event) => {
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });

    if (checkoutButton) {
        checkoutButton.addEventListener('click', () => {
            if (cart.length > 0) {
                window.location.href = '/checkout';
            } else {
                alert('Your cart is empty!');
            }
        });
    }
};
