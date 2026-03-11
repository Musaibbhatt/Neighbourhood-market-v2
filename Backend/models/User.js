const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String, // Kept for legacy support, will sync with default address
        required: false,
        trim: true
    },
    addresses: [{
        street: String,
        city: String,
        zip: String,
        label: { type: String, default: 'Home' }, // e.g., 'Home', 'Work'
        isDefault: { type: String, default: 'false' } // Stored as string to match existing pattern or boolean? Let's use boolean
    }],
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    savedForLater: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    loyaltyPoints: {
        type: Number,
        default: 0
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    referralCode: {
        type: String,
        unique: true
    },
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    recentlyViewed: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }]
}, { timestamps: true });

// Hash password and generate referral code before saving
// Mongoose 9: pre-save hooks must use async/await - next() is no longer supported
userSchema.pre('save', async function () {
    if (this.isNew && !this.referralCode) {
        this.referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    }

    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
