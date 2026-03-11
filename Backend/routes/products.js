const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const MOCK_CATEGORIES = [
  { _id: 'cat1', name: 'Fruits' },
  { _id: 'cat2', name: 'Vegetables' },
  { _id: 'cat3', name: 'Bakery' },
];

const MOCK_PRODUCTS = [
  {
    _id: 'prod1',
    name: 'Organic Apples',
    brand: 'FreshFarm',
    category: { _id: 'cat1', name: 'Fruits' },
    basePrice: 3.99,
    salePrice: 2.99,
    imageURL: '/placeholder.svg',
    stock: 12,
    averageRating: 4.5,
    numReviews: 12,
    description: 'Crisp organic apples from local farms.',
    unit: 'lb',
  },
  {
    _id: 'prod2',
    name: 'Whole Wheat Bread',
    brand: 'BakeHouse',
    category: { _id: 'cat3', name: 'Bakery' },
    basePrice: 4.5,
    salePrice: 3.99,
    imageURL: '/placeholder.svg',
    stock: 8,
    averageRating: 4.8,
    numReviews: 34,
    description: 'Fresh baked whole wheat loaf.',
    unit: 'loaf',
  },
  {
    _id: 'prod3',
    name: 'Baby Spinach',
    brand: 'GreenLeaf',
    category: { _id: 'cat2', name: 'Vegetables' },
    basePrice: 2.99,
    salePrice: 2.49,
    imageURL: '/placeholder.svg',
    stock: 15,
    averageRating: 4.2,
    numReviews: 19,
    description: 'Fresh baby spinach for salads or smoothies.',
    unit: 'bag',
  },
];

const isDbConnected = () => mongoose.connection.readyState === 1;

