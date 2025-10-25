document.addEventListener('DOMContentLoaded', () => {
    const galleryContainer = document.getElementById('galleryContainer');
    const uploadForm = document.getElementById('uploadForm');
    const fileInput = document.getElementById('fileInput');
    const descriptionInput = document.getElementById('descriptionInput');

    // --- Функция для получения и отображения всех фотографий ---
    const fetchAndDisplayPhotos = async () => {
        try {
            const response = await fetch('/photos');
            if (!response.ok) {
                throw new Error('Не удалось загрузить фотографии');
            }
            const photos = await response.json();

            galleryContainer.innerHTML = ''; // Очищаем галерею перед обновлением

            photos.forEach(photo => {
                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item';

                const img = document.createElement('img');
                // Используем относительный путь для универсальности
                img.src = photo.path;
                img.alt = photo.description || photo.filename;

                const info = document.createElement('div');
                info.className = 'info';

                const description = document.createElement('p');
                description.textContent = photo.description || 'Без описания';

                info.appendChild(description);
                galleryItem.appendChild(img);
                galleryItem.appendChild(info);

                galleryContainer.appendChild(galleryItem);
            });
        } catch (error) {
            console.error('Ошибка:', error);
            galleryContainer.innerHTML = '<p>Не удалось загрузить фотографии.</p>';
        }
    };

    // --- Обработчик отправки формы для загрузки нового фото ---
    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Предотвращаем стандартную отправку формы

        const file = fileInput.files[0];
        const description = descriptionInput.value;

        if (!file) {
            alert('Пожалуйста, выберите файл для загрузки.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        // Формируем URL с query-параметром для описания
        const uploadURL = `/photos?description=${encodeURIComponent(description)}`;

        try {
            const response = await fetch(uploadURL, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Ошибка при загрузке файла.');
            }

            // --- Очищаем форму и обновляем галерею ---
            uploadForm.reset();
            await fetchAndDisplayPhotos();

        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось загрузить файл.');
        }
    });

    // --- Первоначальная загрузка фотографий при открытии страницы ---
    fetchAndDisplayPhotos();
});
