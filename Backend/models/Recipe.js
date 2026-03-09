const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    ingredients: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        name: String,
        amount: String
    }],
    instructions: [String],
    imageUrl: String
}, { timestamps: true });

module.exports = mongoose.model('Recipe', recipeSchema);
