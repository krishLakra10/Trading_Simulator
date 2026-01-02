const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const tradeController = require('../controllers/trade.controller');

router.post('/buy', auth, tradeController.buyStock);

router.post('/sell', auth, tradeController.sellStock);


module.exports = router;
