const mongoose = require('mongoose');
const User = require('../Models/User');
const Portfolio = require('../Models/Portfolio');
const Trade = require('../Models/Trade');
const { getLivePrice } = require('../services/marketData.service');

exports.buyStock = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.id;
    const { symbol, quantity } = req.body;

    if (!symbol || !quantity || quantity <= 0) {
      throw new Error('Invalid input');
    }

    // 1️⃣ Fetch live price
    const price = await getLivePrice(symbol);
    const totalCost = price * quantity;

    // 2️⃣ Fetch user
    const user = await User.findById(userId).session(session);
    if (!user) throw new Error('User not found');

    // 3️⃣ Check balance
    if (user.cashBalance < totalCost) {
      throw new Error('Insufficient balance');
    }

    // 4️⃣ Fetch portfolio
    const portfolio = await Portfolio.findOne({ userId }).session(session);

    // 5️⃣ Update holdings
    const holding = portfolio.holdings.find(h => h.symbol === symbol);

    if (holding) {
      const newQty = holding.quantity + quantity;
      holding.avgPrice =
        (holding.avgPrice * holding.quantity + price * quantity) / newQty;
      holding.quantity = newQty;
    } else {
      portfolio.holdings.push({
        symbol,
        quantity,
        avgPrice: price
      });
    }

    // 6️⃣ Deduct cash
    user.cashBalance -= totalCost;

    // 7️⃣ Create trade (ledger entry)
    await Trade.create(
      [{
        userId,
        symbol,
        quantity,
        price,
        type: 'BUY'
      }],
      { session }
    );

    // 8️⃣ Save updated documents
    await user.save({ session });
    await portfolio.save({ session });

    // 9️⃣ Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: 'Stock bought successfully',
      symbol,
      quantity,
      price
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({
      message: err.message || 'Buy operation failed'
    });
  }
};


exports.sellStock = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.id;
    const { symbol, quantity } = req.body;

    if (!symbol || !quantity || quantity <= 0) {
      throw new Error('Invalid input');
    }

    // 1️⃣ Fetch live price
    const price = await getLivePrice(symbol);
    const totalProceeds = price * quantity;

    // 2️⃣ Fetch user
    const user = await User.findById(userId).session(session);
    if (!user) throw new Error('User not found');

    // 3️⃣ Fetch portfolio
    const portfolio = await Portfolio.findOne({ userId }).session(session);
    if (!portfolio) throw new Error('Portfolio not found');

    // 4️⃣ Find holding
    const holdingIndex = portfolio.holdings.findIndex(
      h => h.symbol === symbol
    );

    if (holdingIndex === -1) {
      throw new Error('Stock not owned');
    }

    const holding = portfolio.holdings[holdingIndex];

    // 5️⃣ Validate quantity
    if (holding.quantity < quantity) {
      throw new Error('Insufficient stock quantity');
    }

    // 6️⃣ Update holding
    holding.quantity -= quantity;

    if (holding.quantity === 0) {
      portfolio.holdings.splice(holdingIndex, 1);
    }

    // 7️⃣ Credit cash
    user.cashBalance += totalProceeds;

    // 8️⃣ Create trade (ledger entry)
    await Trade.create(
      [{
        userId,
        symbol,
        quantity,
        price,
        type: 'SELL'
      }],
      { session }
    );

    // 9️⃣ Save updates
    await user.save({ session });
    await portfolio.save({ session });

    // 🔟 Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: 'Stock sold successfully',
      symbol,
      quantity,
      price
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({
      message: err.message || 'Sell operation failed'
    });
  }
};
