const mongoose = require('mongoose')
const { Schema } = mongoose;


const categorySchema = new Schema({
    name: { type: String, required: true, unique: true },
    products: [
        {
            type: Schema.Types.ObjectId, ref: 'Product',

        }
    ]

}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
