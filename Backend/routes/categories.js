const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/categories
// @desc    Create a category
// @access  Private (SuperAdmin, Manager)
router.post('/', authMiddleware, roleMiddleware('SuperAdmin', 'Manager'), async (req, res) => {
    try {
        const { name, description } = req.body;

        let category = await Category.findOne({ name });
        if (category) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        category = new Category({ name, description });
        await category.save();
        res.status(201).json(category);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/categories/:id
// @desc    Update a category
// @access  Private (SuperAdmin, Manager)
router.put('/:id', authMiddleware, roleMiddleware('SuperAdmin', 'Manager'), async (req, res) => {
    try {
        const { name, description } = req.body;
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        if (name) category.name = name;
        if (description !== undefined) category.description = description;

        await category.save();
        res.json(category);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Private (SuperAdmin)
router.delete('/:id', authMiddleware, roleMiddleware('SuperAdmin'), async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Check if there are products in this category
        const Product = require('../models/Product');
        const productCount = await Product.countDocuments({ category: req.params.id });
        if (productCount > 0) {
            return res.status(400).json({ message: 'Cannot delete category with active products' });
        }

        await category.deleteOne();
        res.json({ message: 'Category removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;
