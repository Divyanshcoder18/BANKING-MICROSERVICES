const mongoose  = require('mongoose');
const connecttodb = () => {
    mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("connected to db"); 

    })
    .catch((error) => {
        console.log("Error checking to DB:", error);
        process.exit(1); 
    })
}

module.exports = connecttodb; 