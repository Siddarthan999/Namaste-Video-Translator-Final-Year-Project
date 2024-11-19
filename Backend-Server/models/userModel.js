const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        phoneNumber: {
            type: String,
            required: true,
            unique: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        
        password: {
            type: String,
            required: true
        }
    },
    {
        collection: 'NamasteLoginDataCollection'
    }
);

module.exports = mongoose.model('NamasteLoginDataCollection', userSchema);
