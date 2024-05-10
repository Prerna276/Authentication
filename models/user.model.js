const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
    username: { type: String, required : true },
    password: { type : String, required : true },
    isLoggedIn:{type: Boolean}
}, { strict: false, timestamps: true });


module.exports = mongoose.model('User', userSchema, 'User');