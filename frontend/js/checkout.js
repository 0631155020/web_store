document.addEventListener('DOMContentLoaded', () => {
    // --- Элементы DOM ---
    const subtotalPriceEl = document.getElementById('subtotal-price');
    const totalPriceEl = document.getElementById('total-price');
    const cartItemsSummaryEl = document.getElementById('cart-items-summary');
    const deliveryForm = document.getElementById('delivery-form');
    const novaPoshtaDetails = document.getElementById('nova-poshta-details');
    const deliveryMethodRadios = document.querySelectorAll('input[name="deliveryMethod"]');
    const novaPoshtaDeliveryTypeRadios = document.querySelectorAll('input[name="novaPoshtaDeliveryType"]');
    const cityInput = document.getElementById('nova-poshta-city-input');
    const citySuggestions = document.getElementById('city-suggestions');
    const warehouseSelect = document.getElementById('nova-poshta-warehouse');
    const courierAddressDiv = document.getElementById('np-courier-address');

    // --- Состояние ---
    let cart = [];
    let selectedCityRef = null;
    let searchTimeout = null;

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
        const shipping = 0; // Бесплатная доставка
        const tax = 0; // Без налога
        const total = subtotal + shipping + tax;

        subtotalPriceEl.textContent = `$${subtotal.toFixed(2)}`;
        totalPriceEl.textContent = `$${total.toFixed(2)}`;
    };

    const handleOrderSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData(deliveryForm);
        const deliveryMethod = formData.get('deliveryMethod');
        const paymentMethod = formData.get('paymentMethod');

        const orderData = {
            email: formData.get('email'),
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            address: formData.get('address'),
            phone: formData.get('phone'),
            deliveryMethod: deliveryMethod,
            paymentMethod: paymentMethod,
            novaPoshta: null,
            items: cart.map(item => ({
                photo_id: item.photo.id,
                quantity: item.quantity
            }))
        };

        if (deliveryMethod === 'nova-poshta') {
            const deliveryType = formData.get('novaPoshtaDeliveryType');
            orderData.novaPoshta = {
                deliveryType: deliveryType,
                city: cityInput.value,
                cityRef: selectedCityRef
            };

            if (deliveryType === 'courier') {
                orderData.novaPoshta.street = formData.get('novaPoshtaStreet');
                orderData.novaPoshta.building = formData.get('novaPoshtaBuilding');
                orderData.novaPoshta.apartment = formData.get('novaPoshtaApartment');
            } else {
                orderData.novaPoshta.warehouse = warehouseSelect.options[warehouseSelect.selectedIndex].text;
                orderData.novaPoshta.warehouseRef = formData.get('novaPoshtaWarehouse');
            }
        }

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

    // --- Инициализация ---
    loadCart();
    deliveryForm.addEventListener('submit', handleOrderSubmit);

    const handleCitySearch = async () => {
        const cityName = cityInput.value.trim();
        if (cityName.length < 2) {
            citySuggestions.innerHTML = '';
            citySuggestions.style.display = 'none';
            return;
        }

        try {
            const response = await fetch('/api/novaposhta/cities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cityName })
            });
            const data = await response.json();

            citySuggestions.innerHTML = '';
            if (data.success && data.data.length > 0) {
                data.data.forEach(city => {
                    const suggestionDiv = document.createElement('div');
                    suggestionDiv.textContent = city.Description;
                    suggestionDiv.dataset.ref = city.Ref;
                    suggestionDiv.addEventListener('click', () => {
                        cityInput.value = city.Description;
                        selectedCityRef = city.Ref;
                        citySuggestions.style.display = 'none';
                        loadWarehouses();
                    });
                    citySuggestions.appendChild(suggestionDiv);
                });
                citySuggestions.style.display = 'block';
            } else {
                citySuggestions.style.display = 'none';
            }
        } catch (error) {
            console.error('Ошибка поиска городов:', error);
        }
    };

    const loadWarehouses = async () => {
        if (!selectedCityRef) return;

        const deliveryType = document.querySelector('input[name="novaPoshtaDeliveryType"]:checked').value;
        let warehouseTypeRef;

        if (deliveryType === 'warehouse') {
            warehouseTypeRef = '841339c7-591a-42e2-8233-7a0a00f0ed6f';
        } else if (deliveryType === 'postomat') {
            warehouseTypeRef = 'f9316480-5f2d-425d-bc2c-ac7cd29decf0';
        } else {
            warehouseSelect.innerHTML = '';
            warehouseSelect.style.display = 'none';
            return;
        }

        try {
            const response = await fetch('/api/novaposhta/warehouses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cityRef: selectedCityRef, typeOfWarehouseRef: warehouseTypeRef })
            });
            const data = await response.json();

            warehouseSelect.innerHTML = '';
            if (data.success && data.data.length > 0) {
                data.data.forEach(warehouse => {
                    const option = document.createElement('option');
                    option.value = warehouse.Ref;
                    option.textContent = warehouse.Description;
                    warehouseSelect.appendChild(option);
                });
                warehouseSelect.style.display = 'block';
            } else {
                warehouseSelect.style.display = 'none';
            }
        } catch (error) {
            console.error('Ошибка загрузки отделений:', error);
        }
    };

    // --- Обработчики событий ---
    deliveryMethodRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            novaPoshtaDetails.style.display = radio.value === 'nova-poshta' ? 'block' : 'none';
        });
    });

    novaPoshtaDeliveryTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const isCourier = radio.value === 'courier';
            courierAddressDiv.style.display = isCourier ? 'block' : 'none';

            if (isCourier) {
                warehouseSelect.style.display = 'none';
            } else {
                loadWarehouses();
            }
        });
    });

    cityInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(handleCitySearch, 300); // Задержка для уменьшения кол-ва запросов
    });

    document.addEventListener('click', (e) => {
        if (!citySuggestions.contains(e.target) && e.target !== cityInput) {
            citySuggestions.style.display = 'none';
        }
    });
});
