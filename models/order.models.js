const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    cart: { type: Schema.Types.ObjectId, ref: 'Cart', required: true }, // Reference to Cart
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Shipped', 'Delivered'], default: 'Pending' },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
