const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');

// @route   GET /api/recipes
// @desc    Get all recipes
router.get('/', async (req, res) => {
    try {
        const recipes = await Recipe.find().sort({ createdAt: -1 });
        res.json(recipes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/recipes/:id
// @desc    Get single recipe
router.get('/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id).populate('ingredients.productId');
        if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
        res.json(recipe);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/recipes
// @desc    Create a recipe (Admin)
router.post('/', async (req, res) => {
    const recipe = new Recipe({
        title: req.body.title,
        description: req.body.description,
        imageURL: req.body.imageURL,
        ingredients: req.body.ingredients,
        instructions: req.body.instructions,
        prepTime: req.body.prepTime,
        servings: req.body.servings
    });

    try {
        const newRecipe = await recipe.save();
        res.status(201).json(newRecipe);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
