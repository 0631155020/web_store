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
                        <div class="action-buttons">
                            <button class="edit-btn" data-id="${photo.id}">Редактировать</button>
                            <button class="delete-btn" data-id="${photo.id}">Удалить</button>
                        </div>
                    </div>
                `;

                galleryContainer.appendChild(galleryItem);
            });

            // Добавляем обработчики
            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const photoId = button.dataset.id;
                    deletePhoto(photoId);
                });
            });

            document.querySelectorAll('.edit-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const photoId = button.dataset.id;
                    const product = photos.find(p => p.id === photoId);
                    if (product) openEditModal(product);
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
        const files = Array.from(fileInput.files);
        const sizeTablePhoto = sizeTablePhotoInput.files[0];
        const name = nameInput.value;
        const item_description = itemDescriptionInput.value;
        const price = priceInput.value;

        const sizeCheckboxes = document.querySelectorAll('input[name="sizes"]:checked');
        const sizes = Array.from(sizeCheckboxes).map(checkbox => checkbox.value);
        

        if (files.length === 0 || !price) {
            alert('Пожалуйста, выберите файл(ы) и укажите цену.');
            return;
        }

        const formData = new FormData();
        files.forEach(file => {
            formData.append('images', file);
        });
        formData.append('primary_image_index', selectedPrimaryIndex);

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
            imagePreviewContainer.innerHTML = '';
            selectedPrimaryIndex = 0;
            await fetchAndDisplayPhotos();
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось загрузить файл.');
        }
    });

    // --- Обработка превью изображений ---
    let selectedPrimaryIndex = 0;
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');

    fileInput.addEventListener('change', (event) => {
        imagePreviewContainer.innerHTML = '';
        selectedPrimaryIndex = 0;

        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        files.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewItem = document.createElement('div');
                previewItem.className = 'image-preview-item';

                const img = document.createElement('img');
                img.src = e.target.result;

                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = 'primaryImage';
                radio.value = index;
                if (index === 0) radio.checked = true;

                radio.addEventListener('change', () => {
                    selectedPrimaryIndex = index;
                });

                const label = document.createElement('div');
                label.className = 'primary-label';
                label.textContent = 'Primary';

                previewItem.appendChild(img);
                previewItem.appendChild(radio);
                previewItem.appendChild(label);

                imagePreviewContainer.appendChild(previewItem);
            };
            reader.readAsDataURL(file);
        });
    });

    // --- Обработка редактирования ---
    const editModal = document.getElementById('editProductModal');
    const closeEditModal = document.getElementById('closeEditModal');
    const editForm = document.getElementById('editProductForm');
    const uploadNewImagesBtn = document.getElementById('uploadNewImagesBtn');

    let currentEditingProduct = null;

    closeEditModal.addEventListener('click', () => {
        editModal.style.display = 'none';
    });

    const openEditModal = async (product) => {
        currentEditingProduct = product;
        document.getElementById('editProductId').value = product.id;
        document.getElementById('editNameInput').value = product.name || '';
        document.getElementById('editItemDescriptionInput').value = product.item_description || '';
        document.getElementById('editPriceInput').value = product.price;

        // Reset sizes
        document.querySelectorAll('input[name="edit_sizes"]').forEach(cb => cb.checked = false);
        if (product.sizes) {
            product.sizes.forEach(size => {
                const cb = document.querySelector(`input[name="edit_sizes"][value="${size}"]`);
                if (cb) cb.checked = true;
            });
        }

        renderEditImages();
        document.getElementById('editNewImagesInput').value = '';

        editModal.style.display = 'block';
    };

    const renderEditImages = () => {
        const container = document.getElementById('editImagesContainer');
        container.innerHTML = '';

        if (!currentEditingProduct.images || currentEditingProduct.images.length === 0) {
            // Fallback for older data format before migration
            if (currentEditingProduct.path) {
                 const row = document.createElement('div');
                 row.className = 'edit-image-row';
                 row.innerHTML = `<img src="${currentEditingProduct.path}"> <span class="primary-badge">Primary</span> (Legacy)`;
                 container.appendChild(row);
            }
            return;
        }

        currentEditingProduct.images.sort((a,b) => a.sort_order - b.sort_order).forEach((image, index) => {
            const row = document.createElement('div');
            row.className = 'edit-image-row';
            row.dataset.imageId = image.id;

            let html = `<img src="${image.image_url}">`;
            if (image.is_primary) {
                html += `<span class="primary-badge">Primary</span>`;
            }

            html += `<div class="edit-image-actions">`;

            if (!image.is_primary) {
                html += `<button type="button" class="set-primary-btn">Сделать основным</button>`;
            }

            html += `<button type="button" class="delete-image-btn">Удалить</button>`;
            html += `</div>`;

            row.innerHTML = html;

            // Event listeners
            if (!image.is_primary) {
                row.querySelector('.set-primary-btn').addEventListener('click', async () => {
                    await setPrimaryImage(currentEditingProduct.id, image.id);
                });
            }

            row.querySelector('.delete-image-btn').addEventListener('click', async () => {
                if(confirm('Удалить это изображение?')) {
                    await deleteProductImage(currentEditingProduct.id, image.id);
                }
            });

            container.appendChild(row);
        });
    };

    const setPrimaryImage = async (productId, imageId) => {
        try {
            const response = await fetch(`/photos/${productId}/images/${imageId}/primary`, { method: 'PUT' });
            if(response.ok) {
                currentEditingProduct = await response.json();
                renderEditImages();
                fetchAndDisplayPhotos();
            }
        } catch (e) {
            console.error('Error setting primary image', e);
        }
    };

    const deleteProductImage = async (productId, imageId) => {
        try {
            const response = await fetch(`/photos/${productId}/images/${imageId}`, { method: 'DELETE' });
            if(response.ok) {
                // Re-fetch product to get updated images
                const prodResponse = await fetch(`/photos/${productId}`);
                currentEditingProduct = await prodResponse.json();
                renderEditImages();
                fetchAndDisplayPhotos();
            }
        } catch (e) {
            console.error('Error deleting image', e);
        }
    };

    uploadNewImagesBtn.addEventListener('click', async () => {
        const input = document.getElementById('editNewImagesInput');
        if (input.files.length === 0) return;

        const formData = new FormData();
        Array.from(input.files).forEach(file => {
            formData.append('images', file);
        });

        try {
            const response = await fetch(`/photos/${currentEditingProduct.id}/images`, {
                method: 'POST',
                body: formData
            });

            if(response.ok) {
                currentEditingProduct = await response.json();
                renderEditImages();
                input.value = '';
                fetchAndDisplayPhotos();
            } else {
                alert('Ошибка при загрузке новых изображений');
            }
        } catch (e) {
            console.error('Error uploading images', e);
        }
    });

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const productId = document.getElementById('editProductId').value;
        const formData = new FormData();
        formData.append('name', document.getElementById('editNameInput').value);
        formData.append('item_description', document.getElementById('editItemDescriptionInput').value);
        formData.append('price', document.getElementById('editPriceInput').value);

        const sizeCheckboxes = document.querySelectorAll('input[name="edit_sizes"]:checked');
        const sizes = Array.from(sizeCheckboxes).map(checkbox => checkbox.value);
        formData.append('sizes', JSON.stringify(sizes));

        const sizeTablePhoto = document.getElementById('editSizeTablePhotoInput').files[0];
        if (sizeTablePhoto) {
            formData.append('size_table_photo', sizeTablePhoto);
        }

        try {
            const response = await fetch(`/photos/${productId}`, {
                method: 'PUT',
                body: formData
            });

            if (response.ok) {
                editModal.style.display = 'none';
                fetchAndDisplayPhotos();
            } else {
                alert('Ошибка сохранения');
            }
        } catch(err) {
            console.error('Error updating product', err);
        }
    });

    // --- Инициализация ---
    fetchAndDisplayPhotos();
});
