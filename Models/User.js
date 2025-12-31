const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        FirstName:{
            type: String,
            required: true,
        },
        LastName:{
            type: String,
            required: true,
        },
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: { 
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    pancardNumber: {
        type: String,
        required: true,
        unique: true,
    },
    Balance : {
        type: Number,
        default: 0,
    }
});

module.exports = mongoose.model('User', userSchema);
