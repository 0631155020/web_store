
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
            cartItemsSummaryEl.innerHTML = '<p>Ваша корзина пуста.</p>';
            updateTotals(0);
            return;
        }

        cart.forEach(item => {
            const itemTotal = item.photo.price * item.quantity;
            subtotal += itemTotal;

            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.photo.path}" alt="${item.photo.description || item.photo.filename}">
                <div class="item-details">
                    <p>${item.photo.description || 'Без описания'}</p>
                    <p>Qty: ${item.quantity}</p>
                    <p>$${itemTotal.toFixed(2)}</p>
                </div>
            `;
            cartItemsSummaryEl.appendChild(cartItem);
        });

        updateTotals(subtotal);
    };

    const updateTotals = (subtotal) => {
        const shipping = 0;
        const tax = 0;
        const total = subtotal + shipping + tax;

        subtotalPriceEl.textContent = `$${subtotal.toFixed(2)}`;
        totalPriceEl.textContent = `$${total.toFixed(2)}`;
    };

    const handleOrderSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData(deliveryForm);
        const orderData = {
            email: formData.get('email'),
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            address: formData.get('address'),
            phone: formData.get('phone'),
            deliveryMethod: 'nova-poshta',
            paymentMethod: formData.get('paymentMethod'),
            novaPoshta: {
                city: citySelect.options[citySelect.selectedIndex].text,
                cityRef: formData.get('novaPoshtaCity'),
                warehouse: warehouseSelect.options[warehouseSelect.selectedIndex].text,
                warehouseRef: formData.get('novaPoshtaWarehouse'),
            },
            items: cart.map(item => ({
                photo_id: item.photo.id,
                quantity: item.quantity
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
                data.data.forEach(city => {
                    const option = document.createElement('option');
                    option.value = city.Ref;
                    option.textContent = city.Description;
                    citySelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Ошибка загрузки городов:', error);
        }
    };

    const loadWarehouses = async () => {
        const cityRef = citySelect.value;
        if (!cityRef) return;

        warehouseSelect.innerHTML = '<option value="" disabled selected>Загрузка...</option>';

        try {
            const response = await fetch('/api/novaposhta/warehouses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cityRef })
            });
            const data = await response.json();

            warehouseSelect.innerHTML = '<option value="" disabled selected>Оберіть відділення</option>';
            if (data.success && data.data.length > 0) {
                data.data.forEach(warehouse => {
                    const option = document.createElement('option');
                    option.value = warehouse.Ref;
                    option.textContent = warehouse.Description;
                    warehouseSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Ошибка загрузки отделений:', error);
            warehouseSelect.innerHTML = '<option value="" disabled selected>Помилка завантаження</option>';
        }
    };

    // --- Инициализация ---
    loadCart();
    loadAllCities();
    deliveryForm.addEventListener('submit', handleOrderSubmit);
    citySelect.addEventListener('change', loadWarehouses);
});
