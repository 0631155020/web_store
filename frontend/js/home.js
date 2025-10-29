document.addEventListener('DOMContentLoaded', () => {
    // --- Элементы DOM ---
    const galleryContainer = document.getElementById('galleryContainer');
    const cartIcon = document.getElementById('cartIcon');
    const cartCount = document.getElementById('cartCount');
    const cartModal = document.getElementById('cartModal');
    const closeButton = document.querySelector('.close-button');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    // --- Состояние корзины ---
    let cart = [];

    // --- Функция для отображения галереи ---
    const fetchAndDisplayPhotos = async () => {
        try {
            const response = await fetch('/photos');
            const photos = await response.json();

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
        cart.push(photo);
        updateCartView();
    };

    const removeFromCart = (index) => {
        cart.splice(index, 1);
        updateCartView();
    };

    const updateCartView = () => {
        // Обновляем счетчик
        cartCount.textContent = cart.length;

        // Обновляем содержимое модального окна
        cartItems.innerHTML = '';
        let total = 0;
        cart.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <span>${item.description || item.filename}</span>
                <span>$${item.price.toFixed(2)}</span>
                <button class="remove-from-cart-btn" data-index="${index}">Удалить</button>
            `;
            cartItems.appendChild(cartItem);
            total += item.price;
        });

        // Обновляем итоговую сумму
        cartTotal.textContent = total.toFixed(2);

        // Добавляем обработчики для кнопок удаления
        document.querySelectorAll('.remove-from-cart-btn').forEach(button => {
            button.addEventListener('click', () => {
                const index = parseInt(button.dataset.index, 10);
                removeFromCart(index);
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
