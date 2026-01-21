const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const auth = require('../middleware/auth'); // Your auth middleware

// Checkout routes
router.post('/', auth, checkoutController.checkout);
router.post('/payment', auth, checkoutController.processPayment);
router.get('/order/:orderId', auth, checkoutController.getOrder);
router.get('/orders', auth, checkoutController.getOrderHistory);

module.exports = router;