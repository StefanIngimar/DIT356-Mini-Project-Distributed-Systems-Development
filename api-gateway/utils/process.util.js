const { mqttClient } = require("../mqtt/mqttClient");
const { logger } = require("./logging.util"); 

function gracefulExit() {
    logger.info("System: exiting gracefully...");
  
    mqttClient.end(() => {
      process.exit(0);
    });
}
  
module.exports = {
    gracefulExit,
};
