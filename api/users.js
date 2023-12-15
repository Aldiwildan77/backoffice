const router = require('express').Router();
const db = require('../database');
const yup = require('yup');

const getUsersSchema = yup.object().shape({
  page: yup.number().min(1),
  limit: yup.number().max(100),
});

const getUsersValidation = async (req, res, next) => {
  try {
    req.query = await getUsersSchema.validate(req.query);
    next();
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const getUsers = async (req, res, next) => {
  const request = {
    email: req.query.email,
    page: req.query.page || 1,
    limit: req.query.limit || 10,
  };

  try {
    let rdb = db.from('users').select('email', { count: 'exact' });
    if (request.email) rdb = rdb.match({ email: request.email });

    const { error: countError, count } = await rdb;
    if (countError) throw countError;

    const from = (request.page - 1) * request.limit;
    const to = request.page * request.limit;

    let ldb = db.from('users').select().range(from, to);
    if (request.email) ldb = ldb.match({ email: request.email });

    const { data, error } = await ldb;
    if (error) throw error;

    const response = {
      data: data,
      meta: {
        page: request.page,
        limit: request.limit,
        total: count,
        total_page: Math.ceil(count / request.limit),
      }
    };

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const userSeatTableSchema = yup.object().shape({
  email: yup.string().required().email(),
  seat_table: yup.string().required(),
});

const userSeatTableValidation = async (req, res, next) => {
  try {
    req.body = await userSeatTableSchema.validate(req.body);
    next();
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const setSeatTable = async (req, res, next) => {
  const request = {
    email: req.body.email,
    seat_table: req.body.seat_table,
  };

  try {
    const { error } = await db.from('users').update({ seat_table: request.seat_table }).match({ email: request.email });
    if (error) throw error;
    return res.status(200).json({ message: 'set seat table success' });
  } catch (error) {
    next(error);
  }
};

const userRegistrationSchema = yup.object().shape({
  name: yup.string().required(),
  email: yup.string().required().email(),
  phone: yup.string().required(),
  address: yup.string().required(),
  postal_code: yup.number().required(),
  depart_at: yup.date().required().typeError('Invalid depart_at format').test('datetime', 'Invalid depart_at format', (value) => {
    return value instanceof Date && !isNaN(value);
  }),
  depart_vehicle_type: yup.string().required(),
  depart_on: yup.string().required(),
  return_at: yup.date().required().typeError('Invalid return_at format').test('datetime', 'Invalid return_at format', (value) => {
    return value instanceof Date && !isNaN(value);
  }),
  return_vehicle_type: yup.string().required(),
  return_on: yup.string().required(),
});

const userRegistrationValidation = async (req, res, next) => {
  try {
    console.log(req.body);
    req.body = await userRegistrationSchema.validate(req.body);
    next();
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const userRegistration = async (req, res, next) => {
  const request = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address,
    postal_code: req.body.postal_code,
    depart_at: req.body.depart_at,
    depart_vehicle_type: req.body.depart_vehicle_type,
    depart_flight_number: req.body.depart_flight_number,
    depart_airline: req.body.depart_airline,
    return_at: req.body.return_at,
    return_vehicle_type: req.body.return_vehicle_type,
    return_flight_number: req.body.return_flight_number,
    return_airline: req.body.return_airline,
    qr_link: constructQRLink(req.body.email)
  };

  try {
    const { data: dataEmail, error: errorEmail } = await db.from('users').select().match({ email: request.email });
    if (errorEmail) throw errorEmail;
    if (dataEmail.length > 0) return res.status(200).json({ message: 'email already registered' });

    const { error } = await db.from('users').insert(request);
    if (error) throw error;

    // TODO: send qr code email

    return res.status(200).json({ message: 'registration success' });
  } catch (error) {
    next(error);
  }
};

const constructQRLink = (email) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${email}`;
};


const userCheckInSchema = yup.object().shape({
  email: yup.string().required().email(),
});

const userCheckInValidation = async (req, res, next) => {
  try {
    req.body = await userCheckInSchema.validate(req.body);
    next();
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const userCheckIn = async (req, res, next) => {
  const request = {
    email: req.body.email,
  };

  try {
    const { data, error } = await db.from('users').select().match({ email: request.email });
    if (error) throw error;
    if (data.length === 0) return res.status(400).json({ message: 'email not registered' });

    const { error: errorUpdate } = await db.from('users').update({ checked_in: true }).match({ email: request.email });
    if (errorUpdate) throw errorUpdate;

    // TODO: send welcoming email

    return res.status(200).json({ message: 'check in success' });
  } catch (error) {
    next(error);
  }
};

const exportUsers = async (req, res, next) => {
  try {
    const { data, error } = await db.from('users').select();
    if (error) throw error;

    const csv = convertToCSV(data);
    const filename = `users-${Date.now()}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    return res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

const convertToCSV = (data) => {
  const array = [Object.keys(data[0])].concat(data);
  return array.map(it => {
    return Object.values(it).toString();
  }).join('\n');
};

const setSeatTables = async (req, res, next) => {
  // get uploaded file
  const file = req.files.file;
  if (!file) return res.status(400).json({ message: 'file not found' });

  if (file.mimetype !== 'text/csv') return res.status(400).json({ message: 'please upload file with csv format' });

  // convert csv to array of object
  const csv = file.data.toString('utf8');
  const rows = csv.split('\n');

  // get email and seat table header index by name from csv
  const header = rows[0].split(',');
  const emailIndex = header.indexOf('email');
  const seatTableIndex = header.indexOf('seat_table');

  if (emailIndex === -1) return res.status(400).json({ message: 'email column not found' });
  if (seatTableIndex === -1) return res.status(400).json({ message: 'seat_table column not found' });

  // construct data
  const data = rows.map(row => {
    const columns = row.split(',');
    return {
      email: columns[emailIndex],
      seat_table: columns[seatTableIndex],
    };
  });

  // update seat table with db transaction
  try {
    for (const item of data) {
      const { error } = await db.from('users').update({ seat_table: item.seat_table }).match({ email: item.email });
      if (error) throw error;
    }
    return res.status(200).json({ message: 'set seat tables success' });
  } catch (error) {
    next(error);
  }
};

router.get("/", getUsersValidation, getUsers);
router.get("/export", exportUsers);
router.put("/seat-table", userSeatTableValidation, setSeatTable);
router.put("/seat-tables", setSeatTables);
router.post("/", userRegistrationValidation, userRegistration);
router.post("/check-in", userCheckInValidation, userCheckIn);

module.exports = router;
