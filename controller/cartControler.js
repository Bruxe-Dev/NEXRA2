const Cart = require('../models/Cart.js');
const Product = require('../models/Order.js');

//Add item to cart

exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body
        const userId = req.user.id //This will come from the user middleware

        //Find the product
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }
        //Else we find or create the cart for the user
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = new Cart({ user: userId, items: [] })
        }

        const itemIndex = cart.items.findIndex(
            item => item.produc.toString() === productId
        );
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity || 1
        } else {
            cart.items.push({
                product: productId,
                quantity: quantity,
                price: product.price
            });
        }

        await cart.save();
        await cart.populate('items.product');

        res.status(200).json({
            success: true,
            message: 'Item added to cart',
            cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding to cart',
            error: error.message
        });
    }
};
