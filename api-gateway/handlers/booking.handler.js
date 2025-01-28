const { nanoid } = require("nanoid");
const { logger } = require("../utils/logging.util");
const { mqttClient } = require("../mqtt/mqttClient");

const incomingTopic = "dit356g2/bookings/res";
const outgoingTopic = "dit356g2/bookings/req";

// Subscribe to relevant topics 
mqttClient.subscribe(incomingTopic); 

function createBookingHandler(req, res) {
    const timeoutMs = 5000;
    const bookingData = req.body;
    const msgId = nanoid();
    const requestPayload = { 
      msgId: msgId, 
      method: req.method, 
      path: "/bookings",
      data: bookingData
    };

    mqttClient.publishAndRespond(res, timeoutMs, outgoingTopic, msgId, requestPayload);
}

function getBookingsHandler(req, res) {
  const timeoutMs = 7000;
  const msgId = nanoid();
  const requestPayload = { 
    msgId: msgId, 
    method: req.method, 
    path: "/bookings",
    query: req.query
  };

  mqttClient.publishAndRespond(res, timeoutMs, outgoingTopic, msgId, requestPayload);
}

function getBookingsByDentistHandler(req, res) {
  const timeoutMs = 7000;
  const dentistId = req.params.dentistId;
  const msgId = nanoid();
  const requestPayload = { 
    msgId: msgId, 
    method: req.method,
    path: `/bookings/dentist/${dentistId}`,
    query: req.query
  };

  mqttClient.publishAndRespond(res, timeoutMs, outgoingTopic, msgId, requestPayload);
}

function confirmBookingHandler(req, res) {
  const timeoutMs = 5000;
  const bookingId = req.params.bookingId;
  const msgId = nanoid();
  const requestPayload = { 
    msgId: msgId, 
    method: req.method,
    path: `/bookings/${bookingId}`,
  };

  mqttClient.publishAndRespond(res, timeoutMs, outgoingTopic, msgId, requestPayload);
}

function getBookingHandler(req, res) {
  const timeoutMs = 7000;
  const bookingId = req.params.bookingId;
  const msgId = nanoid();
  const requestPayload = { 
    msgId: msgId, 
    method: req.method, 
    path: `/bookings/${bookingId}`, 
  };

  mqttClient.publishAndRespond(res, timeoutMs, outgoingTopic, msgId, requestPayload);
}

function cancelBookingHandler(req, res) {
  const timeoutMs = 5000;
  const bookingId = req.params.bookingId;
  const msgId = nanoid();
  const requestPayload = { 
    msgId: msgId, 
    method: req.method, 
    path: `/bookings/${bookingId}`, 
  };

  mqttClient.publishAndRespond(res, timeoutMs, outgoingTopic, msgId, requestPayload);
}

module.exports = {
    createBookingHandler,
    getBookingsHandler,
    getBookingsByDentistHandler,
    confirmBookingHandler,
    getBookingHandler,
    cancelBookingHandler,
};
  