const router = require('express').Router();

const getHealth = async (req, res, next) => {
  res.status(200).json({ message: "OK" });
};

router.get("/", getHealth);

module.exports = router;
