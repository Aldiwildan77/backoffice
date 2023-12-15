const router = require('express').Router();

router.use('/', require('./home'));
router.use('/api/users', require('./users'));
router.use('/health', require('./health'));

module.exports = router;
