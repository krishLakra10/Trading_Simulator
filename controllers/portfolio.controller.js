const Portfolio = require('../Models/Portfolio');
const User = require('../Models/User');
const { getLivePrice } = require('../services/marketData.service');

exports.getPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    const portfolio = await Portfolio.findOne({ userId });

    let totalInvested = 0;
    let totalCurrent = 0;

    const detailedHoldings = [];

    for (const holding of portfolio.holdings) {
      const currentPrice = await getLivePrice(holding.symbol);

      const investedValue = holding.avgPrice * holding.quantity;
      const currentValue = currentPrice * holding.quantity;
      const pnl = currentValue - investedValue;

      totalInvested += investedValue;
      totalCurrent += currentValue;

      detailedHoldings.push({
        symbol: holding.symbol,
        quantity: holding.quantity,
        avgPrice: holding.avgPrice,
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

  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch portfolio' });
  }
};
