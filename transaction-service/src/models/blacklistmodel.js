const mongoose = require('mongoose');

const tokenblacklistschema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, "token is required to blacklist"],
        unique: [true, "token already blacklisted"]
    },
}, { timestamps: true });

tokenblacklistschema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 20 });

// Safe model registration for microservices
const tokenblacklistmodel = mongoose.models.tokenblacklist || mongoose.model("tokenblacklist", tokenblacklistschema);
module.exports = tokenblacklistmodel;
