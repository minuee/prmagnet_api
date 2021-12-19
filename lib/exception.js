var logErrors = function (err, req, res, next) {
  console.error(err.stack);
  next(err);
};

var clientErrorHandler = function (err, req, res, next) {
  if (req.xhr) {
    res.status(500).send({ error: "Something failed!" });
  } else {
    next(err);
  }
};

var errorHandler = function (err, req, res, next) {
  res.status(500);
  res.render("error", { error: err });
};

module.exports = {
  logErrors: logErrors,
  clientErrorHandler: clientErrorHandler,
  errorHandler: errorHandler,
};
