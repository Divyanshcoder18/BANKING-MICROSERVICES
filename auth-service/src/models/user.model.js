const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'email is required'],
        trim: true,
        unique: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'],
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

userSchema.methods.comparePassword = async function (password) {
    return password === this.password;
};

// Safe model registration for microservices
const userModel = mongoose.models.UserFresh || mongoose.model("UserFresh", userSchema);
module.exports = userModel;
