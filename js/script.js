document.addEventListener('DOMContentLoaded', () => {
    const productsContainer = document.getElementById('products');
    const cartButton = document.getElementById('cart-button');
    const cartModal = document.getElementById('cart-modal');
    const closeButton = document.querySelector('.close-button');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');

    let cart = [];

    // Fetch products and display them
    fetch('products.json')
        .then(response => response.json())
        .then(products => {
            products.forEach(product => {
                const productElement = document.createElement('div');
                productElement.className = 'product';
                productElement.innerHTML = `
                    <img src="${product.image}" alt="${product.name}">
                    <h2>${product.name}</h2>
                    <p>$${product.price}</p>
                    <button data-id="${product.id}">Add to Cart</button>
                `;
                productsContainer.appendChild(productElement);

                // Add to cart event listener
                productElement.querySelector('button').addEventListener('click', (e) => {
                    addToCart(products, parseInt(e.target.dataset.id));
                });
            });
        })
        .catch(error => console.error('Error fetching products:', error));

    // Show/hide cart modal
    cartButton.addEventListener('click', () => {
        cartModal.style.display = 'block';
    });

    closeButton.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });

    function addToCart(products, productId) {
        const product = products.find(p => p.id === productId);
        cart.push(product);
        updateCart();
    }

    function updateCart() {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.innerHTML = `<p>${item.name} - $${item.price}</p>`;
            cartItemsContainer.appendChild(cartItem);
            total += item.price;
        });
        cartCount.textContent = cart.length;
        cartTotal.textContent = total;
    }
});
