const { rateLimit } = require('express-rate-limit');

const limiter = rateLimit({
  limit: 50,
  windowMs: 15 * 60 * 1000,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

module.exports = { limiter };
