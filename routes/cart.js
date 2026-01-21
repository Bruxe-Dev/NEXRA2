const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const auth = require('../middleware/auth'); // Your auth middleware

// Cart routes
router.post('/add', auth, cartController.addToCart);
router.get('/', auth, cartController.getCart);
router.put('/update', auth, cartController.updateCartItem);
router.delete('/remove/:productId', auth, cartController.removeFromCart);
router.delete('/clear', auth, cartController.clearCart);

module.exports = router;