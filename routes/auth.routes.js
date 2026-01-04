const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate.middleware');
const {registerSchema , loginSchema} = require('../Validators/auth.validation');

router.post('/register',validate(registerSchema) ,authController.register);
router.post('/login', validate(loginSchema), authController.login);

module.exports = router;
