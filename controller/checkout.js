const Cart = require('../models/Cart');
const Order = require('../models/Order');

// Create order from cart
exports.checkout = async (req, res) => {
    try {
        const userId = req.user.id;
        const { shippingAddress } = req.body;

        // Get user's cart
        const cart = await Cart.findOne({ user: userId }).populate('items.product');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }

        // Create order from cart
        const order = new Order({
            user: userId,
            items: cart.items.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.price
            })),
            totalAmount: cart.totalAmount,
            paymentMethod: 'pending', // Will be updated after payment
            shippingAddress: shippingAddress || {}
        });

        await order.save();

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order: {
                orderId: order._id,
                totalAmount: order.totalAmount,
                items: cart.items
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating order',
            error: error.message
        });
    }
};

// Process payment (simulated)
exports.processPayment = async (req, res) => {
    try {
        const { orderId, paymentMethod } = req.body;
        const userId = req.user.id;

        // Validate payment method
        const validMethods = ['credit_card', 'paypal', 'mobile_money', 'bank_transfer'];
        if (!validMethods.includes(paymentMethod)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment method'
            });
        }

        // Find order
        const order = await Order.findOne({ _id: orderId, user: userId });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Update order with payment info
        order.paymentMethod = paymentMethod;
        order.paymentStatus = 'completed'; // Simulated success
        order.orderStatus = 'processing';
        await order.save();

        // Clear user's cart after successful payment
        await Cart.findOneAndUpdate(
            { user: userId },
            { items: [], totalAmount: 0 }
        );

        res.status(200).json({
            success: true,
            message: 'Payment processed successfully',
            order: {
                orderId: order._id,
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
                totalAmount: order.totalAmount
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error processing payment',
            error: error.message
        });
    }
};

// Get order details
exports.getOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        const order = await Order.findOne({ _id: orderId, user: userId })
            .populate('items.product');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching order',
            error: error.message
        });
    }
};

// Get user's order history
exports.getOrderHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        const orders = await Order.find({ user: userId })
            .populate('items.product')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
};