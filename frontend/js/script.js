document.addEventListener('DOMContentLoaded', () => {
    // --- Элементы DOM ---
    const galleryContainer = document.getElementById('galleryContainer');
    const uploadForm = document.getElementById('uploadForm');
    const fileInput = document.getElementById('fileInput');
    const descriptionInput = document.getElementById('descriptionInput');
    const priceInput = document.getElementById('priceInput');

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

    const updateCartView = () => {
        // Обновляем счетчик
        cartCount.textContent = cart.length;

        // Обновляем содержимое модального окна
        cartItems.innerHTML = '';
        let total = 0;
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <span>${item.description || item.filename}</span>
                <span>$${item.price.toFixed(2)}</span>
            `;
            cartItems.appendChild(cartItem);
            total += item.price;
        });

        // Обновляем итоговую сумму
        cartTotal.textContent = total.toFixed(2);
    };

    // --- Обработчик отправки формы ---
    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const file = fileInput.files[0];
        const description = descriptionInput.value;
        const price = priceInput.value;

        if (!file || !price) {
            alert('Пожалуйста, выберите файл и укажите цену.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        const uploadURL = `/photos?description=${encodeURIComponent(description)}&price=${price}`;

        try {
            const response = await fetch(uploadURL, { method: 'POST', body: formData });
            if (!response.ok) throw new Error('Ошибка загрузки');

            uploadForm.reset();
            await fetchAndDisplayPhotos();
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось загрузить файл.');
        }
    });

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
