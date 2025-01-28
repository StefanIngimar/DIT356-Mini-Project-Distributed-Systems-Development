const mongoose = require("mongoose");
const { logger } = require("../utils/logging.util"); 
const { mongoURI } = require("../config/app.config");

function openDbConnection(mongoURI) {
  mongoose
    .connect(mongoURI)
    .catch((err) => {
      logger.error(`Failed to connect to MongoDB with URI: ${mongoURI}`);
      logger.error(err.stack);
      process.exit(1);
    })
    .then(() => {
      logger.info(`Connected to MongoDB with URI: ${mongoURI}`); // mistake when forward porting
    });
}

module.exports = { openDbConnection };