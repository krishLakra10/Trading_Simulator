const Mongoose = require('mongoose');

const TradeSchema = new Mongoose.Schema({
    symbol: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    tradeType: {
        type: String,   
        enum: ['BUY', 'SELL'],
        required: true
    },
    tradeDate: {
        type: Date,
        default: Date.now
    }
});

module.exports  = Mongoose.model('Trade', TradeSchema);
