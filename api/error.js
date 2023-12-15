const notFound = (req, res, next) => {
  const error = new Error('not found - ' + req.originalUrl);
  error.statusCode = 404;
  next(error);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (error, req, res, next) => {
  res.status(error.statusCode || 500).json({
    message: error.message
  });
};

module.exports = { notFound, errorHandler };
