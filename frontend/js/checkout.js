document.addEventListener('DOMContentLoaded', () => {
    // --- Элементы DOM ---
    const subtotalPriceEl = document.getElementById('subtotal-price');
    const totalPriceEl = document.getElementById('total-price');
    const cartItemsSummaryEl = document.getElementById('cart-items-summary');
    const deliveryForm = document.getElementById('delivery-form');
    const novaPoshtaDetails = document.getElementById('nova-poshta-details');
    const deliveryMethodRadios = document.querySelectorAll('input[name="deliveryMethod"]');

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
            orderData.novaPoshta = {
                city: formData.get('novaPoshtaCity'),
                warehouse: formData.get('novaPoshtaWarehouse')
            };
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

    deliveryMethodRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'nova-poshta') {
                novaPoshtaDetails.style.display = 'block';
            } else {
                novaPoshtaDetails.style.display = 'none';
            }
        });
    });
});
