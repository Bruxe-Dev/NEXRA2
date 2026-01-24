const API_URI = 'http://localhost:5001/api';
const getToken = () => localStorage.getItem('token');

//=========================Cart Functions====================//

//1.Add To Cart

async function addToCart(productId, quantity = 1) {
    try {
        const token = getToken();

        if (!token) {
            alert('Please login to add to token');
            window.location.href = '/login.html';
            return;
        }
        const response = await fetch(`${API_URI}/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId, quantity })
        });

        const data = await response.json()
        if (data.success) {
            alert('Item added to cart');
            updateCartCount();
        } else {
            alert('Failed to add item to cart');
        }
    } catch (error) {
        console.error('Error adding to cart', error);
        alert('Something went wrong')
    }
}

//Get Cart
async function getCart() {
    try {
        const token = getToken();
        if (!token) {
            return null;
        }
        const response = await fetch(`${API_URI}/cart`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        return data.cart;
    } catch (error) {
        console.error("Error fetching Cart");
        return null;
    }
}

//Updating a cart
async function updateCartCount() {
    const cart = await getCart();
    const cartCount = cart ? cart.items.length : 0;

    const cartBadge = document.querySelector('.cart-badge');
    if (cartBadge) {
        cartBadge.textContent = cartCount
    }
}

//Remove item from Cart
async function removeFromCart(productId) {
    try {
        const token = getToken();

        const response = await fetch(`${API_URI}/cart/remove/:productId`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (data.success) {
            alert('Successfully removed Item');
            updateCartCount();
            dispayCart(); //Refresh the cart display
        }
    } catch (error) {
        console.error('Error removing item:', error);
    }
}

//Update Cart Item Quantity

async function updateCartItemQuantity(productId, quantity) {
    try {
        const token = getToken();

        const response = await fetch(`${API_URI}/cart/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId, quantity })
        });

        const data = await response.json();

        if (data.success) {
            dispayCart();
        }
    } catch (error) {
        console.error("Error updating the cart", error);
    }
}

//====================Checkout Functions======================//

//Proceed to Checkout
async function proceedToCheckout() {
    try {
        const token = getToken();

        if (!token) {
            alert('Please login first');
            window.location.href = '/login.html';
            return;
        }

        // Get shipping address (you can collect this in a form)
        const shippingAddress = {
            street: '123 Main St',
            city: 'Kigali',
            state: 'Kigali',
            zipCode: '00000',
            country: 'Rwanda'
        };

        const response = await fetch(`${API_URL}/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ shippingAddress })
        });

        const data = await response.json();

        if (data.success) {
            // Save order ID and redirect to payment page
            localStorage.setItem('currentOrderId', data.order.orderId);
            window.location.href = '/payment.html';
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error during checkout:', error);
        alert('Checkout failed');
    }
}

//Payment Process

async function processPayment(paymentMethod) {
    try {
        const token = getToken();
        const orderId = localStorage.getItem('currentOrderId');

        if (!orderId) {
            alert('No order found');
            return;
        }

        const response = await fetch(`${API_URL}/checkout/payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ orderId, paymentMethod })
        });

        const data = await response.json();

        if (data.success) {
            alert('Payment successful! Order placed.');
            localStorage.removeItem('currentOrderId');
            window.location.href = '/order-confirmation.html';
        } else {
            alert('Payment failed');
        }
    } catch (error) {
        console.error('Error processing payment:', error);
        alert('Payment failed');
    }
}

//============================Display Function==========================//

// Display Cart Items (for cart page)
async function displayCart() {
    const cart = await getCart();
    const cartContainer = document.getElementById('cart-items-container');

    if (!cartContainer) return;

    if (!cart || cart.items.length === 0) {
        cartContainer.innerHTML = '<p>Your cart is empty</p>';
        return;
    }

    let html = '';
    cart.items.forEach(item => {
        html += `
      <div class="cart-item">
        <img src="${item.product.image}" alt="${item.product.name}">
        <div class="item-details">
          <h5>${item.product.name}</h5>
          <p>Price: ${item.price} RWF</p>
          <input type="number" 
                 value="${item.quantity}" 
                 min="1" 
                 onchange="updateCartQuantity('${item.product._id}', this.value)">
        </div>
        <button onclick="removeFromCart('${item.product._id}')">Remove</button>
      </div>
    `;
    });

    html += `
    <div class="cart-total">
      <h4>Total: ${cart.totalAmount} RWF</h4>
      <button onclick="proceedToCheckout()" class="btn btn-primary">Proceed to Checkout</button>
    </div>
  `;

    cartContainer.innerHTML = html;
}