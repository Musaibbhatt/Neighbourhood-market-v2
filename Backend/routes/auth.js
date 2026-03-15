const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const AdminUser = require('../models/AdminUser');
const User = require('../models/User');


// ==============================
// ADMIN LOGIN
// ==============================
// POST /api/admin/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await AdminUser.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1d' },
            (err, token) => {
                if (err) throw err;

                res.json({
                    token,
                    role: user.role
                });
            }
        );

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});


// ==============================
// USER SIGNUP
// ==============================
// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    try {

        const { name, email, password, mobile, address } = req.body;

        if (!name || !email || !password || !mobile) {
            return res.status(400).json({
                message: "Name, email, password and mobile are required"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const newUser = new User({
            name,
            email,
            password,
            mobile,
            address
        });

        await newUser.save();

        res.status(201).json({
            message: "User registered successfully"
        });

    } catch (err) {

        console.error("Signup error:", err);

        res.status(500).json({
            message: err.message
        });

    }
});


// ==============================
// ADMIN SEED (DEV ONLY)
// ==============================
// POST /api/admin/seed
router.post('/seed', async (req, res) => {
    try {

        const count = await AdminUser.countDocuments();

        if (count === 0) {

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);

            const admin = new AdminUser({
                email: 'admin@neighbourhoodmarket.com',
                password: hashedPassword,
                role: 'SuperAdmin'
            });

            await admin.save();

            return res.json({
                message: 'Admin user seeded',
                email: 'admin@neighbourhoodmarket.com',
                password: 'admin123'
            });

        }

        res.status(400).json({
            message: 'Admin user already exists'
        });

    } catch (err) {

        console.error("Seed error:", err);

        res.status(500).json({
            message: 'Server Error'
        });

    }
});

module.exports = router;