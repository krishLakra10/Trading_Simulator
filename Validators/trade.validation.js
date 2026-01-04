const Joi = require('joi');

exports.tradeSchema = Joi.object({
  symbol: Joi.string()
    .uppercase()
    .min(1)
    .max(10)
    .required(),

  quantity: Joi.number()
    .integer()
    .positive()
    .required()
});
