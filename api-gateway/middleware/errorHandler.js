const { env } = require("../config/app.config");
const { logger } = require("../utils/logging.util");

function errorHandler (err, req, res, next) {
  const defaultErrorMsg = "Something went wrong!";
  // if status code in response header is 200 change it to 500,
  // otherwise use predefined status code
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode);

  const error = {
    statusCode: res.statusCode,
    errorMessage: err.message || defaultErrorMsg,
  };

  if (env === "development") {
    // return sensitive stack trace only in dev mode
    error["errorStack"] = err.stack;
  }

  logger.error(err.stack);
  res.json(error);
  return;
};

module.exports = { errorHandler };