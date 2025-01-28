const { nanoid } = require("nanoid");
const { logger } = require("../utils/logging.util");
const { mqttClient } = require("../mqtt/mqttClient");

const incomingTopic = "dit356g2/appointments/res";
const outgoingTopic = "dit356g2/appointments/req"

mqttClient.subscribe(incomingTopic);

function createAppointmentHandler(req, res) {
    const timeoutMs = 5000;
    const appointmentData = req.body;
    const msgId = nanoid();
    const requestPayload = {
        msgId: msgId,
        method: "POST",
        path: "/appointments",
        data: appointmentData
    };
    mqttClient.publishAndRespond(res, timeoutMs, outgoingTopic, msgId, requestPayload);
}

function getAppointmentClinicHandler(req, res) {
    const timeoutMs = 5000;
    const clinicId = req.params.clinicId;
    const msgId = nanoid();

    const requestPayload = {
        msgId: msgId,
        method: "GET",
        path: `/appointments/clinic/${clinicId}`,
        data: { clinicId }
    };

    console.log("MQTT Request Payload:", JSON.stringify(requestPayload));
    mqttClient.publishAndRespond(res, timeoutMs, outgoingTopic, msgId, requestPayload);
}

function getAppointmentStatusHandler(req, res) {
    const timeoutMs = 5000;
    const clinicId = req.params.clinicId;
    const msgId = nanoid();

    const requestPayload = {
        msgId: msgId,
        method: "GET",
        path: `/appointments/status/${clinicId}`,
        data: {}
    };

    console.log("MQTT Request Payload:", JSON.stringify(requestPayload));
    mqttClient.publishAndRespond(res, timeoutMs, outgoingTopic, msgId, requestPayload);
}

function getAllAppointmentStatusHandler(req, res) {
    const timeoutMs = 5000;
    const msgId = nanoid();
    logger.info(`API Handler: Generated msgId: ${msgId}`);

    const requestPayload = {
        msgId: msgId,
        method: "GET",
        path: `/appointments/status`,
    };
    logger.info(`API Handler: Sending request with msgId: ${msgId}`);
    console.log("MQTT Request Payload:", JSON.stringify(requestPayload));
    mqttClient.publishAndRespond(res, timeoutMs, outgoingTopic, msgId, requestPayload);
}

function getAppointmentIdHandler(req, res) {
    const timeoutMs = 5000;
    const appointmentId = req.params.appointmentId;
    const msgId = nanoid();

    const requestPayload = {
        msgId: msgId,
        method: "GET",
        path: `/appointments/${appointmentId}`,
        data: { appointmentId }
    };

    console.log("MQTT Request Payload:", JSON.stringify(requestPayload));
    mqttClient.publishAndRespond(res, timeoutMs, outgoingTopic, msgId, requestPayload);
}

function getAppointmentDentistHandler(req, res) {
    const timeoutMs = 5000;
    const dentistId = req.params.dentistId;
    const msgId = nanoid();

    const requestPayload = {
        msgId: msgId,
        method: "GET",
        path: `/appointments/dentist/${dentistId}`,
        data: { dentistId }
    };

    console.log("MQTT Request Payload:", JSON.stringify(requestPayload));
    mqttClient.publishAndRespond(res, timeoutMs, outgoingTopic, msgId, requestPayload);
}

function getAllAppointmentsHandler(req, res) {
    const timeoutMs = 5000;
    const msgId = nanoid();
    const requestPayload = {
        msgId: msgId,
        method: "GET",
        path: "/appointments",
        data: {}
    };
    console.log("MQTT Request Payload:", JSON.stringify(requestPayload));
    mqttClient.publishAndRespond(res, timeoutMs, outgoingTopic, msgId, requestPayload);
}

function updateAppointmentHandler(req, res) {
    const timeoutMs = 5000;
    const appointmentId = req.params.appointmentId;
    const appointmentData = req.body;
    const msgId = nanoid();
    const requestPayload = {
        msgId: msgId,
        method: "PATCH",
        path: `/appointments/${appointmentId}`,
        appointmentId: appointmentId,
        data: appointmentData
    };
    mqttClient.publishAndRespond(res, timeoutMs, outgoingTopic, msgId, requestPayload);
}

function cancelAppointmentHandler(req, res) {
    const timeoutMs = 5000;
    const appointmentId = req.params.appointmentId;
    const msgId = nanoid();
    const requestPayload = {
        msgId: msgId,
        method: "DELETE",
        path: `/appointments/${appointmentId}`,
        appointmentId: appointmentId
    };
    mqttClient.publishAndRespond(res, timeoutMs, outgoingTopic, msgId, requestPayload);
}

module.exports = {
    createAppointmentHandler,
    getAppointmentClinicHandler,
    getAppointmentIdHandler,
    getAppointmentDentistHandler,
    getAllAppointmentsHandler,
    updateAppointmentHandler,
    cancelAppointmentHandler,
    getAppointmentStatusHandler,
    getAllAppointmentStatusHandler
};
