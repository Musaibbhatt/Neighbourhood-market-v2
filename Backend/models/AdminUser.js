const mongoose = require('mongoose');

const adminUserSchema = new mongoose.Schema({
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
    role: {
        type: String,
        enum: ['SuperAdmin', 'Manager', 'Staff'],
        default: 'Staff'
    }
}, { timestamps: true });

module.exports = mongoose.model('AdminUser', adminUserSchema);
