const { timeStamp } = require('console');
const { default: mongoose, mongo } = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    price: {
        type: Number,
        required: true
    }
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [cartItemSchema],
    totalAmount: {
        type: Number,
        default: 0
    }
}, {
    timeStamps: true

});

//Calculate the total before saving 

cartSchema.pre('save', async function (next) {
    this.totalAmount = this.items.reduce((total, item) => {
        return total + (item.price * item.quantity)
    }, 0);

    next();
});

module.exports = mongoose.model('Cart', cartSchema);