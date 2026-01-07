const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    symbol: {
      type: String,
      required: true,
      uppercase: true,
      index: true
    },

    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    type: {
      type: String,
      enum: ['BUY', 'SELL'],
      required: true
    },
     realizedPnl: {
      type: Number,
      default: 0
    }
  },
   
  { timestamps: true }
);

// Optional immutability guard
tradeSchema.pre('findOneAndUpdate', function () {
  throw new Error('Trades are immutable');
});

module.exports = mongoose.model('Trade', tradeSchema);
