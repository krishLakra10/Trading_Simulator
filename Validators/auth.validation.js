const Joi = require('joi');

exports.registerSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),

  email: Joi.string()
    .email()
    .lowercase()
    .required(),

  password: Joi.string()
    .min(6)
    .max(30)
    .required(),

  pan: Joi.string()
    .pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .required()
});

exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});
