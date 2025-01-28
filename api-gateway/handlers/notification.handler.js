const { nanoid } = require("nanoid");
const { mqttClient } = require("../mqtt/mqttClient");

const querystring = require("querystring");

const responseTopic = "dit356g2/notifications/res";
const requestTopic = "dit356g2/notifications/req";
const requestTimeoutMs = 5000;

mqttClient.subscribe(responseTopic);

function getUserNotificationsHandler(req, res) {
  const messageId = nanoid();
  const userId = req.params.userId;
  const requestPayload = {
    msgId: messageId,
    method: "GET",
    path: req.query ? `/notifications/${userId}?${querystring.stringify(req.query)}` : `/notifications/${userId}`,
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

function markNotificationAsReadHandler(req, res) {
  const messageId = nanoid();
  const notificationId = req.params.notificationId;
  const requestPayload = {
    msgId: messageId,
    method: "PUT",
    path: `/notifications/${notificationId}`,
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
    getUserNotificationsHandler,
    markNotificationAsReadHandler,
}