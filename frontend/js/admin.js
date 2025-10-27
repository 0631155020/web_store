document.addEventListener('DOMContentLoaded', () => {
    // --- Элементы DOM ---
    const galleryContainer = document.getElementById('galleryContainer');
    const uploadForm = document.getElementById('uploadForm');
    const fileInput = document.getElementById('fileInput');
    const descriptionInput = document.getElementById('descriptionInput');
    const priceInput = document.getElementById('priceInput');

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
                        <button class="delete-btn" data-id="${photo.id}">Удалить</button>
                    </div>
                `;

                galleryContainer.appendChild(galleryItem);
            });

            // Добавляем обработчики для кнопок удаления
            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', () => {
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

    // --- Инициализация ---
    fetchAndDisplayPhotos();
});
