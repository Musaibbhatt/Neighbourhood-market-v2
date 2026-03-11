const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @route   POST /api/users/signup
// @desc    Register a new customer
router.post('/signup', async (req, res) => {
    const { name, email, password, mobile, address } = req.body;

    try {
        // Validation
        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Name is required' });
        }
        if (!email || !email.trim()) {
            return res.status(400).json({ message: 'Email is required' });
        }
        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }
        if (!mobile || !mobile.trim()) {
            return res.status(400).json({ message: 'Mobile number is required' });
        }

        let user = await User.findOne({ email: email.toLowerCase().trim() });
        if (user) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        user = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password,
            mobile: mobile.trim(),
            address: address ? address.trim() : ''
        });
        await user.save();

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { name: user.name, email: user.email } });
    } catch (err) {
        console.error('Signup error:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        if (err.code === 11000) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }
        res.status(500).json({ message: err.message || 'Server Error' });
    }
});

// @route   POST /api/users/login
// @desc    Authenticate customer & get token
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        let user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { name: user.name, email: user.email, address: user.address, mobile: user.mobile } });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: err.message || 'Server Error' });
    }
});

const authMiddleware = require('../middleware/authMiddleware');

// ... existing code ...

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password').populate('recentlyViewed');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authMiddleware, async (req, res) => {
    const { name, mobile, address } = req.body;
    try {
        let user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.name = name;
        if (mobile) user.mobile = mobile;
        if (address) user.address = address;

        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/users/wishlist/toggle/:productId
// @desc    Toggle product in wishlist
// @access  Private
router.post('/wishlist/toggle/:productId', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const productId = req.params.productId;

        const index = user.wishlist.indexOf(productId);
        if (index > -1) {
            user.wishlist.splice(index, 1);
        } else {
            user.wishlist.push(productId);
        }

        await user.save();
        res.json(user.wishlist);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/users/wishlist
// @desc    Get user wishlist with product details
// @access  Private
router.get('/wishlist', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('wishlist');
        res.json(user.wishlist);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/users/addresses
// @desc    Add new address
// @access  Private
router.post('/addresses', authMiddleware, async (req, res) => {
    const { street, city, zip, label, isDefault } = req.body;
    try {
        const user = await User.findById(req.user.id);

        if (isDefault) {
            user.addresses.forEach(addr => addr.isDefault = 'false');
            user.address = `${street}, ${city}, ${zip}`; // Sync legacy address
        }

        user.addresses.push({ street, city, zip, label, isDefault: isDefault ? 'true' : 'false' });

        // If it's the first address, make it default
        if (user.addresses.length === 1) {
            user.addresses[0].isDefault = 'true';
            user.address = `${street}, ${city}, ${zip}`;
        }

        await user.save();
        res.json(user.addresses);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/users/addresses/:addressId
// @desc    Remove an address
// @access  Private
router.delete('/addresses/:addressId', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.addressId);
        await user.save();
        res.json(user.addresses);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/users/addresses/:addressId/default
// @desc    Set address as default
// @access  Private
router.put('/addresses/:addressId/default', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.addresses.forEach(addr => {
            if (addr._id.toString() === req.params.addressId) {
                addr.isDefault = 'true';
                user.address = `${addr.street}, ${addr.city}, ${addr.zip}`; // Sync legacy address
            } else {
                addr.isDefault = 'false';
            }
        });
        await user.save();
        res.json(user.addresses);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/users/referral/claim
// @desc    Claim a referral code
// @access  Private
router.post('/referral/claim', authMiddleware, async (req, res) => {
    const { code } = req.body;
    try {
        if (!code) return res.status(400).json({ message: 'Referral code is required' });

        const user = await User.findById(req.user.id);
        if (user.referredBy) {
            return res.status(400).json({ message: 'Referral already claimed' });
        }

        const referrer = await User.findOne({ referralCode: code.toUpperCase() });
        if (!referrer) {
            return res.status(404).json({ message: 'Invalid referral code' });
        }

        if (referrer._id.toString() === user._id.toString()) {
            return res.status(400).json({ message: 'You cannot refer yourself' });
        }

        user.referredBy = referrer._id;
        // Award points to referrer (e.g. 50 points)
        referrer.loyaltyPoints += 50;

        await user.save();
        await referrer.save();

        res.json({ message: 'Referral claimed successfully! Referrer awarded 50 points.', referredBy: referrer.name });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/users/recently-viewed
// @desc    Add product to recently viewed
// @access  Private
router.post('/recently-viewed', authMiddleware, async (req, res) => {
    const { productId } = req.body;
    try {
        const user = await User.findById(req.user.id);

        // Remove if already exists to move to front
        user.recentlyViewed = user.recentlyViewed.filter(id => id.toString() !== productId);

        // Add to beginning
        user.recentlyViewed.unshift(productId);

        // Limit to 10
        if (user.recentlyViewed.length > 10) {
            user.recentlyViewed.pop();
        }

        await user.save();
        res.json(user.recentlyViewed);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/users/recently-viewed
// @desc    Get recently viewed products
// @access  Private
router.get('/recently-viewed', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('recentlyViewed');
        res.json(user.recentlyViewed);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
