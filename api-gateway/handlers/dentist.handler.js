const { nanoid } = require("nanoid");
const { mqttClient } = require("../mqtt/mqttClient");

const responseTopic = "dit356g2/dentists/res";
const requestTopic = "dit356g2/dentists/req";
const requestTimeoutMs = 5000;

mqttClient.subscribe(responseTopic);

function getDentistsHandler(req, res) {
  const messageId = nanoid();
  const requestPayload = {
    msgId: messageId,
    method: "GET",
    path: "/dentists",
    data: req.body,
  };

  mqttClient.publishAndRespond(
    res,
    requestTimeoutMs,
    requestTopic,
    messageId,
    requestPayload
  );
}

function getDentistHandler(req, res) {
  const messageId = nanoid();
  const requestPayload = {
    msgId: messageId,
    method: "GET",
    path: `/dentists/${req.params.dentistId}`,
    data: req.body,
  };

  mqttClient.publishAndRespond(
    res,
    requestTimeoutMs,
    requestTopic,
    messageId,
    requestPayload
  );
}

function getDentistFromUserIdHandler(req, res) {
  const messageId = nanoid();
  const requestPayload = {
    msgId: messageId,
    method: "GET",
    path: `/dentists/users/${req.params.userId}`,
    data: req.body,
  };

  mqttClient.publishAndRespond(
    res,
    requestTimeoutMs,
    requestTopic,
    messageId,
    requestPayload
  );
}

function getDentistWithClinicsHandler(req, res) {
  const messageId = nanoid();
  const requestPayload = {
    msgId: messageId,
    method: "GET",
    path: `/dentists/${req.params.dentistId}/clinics`,
    data: req.body,
  };

  mqttClient.publishAndRespond(
    res,
    requestTimeoutMs,
    requestTopic,
    messageId,
    requestPayload
  );
}

module.exports = {
  getDentistsHandler,
  getDentistFromUserIdHandler,
  getDentistHandler,
  getDentistWithClinicsHandler,
};
