const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'email is required'],
        trim: true,
        unique: true,
        lowercase: true,
    },
    name: {
        type: String,
        required: [true, 'name is required'],
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'password is required'],
        select: false,
    },
    systemUser: {
        type: Boolean,
        default: false,
        immutable: true,
    }
}, { timestamps: true });

// Safe model registration for microservices
const userModel = mongoose.models.UserFresh || mongoose.model("UserFresh", userSchema);
module.exports = userModel;
