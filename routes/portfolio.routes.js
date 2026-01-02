const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const Portfolio = require('../Models/Portfolio');

router.get('/', auth, async (req, res) => {
  const portfolio = await Portfolio.findOne({ userId: req.user.id });
  res.json(portfolio);
});

module.exports = router;
