const { nanoid } = require("nanoid");
const { logger } = require("../utils/logging.util");
const mqttClient = require("../mqtt/mqttClient");
const outTopic = "dit356g2/bookings/test/res";

const response = { 
    msgId: nanoid(), 
    data: {patient: "joe", apDate: "2025-01-02", status: "PENDING"}
}

mqttClient.client.on("connect", () => {
    mqttClient.publish(outTopic, response);
    mqttClient.end();
});
