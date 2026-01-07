const AppError = require('../utils/AppError');

module.exports = (err, req, res, next) => {
  // Default values
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'Something went wrong!!';

  // Development: detailed error
  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack
    });
  }

  // Production: safe error
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }

  // Programming / unknown error
  console.error('ERROR:', err);

  res.status(500).json({
    status: 'error',
    message: 'Something went wrong'
  });
};
