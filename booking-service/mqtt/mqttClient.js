const mqttWrapper = require('./mqttWrapper');
const mqttClient = new mqttWrapper();

mqttClient.connect();

module.exports = mqttClient;