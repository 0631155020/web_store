document.addEventListener('DOMContentLoaded', () => {
    // --- Элементы DOM ---
    const galleryContainer = document.getElementById('galleryContainer');
    const cartIcon = document.getElementById('cartIcon');
    const cartCount = document.getElementById('cartCount');
    const cartModal = document.getElementById('cartModal');
    const closeButton = document.querySelector('.close-button');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    // --- Состояние ---
    let cart = []; // Теперь будет массив объектов { photo, quantity }
    let photos = []; // Хранилище для всех фото

    // --- Функция для отображения галереи ---
    const fetchAndDisplayPhotos = async () => {
        try {
            const response = await fetch('/photos');
            const fetchedPhotos = await response.json();
            photos = fetchedPhotos; // Сохраняем фото в глобальной области видимости

            galleryContainer.innerHTML = '';
            photos.forEach(photo => {
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

            // Добавляем обработчики на новые кнопки
            document.querySelectorAll('.add-to-cart-btn').forEach(button => {
                button.addEventListener('click', () => {
                    const photoId = button.dataset.id;
                    const photoToAdd = photos.find(p => p.id === photoId);
                    addToCart(photoToAdd);
                });
            });

        } catch (error) {
            console.error('Ошибка при загрузке фото:', error);
        }
    };

    // --- Функции для работы с корзиной ---
    const addToCart = (photo) => {
        const existingItem = cart.find(item => item.photo.id === photo.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ photo: photo, quantity: 1 });
        }
        updateCartView();
    };

    const decreaseQuantity = (photoId) => {
        const itemIndex = cart.findIndex(item => item.photo.id === photoId);
        if (itemIndex > -1) {
            cart[itemIndex].quantity--;
            if (cart[itemIndex].quantity === 0) {
                cart.splice(itemIndex, 1);
            }
        }
        updateCartView();
    };

    const removeAllFromCart = (photoId) => {
        const itemIndex = cart.findIndex(item => item.photo.id === photoId);
        if (itemIndex > -1) {
            cart.splice(itemIndex, 1);
        }
        updateCartView();
    };


    const updateCartView = () => {
        // Обновляем счетчик - общее количество товаров
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;

        // Обновляем содержимое модального окна
        cartItems.innerHTML = '';
        let total = 0;
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            const itemTotal = item.photo.price * item.quantity;
            cartItem.innerHTML = `
                <span>${item.photo.description || item.photo.filename}</span>
                <span class="cart-item-controls">
                    <button class="decrease-quantity-btn" data-id="${item.photo.id}">-</button>
                    <span class="quantity">x${item.quantity}</span>
                    <button class="increase-quantity-btn" data-id="${item.photo.id}">+</button>
                </span>
                <span>$${itemTotal.toFixed(2)}</span>
                <button class="remove-all-btn" data-id="${item.photo.id}">Удалить</button>
            `;
            cartItems.appendChild(cartItem);
            total += itemTotal;
        });

        // Обновляем итоговую сумму
        cartTotal.textContent = total.toFixed(2);

        // Добавляем обработчики для кнопок
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
                decreaseQuantity(photoId);
            });
        });

        document.querySelectorAll('.remove-all-btn').forEach(button => {
            button.addEventListener('click', () => {
                const photoId = button.dataset.id;
                removeAllFromCart(photoId);
            });
        });
    };

    // --- Управление модальным окном ---
    cartIcon.addEventListener('click', () => cartModal.style.display = 'block');
    closeButton.addEventListener('click', () => cartModal.style.display = 'none');
    window.addEventListener('click', (event) => {
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });

    // --- Инициализация ---
    fetchAndDisplayPhotos();
});
