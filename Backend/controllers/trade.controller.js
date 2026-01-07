const mongoose = require('mongoose');
const User = require('../Models/User');
const Portfolio = require('../Models/Portfolio');
const Trade = require('../Models/Trade');
const { getLivePrice } = require('../services/marketData.service');
const appError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.buyStock = catchAsync(async (req, res , next) => {
  const session = await mongoose.startSession();
  session.startTransaction();


    const userId = req.user.id;
    const { symbol, quantity } = req.body;

    // 1️ Fetch live price
    const price = await getLivePrice(symbol);
    const totalCost = price * quantity;

    // 2 Fetch user
    const user = await User.findById(userId).session(session);
    if (!user) throw new appError('User not found',404);

    // 3️ Check balance
    if (user.cashBalance < totalCost) {
      throw new appError('Insufficient balance',400);
    }

    // 4️ Fetch portfolio
    const portfolio = await Portfolio.findOne({ userId }).session(session);

    // 5️ Update holdings
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

    // 6️ Deduct cash
    user.cashBalance -= totalCost;

    // 7️ Create trade (ledger entry)
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

    // 8️ Save updated documents
    await user.save({ session });
    await portfolio.save({ session });

    // 9️ Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: 'Stock bought successfully',
      symbol,
      quantity,
      price
    });

 
});


exports.sellStock = catchAsync(async (req, res , next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

    const userId = req.user.id;
    const { symbol, quantity } = req.body;

    // 1️ Fetch live price
    const price = await getLivePrice(symbol);
    const totalProceeds = price * quantity;

    // 2️ Fetch user
    const user = await User.findById(userId).session(session);
    if (!user) throw new appError('User not found',404);

    // 3️ Fetch portfolio
    const portfolio = await Portfolio.findOne({ userId }).session(session);
    if (!portfolio) throw new appError('Portfolio not found',404);

    // 4️ Find holding
    const holdingIndex = portfolio.holdings.findIndex(
      h => h.symbol === symbol
    );

    if (holdingIndex === -1) {
      throw new appError('Stock not owned',400);
    }

    const holding = portfolio.holdings[holdingIndex];

    // 5️ Validate quantity
    if (holding.quantity < quantity) {
      throw new appError('Insufficient stock quantity',400);
    }

    // 6️ Update holding
    holding.quantity -= quantity;

    if (holding.quantity === 0) {
      portfolio.holdings.splice(holdingIndex, 1);
    }

    // 7️ Credit cash
    user.cashBalance += totalProceeds;

    const realizedPnL = (price - holding.price) * quantity;
    

    // 8️ Create trade (ledger entry)
    await Trade.create(
      [{
        userId,
        symbol,
        quantity,
        price,
        type: 'SELL'
      }],
      realizedPnL ,
      { session }
    );

    // 9️ Save updates
    await user.save({ session });
    await portfolio.save({ session });

    // 10 Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: 'Stock sold successfully',
      symbol,
      quantity,
      price
    });

  
});

exports.getTradeHistory = catchAsync(async (req ,res,next) => {
  
    const userId = req.user.id;

    const trades = (await Trade.find({userId})).sort({createdAt :-1});

    res.json({
      trades,
      count : trades.length
    });
 
});
