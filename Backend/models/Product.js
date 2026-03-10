const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g. "500ml", "1L"
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 }
});

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    description: {
        type: String,
        required: true
    },
    basePrice: {
        type: Number,
        required: true
    },
    imageURL: {
        type: String,
        default: ''
    },
    brand: {
        type: String,
        trim: true,
        default: ''
    },
    isOrganic: {
        type: Boolean,
        default: false
    },
    isLocal: {
        type: Boolean,
        default: false
    },
    isGlutenFree: {
        type: Boolean,
        default: false
    },
    isVegan: {
        type: Boolean,
        default: false
    },
    dietaryTags: [String],
    averageRating: {
        type: Number,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    salePrice: {
        type: Number
    },
    saleExpiresAt: {
        type: Date
    },
    variants: [variantSchema]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