// @route   GET /api/products
// @desc    Get all products (with optional search & category filter)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const {
            search, category, brand, isOrganic, isGlutenFree, isVegan, isLocal,
            tags, limit, minPrice, maxPrice, page = 1, sort
        } = req.query;

        // If MongoDB is not connected, fall back to mock data for the shop.
        if (!isDbConnected()) {
            const itemsPerPage = limit ? parseInt(limit) : 12;
            const currentPage = parseInt(page);
            const start = (currentPage - 1) * itemsPerPage;
            const paged = MOCK_PRODUCTS.slice(start, start + itemsPerPage);
            return res.json({
                products: paged,
                total: MOCK_PRODUCTS.length,
                page: currentPage,
                pages: Math.ceil(MOCK_PRODUCTS.length / itemsPerPage)
            });
        }

        let query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
                { dietaryTags: { $regex: search, $options: 'i' } }
            ];
        }
        if (category) {
            query.category = category;
        }
        if (brand) {
            query.brand = brand;
        }
        if (isOrganic === 'true') {
            query.isOrganic = true;
        }
        if (isGlutenFree === 'true') {
            query.isGlutenFree = true;
        }
        if (isVegan === 'true') {
            query.isVegan = true;
        }
        if (isLocal === 'true') {
            query.isLocal = true;
        }
        if (tags) {
            query.dietaryTags = { $in: tags.split(',') };
        }

        if (minPrice || maxPrice) {
            query.basePrice = {};
            if (minPrice) query.basePrice.$gte = parseFloat(minPrice);
            if (maxPrice) query.basePrice.$lte = parseFloat(maxPrice);
        }

        let sortOption = { createdAt: -1 };
        if (sort) {
            switch (sort) {
                case 'price-low': sortOption = { basePrice: 1 }; break;
                case 'price-high': sortOption = { basePrice: -1 }; break;
                case 'rating': sortOption = { averageRating: -1 }; break;
                case 'name': sortOption = { name: 1 }; break;
            }
        }

        const itemsPerPage = limit ? parseInt(limit) : 12;
        const skip = (parseInt(page) - 1) * itemsPerPage;

        const products = await Product.find(query)
            .populate('category', 'name')
            .sort(sortOption)
            .skip(skip)
            .limit(itemsPerPage);

        const total = await Product.countDocuments(query);

        res.json({
            products,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / itemsPerPage)
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

const StockNotification = require('../models/StockNotification');

// @route   POST /api/products/:id/stock-notify
// @desc    Request stock notification
// @access  Private
router.post('/:id/stock-notify', authMiddleware, async (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.user.id;
        const userEmail = (await require('../models/User').findById(userId)).email;

        // Check if already exists
        const existing = await StockNotification.findOne({ product: productId, user: userId, status: 'Pending' });
        if (existing) {
            return res.status(400).json({ message: 'You are already signed up for notifications for this product.' });
        }

        const notification = new StockNotification({
            product: productId,
            user: userId,
            email: userEmail
        });

        await notification.save();
        res.json({ message: 'We will notify you when this item is back in stock!' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/products/brands
// @desc    Get all unique brands
// @access  Public
router.get('/brands', async (req, res) => {
    try {
        if (!isDbConnected()) {
            const brands = Array.from(new Set(MOCK_PRODUCTS.map(p => p.brand))).filter(Boolean);
            return res.json(brands);
        }

        const brands = await Product.distinct('brand', { brand: { $ne: '' } });
        res.json(brands);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/products/:id/related
// @desc    Get related products (same category)
// @access  Public
router.get('/:id/related', async (req, res) => {
    try {
        if (!isDbConnected()) {
            const product = MOCK_PRODUCTS.find(p => p._id === req.params.id);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            const related = MOCK_PRODUCTS.filter(p => p.category._id === product.category._id && p._id !== product._id).slice(0, 4);
            return res.json(related);
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const related = await Product.find({
            category: product.category,
            _id: { $ne: product._id },
            stock: { $gt: 0 }
        })
            .limit(4)
            .populate('category', 'name');

        res.json(related);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        if (!isDbConnected()) {
            const product = MOCK_PRODUCTS.find(p => p._id === req.params.id);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            return res.json(product);
        }

        const product = await Product.findById(req.params.id).populate('category', 'name');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/products
// @desc    Create a product
// @access  Private (SuperAdmin, Manager)
router.post('/', authMiddleware, roleMiddleware('SuperAdmin', 'Manager'), async (req, res) => {
    try {
        const {
            name, category, description, basePrice, imageURL, stock, variants,
            brand, isOrganic, isGlutenFree, isVegan, dietaryTags,
            salePrice, saleExpiresAt // Added Flash Sale fields
        } = req.body;

        // Validation: category is required and must be a valid ObjectId
        if (!category || !mongoose.Types.ObjectId.isValid(category)) {
            return res.status(400).json({ message: 'Please select a valid category' });
        }
        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Product name is required' });
        }
        if (!description || !description.trim()) {
            return res.status(400).json({ message: 'Product description is required' });
        }
        if (basePrice === undefined || basePrice === null || isNaN(parseFloat(basePrice)) || parseFloat(basePrice) < 0) {
            return res.status(400).json({ message: 'Valid base price is required' });
        }
        if (stock === undefined || stock === null || isNaN(parseInt(stock)) || parseInt(stock) < 0) {
            return res.status(400).json({ message: 'Valid stock quantity is required' });
        }

        const newProduct = new Product({
            name: name.trim(),
            category,
            description: description.trim(),
            basePrice: parseFloat(basePrice),
            imageURL: imageURL || '',
            stock: parseInt(stock),
            variants: variants || [],
            brand: brand || '',
            isOrganic: isOrganic === true || isOrganic === 'true',
            isGlutenFree: isGlutenFree === true || isGlutenFree === 'true',
            isVegan: isVegan === true || isVegan === 'true',
            dietaryTags: dietaryTags || [],
            salePrice: salePrice ? parseFloat(salePrice) : undefined,
            saleExpiresAt: saleExpiresAt ? new Date(saleExpiresAt) : undefined
        });

        const product = await newProduct.save();
        res.status(201).json(product);
    } catch (err) {
        console.error('Product create error:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: err.message || 'Server Error' });
    }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private (SuperAdmin, Manager)
router.put('/:id', authMiddleware, roleMiddleware('SuperAdmin', 'Manager'), async (req, res) => {
    try {
        const {
            name, category, description, basePrice, imageURL, stock, variants,
            brand, isOrganic, isGlutenFree, isVegan, dietaryTags,
            salePrice, saleExpiresAt // Added Flash Sale fields
        } = req.body;

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: 'Product not found' });
        }

        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Validation: if category is provided, it must be valid
        if (category !== undefined && category !== null && category !== '' && !mongoose.Types.ObjectId.isValid(category)) {
            return res.status(400).json({ message: 'Please select a valid category' });
        }

        // Update fields
        if (name !== undefined) product.name = name.trim();
        if (category && mongoose.Types.ObjectId.isValid(category)) product.category = category;
        if (description !== undefined) product.description = description;
        if (basePrice !== undefined && !isNaN(parseFloat(basePrice))) product.basePrice = parseFloat(basePrice);
        if (imageURL !== undefined) product.imageURL = imageURL;
        if (stock !== undefined && !isNaN(parseInt(stock))) product.stock = parseInt(stock);
        if (variants) product.variants = variants;
        if (brand !== undefined) product.brand = brand;
        if (isOrganic !== undefined) product.isOrganic = isOrganic === true || isOrganic === 'true';
        if (isGlutenFree !== undefined) product.isGlutenFree = isGlutenFree === true || isGlutenFree === 'true';
        if (isVegan !== undefined) product.isVegan = isVegan === true || isVegan === 'true';
        if (dietaryTags !== undefined) product.dietaryTags = dietaryTags;

        // Flash Sale updates
        if (salePrice !== undefined) product.salePrice = salePrice ? parseFloat(salePrice) : null;
        if (saleExpiresAt !== undefined) product.saleExpiresAt = saleExpiresAt ? new Date(saleExpiresAt) : null;

        await product.save();
        res.json(product);
    } catch (err) {
        console.error('Product update error:', err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: err.message || 'Server Error' });
    }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private (SuperAdmin)
router.delete('/:id', authMiddleware, roleMiddleware('SuperAdmin'), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(500).send('Server Error');
    }
});

const Review = require('../models/Review');

// @route   POST /api/products/:id/reviews
// @desc    Add a product review
// @access  Private
router.post('/:id/reviews', authMiddleware, async (req, res) => {
    try {
        const { rating, comment, imageUrl } = req.body;
        const productId = req.params.id;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const alreadyReviewed = await Review.findOne({ product: productId, user: req.user.id });
        if (alreadyReviewed) {
            return res.status(400).json({ message: 'Product already reviewed' });
        }

        const review = new Review({
            product: productId,
            user: req.user.id,
            rating: Number(rating),
            comment,
            imageUrl
        });

        await review.save();

        // Update product rating
        const reviews = await Review.find({ product: productId });
        product.numReviews = reviews.length;
        product.averageRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

        await product.save();
        res.status(201).json({ message: 'Review added' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/products/:id/reviews
// @desc    Get product reviews
// @access  Public
router.get('/:id/reviews', async (req, res) => {
    try {
        if (!isDbConnected()) {
            return res.json([]);
        }
        const reviews = await Review.find({ product: req.params.id })
            .populate('user', 'name')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/products/bulk-stock
// @desc    Bulk update stock levels (Admin)
// @access  Private (SuperAdmin, Manager)
router.post('/bulk-stock', authMiddleware, roleMiddleware('SuperAdmin', 'Manager'), async (req, res) => {
    try {
        const { updates } = req.body; // Array of { id, stock }

        if (!Array.isArray(updates)) {
            return res.status(400).json({ message: 'Updates must be an array' });
        }

        const bulkOps = updates.map(update => ({
            updateOne: {
                filter: { _id: update.id },
                update: { $set: { stock: update.stock } }
            }
        }));

        await Product.bulkWrite(bulkOps);

        res.json({ message: 'Bulk stock update successful' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
