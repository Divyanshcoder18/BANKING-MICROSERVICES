require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./src/app.js');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/banking-system')
    .then(() => {
        console.log("✅ Auth Service Database Connected");

        const PORT = process.env.PORT || 5002;
        app.listen(PORT, () => {
            console.log(`🚀 Auth Service is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ Auth Service Initialization Error:", err);
    });
