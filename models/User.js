const {model, Schema} = require('mongoose');

const userSchema = new Schema({
    username : String,
    passowrd : String,
    email : String,
    createdAt : String
});

module.exports = model('User', userSchema);