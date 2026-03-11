const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const isDbConnected = () => mongoose.connection.readyState === 1;

// ==============================
// CUSTOMER LOGIN
// ==============================
// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        if (!isDbConnected()) {
            // Fallback login for local dev when MongoDB is unavailable
            const payload = {
                user: {
                    id: 'mock-user',
                    role: 'user'
                }
            };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
            return res.json({
                token,
                user: {
                    name: 'Demo User',
                    email,
                    address: '',
                    mobile: '',
                    role: 'user'
                }
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        let user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            user: {
                name: user.name,
                email: user.email,
                address: user.address,
                mobile: user.mobile,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Customer login error:', err);
        res.status(500).json({ message: err.message || 'Server Error' });
    }
});

module.exports = router;

