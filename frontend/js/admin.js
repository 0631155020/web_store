document.addEventListener('DOMContentLoaded', () => {
    // --- Элементы DOM ---
    const galleryContainer = document.getElementById('galleryContainer');
    const uploadForm = document.getElementById('uploadForm');
    const fileInput = document.getElementById('fileInput');
    const sizeTablePhotoInput = document.getElementById('sizeTablePhotoInput');
    const nameInput = document.getElementById('nameInput');
    const itemDescriptionInput = document.getElementById('itemDescriptionInput');
    const priceInput = document.getElementById('priceInput');
    
    // --- Функция для отображения галереи ---
    const fetchAndDisplayPhotos = async () => {
        try {
            const response = await fetch('/photos');
            const photos = await response.json();

            galleryContainer.innerHTML = '';
            photos.forEach(photo => {
                const galleryItem = document.createElement('a');
                galleryItem.className = 'gallery-item';
                galleryItem.href = `/product-detail.html?id=${photo.id}`;

                galleryItem.innerHTML = `
                    <img src="${photo.path}" alt="${photo.name || photo.filename}">
                    <div class="info">
                        <p>${photo.name || 'Без названия'}</p>
                        <p class="price">$${photo.price.toFixed(2)}</p>
                        <p>${photo.sizes?.join(', ') || ''}</p>
                        <button class="delete-btn" data-id="${photo.id}">Удалить</button>
                    </div>
                `;

                galleryContainer.appendChild(galleryItem);
            });

            // Добавляем обработчики для кнопок удаления
            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const photoId = button.dataset.id;
                    deletePhoto(photoId);
                });
            });

        } catch (error) {
            console.error('Ошибка при загрузке фото:', error);
        }
    };

    // --- Функция для удаления фото ---
    const deletePhoto = async (photoId) => {
        if (!confirm('Вы уверены, что хотите удалить это фото?')) {
            return;
        }

        try {
            const response = await fetch(`/photos/${photoId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Ошибка при удалении');
            }

            // Перезагружаем галерею
            fetchAndDisplayPhotos();
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось удалить фото.');
        }
    };


    // --- Обработчик отправки формы ---
    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const file = fileInput.files[0];
        const sizeTablePhoto = sizeTablePhotoInput.files[0];
        const name = nameInput.value;
        const item_description = itemDescriptionInput.value;
        const price = priceInput.value;

        const sizeCheckboxes = document.querySelectorAll('input[name="sizes"]:checked');
        const sizes = Array.from(sizeCheckboxes).map(checkbox => checkbox.value);
        

        if (!file || !price) {
            alert('Пожалуйста, выберите файл и укажите цену.');
            return;
        }

        const formData = new FormData();
        formData.append('item', file);
        if (sizeTablePhoto) {
            formData.append('size_table_photo', sizeTablePhoto);
        }
        formData.append('name', name);
        formData.append('item_description', item_description);
        formData.append('price', price);
        formData.append('sizes', JSON.stringify(sizes));
        try {
            const response = await fetch('/photos', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error('Ошибка загрузки');

            uploadForm.reset();
            await fetchAndDisplayPhotos();
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось загрузить файл.');
        }
    });

    // --- Инициализация ---
    fetchAndDisplayPhotos();
});
