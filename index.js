const express = require("express");
const app = express();
const cors = require('cors');
const path = require('path');
const fileUpload = require("express-fileupload");

const { PORT } = require("./config");
const { limiter } = require("./middleware/ratelimit");

app.use('/static', express.static(path.join(__dirname, 'public')));

app.use(cors());

app.use(limiter);
app.use(express.json({ extended: false }));
app.use(fileUpload());
app.use(require("./api"));
app.use(require("./api/error").notFound);
app.use(require("./api/error").errorHandler);

app.listen(PORT, () => console.log('info', `Server is running at ${PORT}`));
