const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../', '.env') });

const dbUrl = process.env.MONGO_URL;

console.log(dbUrl);

module.exports = async () => {

    await mongoose.connect(dbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });


    process.on('SIGINT', () => {
        mongoose.connection.close(() => {
            console.log('MongoDB is disconnected due to application termination');
            process.exit(0);
        });
    });


};
