import { initializeCart, addToCart } from './cart.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const galleryContainer = document.getElementById('galleryContainer');
    const searchInput = document.getElementById('searchInput');

    // --- State ---
    let photos = [];

    // --- Initialize Cart ---
    initializeCart({
        cartCount: document.getElementById('cartCount'),
        cartModal: document.getElementById('cartModal'),
        closeButton: document.querySelector('.close-button'),
        cartItems: document.getElementById('cartItems'),
        cartTotal: document.getElementById('cartTotal'),
        checkoutButton: document.getElementById('checkoutButton'),
        photos: photos
    });

    // --- Gallery Display ---
    const displayPhotos = (photosToDisplay) => {
        if (!galleryContainer) return;
        galleryContainer.innerHTML = '';
        photosToDisplay.forEach(photo => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';

            const link = document.createElement('a');
            link.href = `/product-detail.html?id=${photo.id}`;
            link.innerHTML = `
                <img src="${photo.path}" alt="${photo.description || photo.filename}">
                <div class="info">
                    <p>${photo.description || 'No description'}</p>
                    <p class="price">$${photo.price.toFixed(2)}</p>
                </div>
            `;
            galleryItem.appendChild(link);

            const infoDiv = galleryItem.querySelector('.info');
            galleryContainer.appendChild(galleryItem);
        });
    };

    const fetchAndDisplayPhotos = async () => {
        try {
            const response = await fetch('/photos');
            photos.push(...await response.json()); // Populate the shared photos array
            displayPhotos(photos);
        } catch (error) {
            console.error('Error loading photos:', error);
        }
    };

    // --- Photo Filtering ---
    const filterPhotos = (query) => {
        const lowerCaseQuery = query.toLowerCase();
        const filteredPhotos = photos.filter(photo => {
            const description = photo.description || '';
            return description.toLowerCase().includes(lowerCaseQuery);
        });
        displayPhotos(filteredPhotos);
    };

    // --- Search Event Listener ---
    if (searchInput) {
        searchInput.addEventListener('input', (event) => {
            filterPhotos(event.target.value);
        });
    }

    // --- Initialization ---
    fetchAndDisplayPhotos();
});
