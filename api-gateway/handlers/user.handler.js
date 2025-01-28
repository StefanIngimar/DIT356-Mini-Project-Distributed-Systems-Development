const { nanoid } = require("nanoid");
const { mqttClient } = require("../mqtt/mqttClient");

const responseTopic = "dit356g2/users/res";
const requestTopic = "dit356g2/users/req";
const requestTimeoutMs = 5000;

mqttClient.subscribe(responseTopic);

function getUsersHandler(req, res) {
  const messageId = nanoid();
  const requestPayload = {
    msgId: messageId,
    method: "GET",
    path: "/users",
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

function getUserHandler(req, res) {
  const messageId = nanoid();
  const userId = req.params.userId;
  const requestPayload = {
    msgId: messageId,
    method: "GET",
    path: `/users/${userId}`,
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

function getUserPreferencesHandler(req, res) {
  const messageId = nanoid();
  const userId = req.params.userId;
  const requestPayload = {
    msgId: messageId,
    method: "GET",
    path: `/users/${userId}/preferences`,
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

function registerUserHandler(req, res) {
  const messageId = nanoid();
  const requestPayload = {
    msgId: messageId,
    method: "POST",
    path: "/users",
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

function loginHandler(req, res) {
  const messageId = nanoid();
  const requestPayload = {
    msgId: messageId,
    method: "POST",
    path: "/login",
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

function validateJwtTokenHandler(req, res) {
  const messageId = nanoid();
  const userId = req.params.userId;
  const requestPayload = {
    msgId: messageId,
    method: "POST",
    path: `/users/${userId}/jwt`,
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

function addUserPreference(req, res) {
  const messageId = nanoid();
  const userId = req.params.userId;
  const requestPayload = {
    msgId: messageId,
    method: "POST",
    path: `/users/${userId}/preferences`,
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

function addTimeSlotToUserPreference(req, res) {
  const messageId = nanoid();
  const userId = req.params.userId;
  const preferenceId = req.params.preferenceId;
  const requestPayload = {
    msgId: messageId,
    method: "POST",
    path: `/users/${userId}/preferences/${preferenceId}/time-slots`,
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

function updateUserPreference(req, res) {
  const messageId = nanoid();
  const userId = req.params.userId;
  const preferenceId = req.params.preferenceId;
  const requestPayload = {
    msgId: messageId,
    method: "PATCH",
    path: `/users/${userId}/preferences/${preferenceId}`,
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

function removeUserPreference(req, res) {
  const messageId = nanoid();
  const userId = req.params.userId;
  const preferenceId = req.params.preferenceId;
  const requestPayload = {
    msgId: messageId,
    method: "DELETE",
    path: `/users/${userId}/preferences/${preferenceId}`,
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
  getUsersHandler,
  getUserHandler,
  getUserPreferencesHandler,
  registerUserHandler,
  loginHandler,
  validateJwtTokenHandler,
  addUserPreference,
  addTimeSlotToUserPreference,
  updateUserPreference,
  removeUserPreference,
};
