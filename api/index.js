const router = require('express').Router();

router.use('/api/users', require('./users'));
router.use('/health', require('./health'));

module.exports = router;
