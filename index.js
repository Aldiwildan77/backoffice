const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");

const { PORT } = require("./config");

app.use(express.json({ extended: false }));
app.use(fileUpload());
app.use(require("./api"));
app.use(require("./api/error").notFound);
app.use(require("./api/error").errorHandler);

app.listen(PORT, () => console.log('info', `Server is running at ${PORT}`));
