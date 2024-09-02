const mongoose = require('mongoose')
const { Schema } = mongoose;

const cartSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
        {
            productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true }

        },

    ],
    isFinilize: { type: Boolean, default: false }

}, { timestamps: true });

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
