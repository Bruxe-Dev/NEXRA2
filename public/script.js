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
                'Authorisation': `Bearer ${token}`
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