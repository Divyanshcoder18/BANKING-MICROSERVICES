const app = require('./src/app');
const connecttodb = require('./src/config/db.js');
const dotenv = require('dotenv');

dotenv.config();

connecttodb();

app.listen(3000, () => {
    console.log("server is running on port 3000"); 
});
