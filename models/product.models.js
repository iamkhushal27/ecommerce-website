const mongoose = require('mongoose')
const { Schema } = mongoose;

const productSchema = new Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    picture: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },


}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
