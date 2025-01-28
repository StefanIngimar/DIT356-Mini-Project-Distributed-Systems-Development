const mongoose = require("mongoose");
const { logger } = require("../utils/logging.util"); 

const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  logger.error("Missing MONGODB_URI for dropping test database.");
  process.exit(1);
}

// Drop database
mongoose.connect(mongoURI).catch(function (err) {
  if (err) {
    logger.error(`Failed to connect to MongoDB with URI: ${mongoURI}`);
    logger.error(err.stack);
    process.exit(1);
  }
});
mongoose.connection.dropDatabase().then(function () {
  logger.info(`Dropped database: ${mongoURI}`);
  process.exit(0);
});
