const mongoose = require('mongoose')
const { Schema } = mongoose;

const paymentSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },

}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
