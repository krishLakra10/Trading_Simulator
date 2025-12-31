const mongoose = require('mongoose');
const UserId = require('./User');
const Trade = require('./Trade');
const Schema = mongoose.Schema;

const PortfolioSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    holdings: [{
        symbol: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        avgPrice: {
            type: Number,
            required: true
        }
    }],
    cashBalance: {
        type: Number,
        default: 0
    }
});