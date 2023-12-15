const router = require('express').Router();

router.use('/api/users', require('./users'));
router.use('/health', require('./health'));
router.use('/', require('./home'));

module.exports = router;
