document.addEventListener('DOMContentLoaded', () => {
    // --- Элементы DOM ---
    const galleryContainer = document.getElementById('galleryContainer');
    const cartIcon = document.getElementById('cartIcon');
    const cartCount = document.getElementById('cartCount');
    const cartModal = document.getElementById('cartModal');
    const detailsModal = document.getElementById('detailsModal');
    const closeButton = document.querySelector('.close-button');
    const closeDetailsButton = detailsModal.querySelector('.close-button');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutButton = document.getElementById('checkoutButton');
    const searchInput = document.getElementById('searchInput');

    // --- Состояние ---
    let cart = [];
    let photos = [];

    // --- Функции для работы с localStorage ---
    const saveCart = () => {
        localStorage.setItem('cart', JSON.stringify(cart));
    };

    const loadCart = () => {
        const cartData = localStorage.getItem('cart');
        cart = cartData ? JSON.parse(cartData) : [];
        updateCartView();
    };

    // --- Функция для отображения галереи ---
    const fetchAndDisplayPhotos = async () => {
        try {
            const response = await fetch('/photos');
            photos = await response.json();

            galleryContainer.innerHTML = '';
            photos.forEach(photo => {
                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item';
                const sizesHTML = photo.sizes && photo.sizes.length > 0 ? `
                    <div class="size-selector">
                        ${photo.sizes.map((size, index) => `
                            <input type="radio" id="size-${photo.id}-${index}" name="size-${photo.id}" value="${size}" ${index === 0 ? 'checked' : ''}>
                            <label for="size-${photo.id}-${index}">${size}</label>
                        `).join('')}
                    </div>
                ` : '';

                galleryItem.innerHTML = `
                    <img src="${photo.path}" alt="${photo.description || photo.filename}">
                    <div class="info">
                        <p>${photo.description || 'Без описания'}</p>
                        <p class="price">$${photo.price.toFixed(2)}</p>
                        ${sizesHTML}
                        <button class="details-btn" data-id="${photo.id}">Детали</button>
                        <button class="add-to-cart-btn" data-id="${photo.id}">Добавить в корзину</button>
                    </div>
                `;
                galleryContainer.appendChild(galleryItem);
            });

            document.querySelectorAll('.add-to-cart-btn').forEach(button => {
                button.addEventListener('click', () => {
                    const photoId = button.dataset.id;
                    const photoToAdd = photos.find(p => p.id === photoId);
                    addToCart(photoToAdd);
                });
            });

            document.querySelectorAll('.details-btn').forEach(button => {
                button.addEventListener('click', () => {
                    const photoId = button.dataset.id;
                    const photoToShow = photos.find(p => p.id === photoId);
                    showDetails(photoToShow);
                });
            });

        } catch (error) {
            console.error('Ошибка при загрузке фото:', error);
        }
    };

    const showDetails = (photo) => {
        const detailsContent = document.getElementById('detailsContent');
        detailsContent.innerHTML = `
            <h3>${photo.description || 'Детали'}</h3>
            <p><strong>Доступные размеры:</strong></p>
            <ul>
                ${photo.sizes && photo.sizes.length > 0 ? photo.sizes.map(size => `<li>${size}</li>`).join('') : '<li>Нет информации о размерах</li>'}
            </ul>
        `;
        detailsModal.style.display = 'block';
    };

    // --- Функции для работы с корзиной ---
    const addToCart = (photo) => {
        const sizeSelector = document.querySelector(`input[name="size-${photo.id}"]:checked`);
        const size = sizeSelector ? sizeSelector.value : null;

        if (photo.sizes && photo.sizes.length > 0 && !size) {
            alert('Пожалуйста, выберите размер.');
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
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;

        cartItems.innerHTML = '';
        let total = 0;
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            const itemTotal = item.photo.price * item.quantity;
            cartItem.innerHTML = `
                <span>${item.photo.description || item.photo.filename}${item.size ? ` (${item.size})` : ''}</span>
                <span class="cart-item-controls">
                    <button class="decrease-quantity-btn" data-id="${item.photo.id}" data-size="${item.size}">-</button>
                    <span class="quantity">x${item.quantity}</span>
                    <button class="increase-quantity-btn" data-id="${item.photo.id}">+</button>
                </span>
                <span>$${itemTotal.toFixed(2)}</span>
                <button class="remove-all-btn" data-id="${item.photo.id}">Удалить</button>
            `;
            cartItems.appendChild(cartItem);
            total += itemTotal;
        });

        cartTotal.textContent = total.toFixed(2);

        // --- Обработчики событий для кнопок в корзине ---
        document.querySelectorAll('.increase-quantity-btn').forEach(button => {
            button.addEventListener('click', () => {
                const photoId = button.dataset.id;
                const photoToAdd = photos.find(p => p.id === photoId);
                addToCart(photoToAdd);
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

    // --- Управление модальным окном ---
    cartIcon.addEventListener('click', () => cartModal.style.display = 'block');
    closeButton.addEventListener('click', () => cartModal.style.display = 'none');
    closeDetailsButton.addEventListener('click', () => detailsModal.style.display = 'none');
    window.addEventListener('click', (event) => {
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
        }
        if (event.target === detailsModal) {
            detailsModal.style.display = 'none';
        }
    });

    // --- Переход к оформлению заказа ---
    checkoutButton.addEventListener('click', () => {
        if (cart.length > 0) {
            window.location.href = '/checkout';
        } else {
            alert('Ваша корзина пуста!');
        }
    });

    // --- Функция для фильтрации фотографий ---
    const filterPhotos = (query) => {
        const lowerCaseQuery = query.toLowerCase();
        const filteredPhotos = photos.filter(photo => {
            const description = photo.description || '';
            return description.toLowerCase().includes(lowerCaseQuery);
        });
        displayFilteredPhotos(filteredPhotos);
    };

    const displayFilteredPhotos = (filteredPhotos) => {
        galleryContainer.innerHTML = '';
        filteredPhotos.forEach(photo => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.innerHTML = `
                <img src="${photo.path}" alt="${photo.description || photo.filename}">
                <div class="info">
                    <p>${photo.description || 'Без описания'}</p>
                    <p class="price">$${photo.price.toFixed(2)}</p>
                    <button class="add-to-cart-btn" data-id="${photo.id}">Добавить в корзину</button>
                </div>
            `;
            galleryContainer.appendChild(galleryItem);
        });

        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', () => {
                const photoId = button.dataset.id;
                const photoToAdd = photos.find(p => p.id === photoId);
                addToCart(photoToAdd);
            });
        });
    };

    // --- Обработчик событий для строки поиска ---
    searchInput.addEventListener('input', (event) => {
        filterPhotos(event.target.value);
    });

    // --- Инициализация ---
    fetchAndDisplayPhotos();
    loadCart();
});
