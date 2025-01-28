const mqttWrapper = require('./mqttWrapper');
const mqttWsClient = require("./ws/client");

const mqttClient = new mqttWrapper();

mqttClient.connect();
mqttWsClient.connect();

module.exports = {
    mqttClient,
    mqttWsClient,
};