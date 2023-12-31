const router = require('express').Router();
const db = require('../database');
const yup = require('yup');

const mailer = require('../nodemailer');
const { templateQRRegistration } = require('../templates/qr');
const { templateWelcoming } = require('../templates/welcoming');

const emailFrom = '"MS Glow 7th Anniversary" <info@msglowid.com>';

const getUsersSchema = yup.object().shape({
  page: yup.number().min(1),
  limit: yup.number().max(1000),
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
    if (request.email) {
      rdb = rdb.like('email', `%${request.email}%`);
    }

    const { error: countError, count } = await rdb;
    if (countError) {
      throw countError;
    }

    const from = (request.page - 1) * request.limit;
    const to = request.page * request.limit - 1;

    let ldb = db.from('users').select().range(from, to).order('name', { ascending: true });
    if (request.email) {
      ldb = ldb.like('email', `%${request.email}%`);
    }

    const { data, error } = await ldb;
    if (error) {
      throw error;
    }

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
    if (error) {
      throw error;
    }
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
  return_at: yup.date().required().typeError('Invalid return_at format').test('datetime', 'Invalid return_at format', (value) => {
    return value instanceof Date && !isNaN(value);
  }),
  return_vehicle_type: yup.string().required(),
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
    depart_train_name: req.body.depart_train_name,
    depart_vehicle_additional_info: req.body.depart_vehicle_additional_info,
    return_at: req.body.return_at,
    return_vehicle_type: req.body.return_vehicle_type,
    return_flight_number: req.body.return_flight_number,
    return_airline: req.body.return_airline,
    return_train_name: req.body.return_train_name,
    return_vehicle_additional_info: req.body.return_vehicle_additional_info,
    qr_link: constructQRLink(req.body.email)
  };

  try {
    const { data: dataEmail, error: errorEmail } = await db.from('users').select().match({ email: request.email });
    if (errorEmail) {
      throw errorEmail;
    }
    if (dataEmail.length > 0) {
      return res.status(400).json({ message: 'email already registered' });
    }

    const { error } = await db.from('users').insert(request);
    if (error) {
      throw error;
    }

    // send email
    const mailTransporter = mailer.config(0);
    const mailConfig = {
      from: emailFrom,
      to: request.email,
      subject: '[QR Code] Registration Successful for MS GLOW SPEK7A INDRALOKA - The MS Glow\'s 7th Anniversary Event!',
      html: templateQRRegistration(request),
    };

    await mailer.sendMail(mailTransporter, mailConfig).
      catch(error => { console.error(error, { email: request }); });

    return res.status(201).json({ message: 'registration success', data: { email: request.email, qr_link: request.qr_link } });
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
    const { data, error } = await db.from('users').select("*").match({ email: request.email });
    if (error) {
      throw error;
    }
    if (data.length === 0) {
      return res.status(400).json({ message: 'email not registered' });
    }

    const { error: errorUpdate } = await db.from('users').update({ checked_in: true }).match({ email: request.email });
    if (errorUpdate) {
      throw errorUpdate;
    }

    // send email
    const mailTransporter = mailer.config(0);
    const mailConfig = {
      from: emailFrom,
      to: request.email,
      subject: '[Seat Number] MS GLOW SPEK7A INDRALOKA Check-In Confirmation and Seat Assignment',
      html: templateWelcoming(data[0]),
    };

    await mailer.sendMail(mailTransporter, mailConfig).
      catch(error => { console.error(error, { email: request }); });

    return res.status(200).json({ message: 'check in success' });
  } catch (error) {
    next(error);
  }
};

const exportUsers = async (req, res, next) => {
  maximumRows = 1000;
  try {
    const { error, count } = await db.from('users').select('email', { count: 'exact' });
    if (error) {
      throw error;
    }

    let data = [];
    for (let i = 0; i < Math.ceil(count / maximumRows); i++) {
      const { data: items, error } = await db.from('users').select().range(i * maximumRows, (i + 1) * maximumRows - 1);
      if (error) {
        throw error;
      }
      data.push(...items);
    }

    for (const item of data) {
      delete item.id;
      delete item.created_at;
      delete item.updated_at;
      for (const key in item) {
        if (typeof item[key] !== 'string') {
          continue;
        }
        if (item[key].includes("\,")) {
          item[key] = `\"${item[key]}\"`;
        }
      }
    }

    const csv = convertToCSV(data);
    const filename = `users-${Date.now()}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    return res.status(201).send(csv);
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
  const { file } = req.files;
  if (!file) {
    return res.status(400).json({ message: 'file not found' });
  }

  if (file.mimetype !== 'text/csv') {
    return res.status(400).json({ message: 'please upload file with csv format' });
  }

  // convert csv to array of object
  const csv = file.data.toString('utf8');
  const rows = csv.split('\n');

  // get email and seat table header index by name from csv
  const header = rows[0].split(',');

  for (i = 0; i < header.length; i++) {
    header[i] = header[i].trim().replace(/\r?\n|\r/g, '');
  }

  const emailIndex = header.indexOf('email');
  const seatTableIndex = header.indexOf('seat_table');

  if (emailIndex === -1) {
    return res.status(400).json({ message: 'email column not found' });
  }
  if (seatTableIndex === -1) {
    return res.status(400).json({ message: 'seat_table column not found' });
  }

  if (header.length !== 2) {
    return res.status(400).json({ message: 'column allowed only email and seat_table' });
  }

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
      if (error) {
        throw error;
      }
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
