const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const portfolioSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },

    holdings: [
      {
        symbol: {
          type: String,
          required: true,
          uppercase: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 0
        },
        avgPrice: {
          type: Number,
          required: true,
          min: 0
        }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Portfolio', portfolioSchema);
