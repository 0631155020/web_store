
document.addEventListener('DOMContentLoaded', () => {
    // --- Элементы DOM ---
    const subtotalPriceEl = document.getElementById('subtotal-price');
    const totalPriceEl = document.getElementById('total-price');
    const cartItemsSummaryEl = document.getElementById('cart-items-summary');
    const deliveryForm = document.getElementById('delivery-form');
    const citySelect = document.getElementById('nova-poshta-city');
    const warehouseSelect = document.getElementById('nova-poshta-warehouse');

    // --- Состояние ---
    let cart = [];

    // --- Функции ---
    const loadCart = () => {
        const cartData = localStorage.getItem('cart');
        cart = cartData ? JSON.parse(cartData) : [];
        renderCartSummary();
    };

    const saveCart = () => {
        localStorage.setItem('cart', JSON.stringify(cart));
    };

    const renderCartSummary = () => {
        cartItemsSummaryEl.innerHTML = '';
        let subtotal = 0;

        if (cart.length === 0) {
            cartItemsSummaryEl.innerHTML = '<p data-i18n-key="cartEmpty">Ваша корзина пуста.</p>';
            updateTotals(0);
            if (typeof window.applyTranslations === 'function') {
                window.applyTranslations();
            }
            return;
        }

        cart.forEach(item => {
            const itemTotal = parseFloat(item.photo.price) * item.quantity;
            subtotal += itemTotal;

            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';

            const descriptionHtml = item.photo.description
                ? item.photo.description
                : `<span data-i18n-key="noDescription">Без описания</span>`;

            cartItem.innerHTML = `
                <img src="${item.photo.path}" alt="${item.photo.description || item.photo.filename}">
                <div class="item-details">
                    <p>${item.photo.name || 'Без описания'}${item.size ? ` (${item.size})` : ''}</p>
                    <p>Qty: ${item.quantity}</p>
                    <p>${itemTotal.toFixed(2)} UAH</p>
                </div>
            `;
            cartItemsSummaryEl.appendChild(cartItem);
        });

        updateTotals(subtotal);
        if (typeof window.applyTranslations === 'function') {
            window.applyTranslations();
        }
    };

    const updateTotals = (subtotal) => {
        const shipping = 0;
        const tax = 0;
        const total = subtotal + shipping + tax;

        subtotalPriceEl.textContent = `${subtotal.toFixed(2)} UAH`;
        totalPriceEl.textContent = `${total.toFixed(2)} UAH`;
    };

    const handleOrderSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData(deliveryForm);
        const orderData = {
            //email: formData.get('email'),
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            phone: formData.get('phone'),
            deliveryMethod: 'nova-poshta',
            paymentMethod: formData.get('paymentMethod'),
            messenger: formData.get('messenger'),
            novaPoshta: {
                city: $(citySelect).select2('data')[0].text,
                cityRef: formData.get('novaPoshtaCity'),
                warehouse: $(warehouseSelect).select2('data')[0] ? $(warehouseSelect).select2('data')[0].text : '',
                warehouseRef: formData.get('novaPoshtaWarehouse'),
            },
            items: cart.map(item => ({
                photo_id: item.photo.id,
                quantity: item.quantity,
                size: item.size
            }))
        };

        try {
            const response = await fetch('/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });

            if (response.ok) {
                alert('Заказ успешно оформлен!');
                cart = [];
                saveCart();
                window.location.href = '/';
            } else {
                const errorData = await response.json();
                alert(`Ошибка при оформлении заказа: ${errorData.detail}`);
            }
        } catch (error) {
            console.error('Ошибка при отправке заказа:', error);
            alert('Произошла ошибка. Пожалуйста, попробуйте еще раз.');
        }
    };

    const loadAllCities = async () => {
        try {
            const response = await fetch('/api/novaposhta/all-cities');
            const data = await response.json();
            if (data.success && data.data.length > 0) {
                const cities = data.data.map(city => ({
                    id: city.Ref,
                    text: city.Description
                }));

                $(citySelect).select2({
                    data: cities,
                    placeholder: 'Оберіть місто',
                    allowClear: true
                }).on('select2:select', function (e) {
                    // Cброс и загрузка отделений при выборе города
                    if ($(warehouseSelect).data('select2')) {
                        $(warehouseSelect).select2('destroy');
                    }
                    warehouseSelect.innerHTML = '<option value="" disabled selected>Спочатку оберіть місто</option>';
                    loadWarehouses();
                });
            }
        } catch (error) {
            console.error('Ошибка загрузки городов:', error);
        }
    };

    const loadWarehouses = async () => {
        const cityRef = citySelect.value;
        if (!cityRef) return;

        if ($(warehouseSelect).data('select2')) {
            $(warehouseSelect).select2('destroy');
        }
        $(warehouseSelect).html('').select2({
            placeholder: 'Загрузка...'
        });

        try {
            const response = await fetch('/api/novaposhta/warehouses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cityRef: citySelect.value })
            });
            const data = await response.json();

            $(warehouseSelect).html('');

            if (data.success && data.data.length > 0) {
                const warehouses = data.data.map(warehouse => ({
                    id: warehouse.Ref,
                    text: warehouse.Description
                }));
                $(warehouseSelect).select2({
                    data: warehouses,
                    placeholder: 'Оберіть відділення',
                    allowClear: true
                });
            } else {
                $(warehouseSelect).select2({
                    placeholder: 'Відділення не знайдено',
                    allowClear: true
                });
            }
        } catch (error) {
            console.error('Ошибка загрузки отделений:', error);
            if ($(warehouseSelect).data('select2')) {
                $(warehouseSelect).select2('destroy');
            }
            $(warehouseSelect).html('').select2({
                placeholder: 'Помилка завантаження',
                allowClear: true
            });
        }
    };

    // --- Инициализация ---
    loadCart();
    loadAllCities();
    deliveryForm.addEventListener('submit', handleOrderSubmit);
});
