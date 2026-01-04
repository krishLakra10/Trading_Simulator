const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const tradeController = require('../controllers/trade.controller');
const {tradeSchema } = require('../Validators/trade.validation');

router.post('/buy', auth,validate(tradeSchema), tradeController.buyStock);

router.post('/sell', auth,validate(tradeSchema), tradeController.sellStock);


module.exports = router;
