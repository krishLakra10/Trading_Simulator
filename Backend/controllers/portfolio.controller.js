const Portfolio = require('../Models/Portfolio');
const User = require('../Models/User');
const { getLivePrice } = require('../services/marketData.service');
const appError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.getPortfolio = catchAsync(async (req, res,next) => {
  
    const userId = req.user.id;

    const user = await User.findById(userId);
    if(!user){
          throw new appError('User not found', 404)
        }
    const portfolio = await Portfolio.findOne({ userId });
    if(!portfolio){
          throw new appError('Portfolio not found', 404)
        }
    let totalInvested = 0;
    let totalCurrent = 0;

    const detailedHoldings = [];

    for (const holding of portfolio.holdings) {
      const currentPrice = await getLivePrice(holding.symbol);

      const investedValue = holding.price * holding.quantity;
      const currentValue = currentPrice * holding.quantity;
      const pnl = currentValue - investedValue;

      totalInvested += investedValue;
      totalCurrent += currentValue;

      detailedHoldings.push({
        symbol: holding.symbol,
        quantity: holding.quantity,
        price: holding.price,
        currentPrice,
        investedValue,
        currentValue,
        unrealizedPnL: pnl
      });
    }

    res.json({
      cashBalance: user.cashBalance,
      holdings: detailedHoldings,
      totalInvested,
      totalCurrent,
      totalPnL: totalCurrent - totalInvested
    });

});
