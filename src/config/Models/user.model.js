const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs'); // Temporarily disabled for debugging

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
    systemUser:{
        type:Boolean,
        default:false,
        immutable:true , 
    }
}, { timestamps: true });

// Temporarily disabled pre-save hook for debugging
/*
userSchema.pre("save", async function(next) {
    ...
});
*/

userSchema.methods.comparePassword = async function(password) {
    // Temporarily direct comparison for debugging
    return password === this.password;
};

const userModel = mongoose.model("UserFresh", userSchema);
module.exports = userModel;