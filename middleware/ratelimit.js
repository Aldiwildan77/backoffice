const { rateLimit } = require('express-rate-limit');

const limiter = rateLimit({
  limit: 75,
  windowMs: 15 * 60 * 1000,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

module.exports = { limiter };
