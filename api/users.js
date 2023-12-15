const router = require('express').Router();
const db = require('../database');

const getUsers = async (req, res, next) => {
  try {
    const { data, error } = await db.from('users').select();
    if (error) throw error;
    console.log(data, error);
    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

const putSeat = async (req, res, next) => { };

const userRegistration = async (req, res, next) => { };

const userCheckIn = async (req, res, next) => { };

router.get("/", getUsers);
router.put("/seat", putSeat);
router.post('/registration', userRegistration);
router.post('/check-in', userCheckIn);

module.exports = router;
