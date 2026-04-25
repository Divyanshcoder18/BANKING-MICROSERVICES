const mongoose = require('mongoose');

const tokenblacklistschema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, "token is required to blacklist"],
        unique: [true, "token already blacklisted"]
    },
}, { timestamps: true });

tokenblacklistschema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 20 });

module.exports = mongoose.model("tokenblacklist", tokenblacklistschema);
