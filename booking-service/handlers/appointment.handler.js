const nanoid = require("nanoid");
const { logger } = require("../utils/logging.util");
const { 
  prepareErrorResponse, 
  prepareErrorResponsePayload, 
  isExistent,
} = require("../utils/error.util");
const mqttClient = require("../mqtt/mqttClient");
const {
    createAppointment,
    getAllAppointments,
    getAppointmentById,
    getAppointmentByClinic,
    getAppointmentByDentist,
    updateAppointment,
    deleteAppointment,
    getAppointmentAvailability,
    getAllAppointmentAvailability,
} = require("../services/appointment.service");
const outgoingTopic = "dit356g2/appointments/res";

async function createAppointmentHandler(mqttReq) {
    try {
        const appointmentData = mqttReq.data;
        logger.info(`Appointment to create: ${JSON.stringify(appointmentData)}`);
        const appointment = await createAppointment(appointmentData)

        const responsePayload = {
            msgId: mqttReq.msgId,
            status: 201,
            data: appointment,
        };

        mqttClient.publish(outgoingTopic, responsePayload);
    } catch(error){
        logger.error(`Error creating appointment: ${error.stack}`);
        const errorObject = prepareErrorResponse(error);
        logger.error(`Error response: ${JSON.stringify(errorObject)}`);
        const responsePayload = prepareErrorResponsePayload(mqttReq, errorObject);
        mqttClient.publish(outgoingTopic, responsePayload);
    }
}

async function getAppointmentAvailabilityHandler(mqttReq) {
    try {
        const clinicId = mqttReq.path.split("/").pop();
        logger.info(`Handler: Fetching appointment availability for clinicId: ${clinicId}`);

        const availability = await getAppointmentAvailability(clinicId);
        const responsePayload = {
            msgId: mqttReq.msgId,
            status: 200,
            data: availability,
        };

        mqttClient.publish(outgoingTopic, responsePayload);
    } catch(error){
        const errorObject = prepareErrorResponse(error);
        const responsePayload = prepareErrorResponsePayload(mqttReq, errorObject);
        mqttClient.publish(outgoingTopic, responsePayload);
    }
}

async function getAllAppointmentAvailabilityHandler(mqttReq) {
    try {
        logger.info(`Service Handler: Processing msgId ${mqttReq.msgId}`);
        const availability = await getAllAppointmentAvailability();
        const responsePayload = {
            msgId: mqttReq.msgId,
            status: 200,
            data: availability,
        };
        logger.info(`Service Handler: Publishing response for msgId ${mqttReq.msgId}: ${JSON.stringify(responsePayload)}`);
        mqttClient.publish(outgoingTopic, responsePayload);
    } catch (error) {
        logger.error(`Service Handler: Error processing msgId ${mqttReq.msgId}: ${error.message}`);
        const errorObject = prepareErrorResponse(error);
        const responsePayload = prepareErrorResponsePayload(mqttReq, errorObject);
        mqttClient.publish(outgoingTopic, responsePayload);
    }
}

async function getAllAppointmentHandler(mqttReq) {
    try {
        const appointments = await getAllAppointments();

        const responsePayload = {
            msgId: mqttReq.msgId,
            status: 200,
            data: appointments,
        };

        mqttClient.publish(outgoingTopic, responsePayload);
    } catch(error){
        const errorObject = prepareErrorResponse(error);
        const responsePayload = prepareErrorResponsePayload(mqttReq, errorObject);
        mqttClient.publish(outgoingTopic, responsePayload);
    }
}

async function getAppointmentsByClinicHandler(mqttReq) {
    try {
        const clinicId = mqttReq.path.match(/\/appointments\/clinic\/([^\/]+)$/)?.[1];
        if (!clinicId) {
            throw new Error("Clinic ID is missing in the request path");
        }
        const appointment = await getAppointmentByClinic(clinicId);

        const responsePayload = {
            msgId: mqttReq.msgId,
            status: 200,
            data: appointment,
        };

        mqttClient.publish(outgoingTopic, responsePayload);
    } catch(error){
        const errorObject = prepareErrorResponse(error);
        const responsePayload = prepareErrorResponsePayload(mqttReq, errorObject);
        mqttClient.publish(outgoingTopic, responsePayload);
    }
}

async function getAppointmentByDentistHandler(mqttReq) {
    try {
        const dentistId = mqttReq.data.dentistId;
        logger.info(`Fetching appointments for dentistId: ${dentistId}`);
        const appointment = await getAppointmentByDentist(dentistId);

        const responsePayload = {
            msgId: mqttReq.msgId,
            status: 200,
            data: appointment,
        };

        mqttClient.publish(outgoingTopic, responsePayload);
    } catch(error){
        logger.error(`Error in getAppointmentByDentistHandler: ${error.stack}`);
        const errorObject = prepareErrorResponse(error);
        const responsePayload = prepareErrorResponsePayload(mqttReq, errorObject);
        mqttClient.publish(outgoingTopic, responsePayload);
    }
}

async function getAppointmentByIdHandler(mqttReq) {
    try {
        const appointmentId = mqttReq.path.split("/")[2];
        logger.info(`Fetching appointment by ID: ${appointmentId}`);
        const appointment = await getAppointmentById(appointmentId);

        const responsePayload = {
            msgId: mqttReq.msgId,
            status: 200,
            data: appointment,
        };

        mqttClient.publish(outgoingTopic, responsePayload);
    } catch(error){
        logger.error(`Error in getAppointmentByIdHandler: ${error.stack}`);
        const errorObject = prepareErrorResponse(error);
        const responsePayload = prepareErrorResponsePayload(mqttReq, errorObject);
        mqttClient.publish(outgoingTopic, responsePayload);
    }
}

async function updateAppointmentHandler(mqttReq) {
    try {
        logger.info(`Request data: ${JSON.stringify(mqttReq.data)}`);
        const appointmentId = mqttReq.path.split("/")[2];
        if (!appointmentId) {
            throw new Error("Missing appointmentId in request data");
        }
        const appointmentData = mqttReq.data;
        logger.info(`Updating appointment with ID: ${appointmentId}`);
        const updatedAppointment = await updateAppointment(appointmentId, appointmentData);

        const responsePayload = {
            msgId: mqttReq.msgId,
            status: 200,
            data: updatedAppointment,
        };

        mqttClient.publish(outgoingTopic, responsePayload);
    } catch(error){
        const errorObject = prepareErrorResponse(error);
        const responsePayload = prepareErrorResponsePayload(mqttReq, errorObject);
        mqttClient.publish(outgoingTopic, responsePayload);
    }
}

async function deleteAppointmentHandler(mqttReq) {
    try {
        const appointmentId = mqttReq.path.split("/")[2];
        const appointment = await deleteAppointment(appointmentId);

        const responsePayload = {
            msgId: mqttReq.msgId,
            status: 200,
            data: appointment,
        };

        mqttClient.publish(outgoingTopic, responsePayload);
    } catch(error){
        const errorObject = prepareErrorResponse(error);
        const responsePayload = prepareErrorResponsePayload(mqttReq, errorObject);
        mqttClient.publish(outgoingTopic, responsePayload);
    }
}

module.exports = {
    createAppointmentHandler,
    getAllAppointmentHandler,
    getAppointmentsByClinicHandler,
    getAppointmentByDentistHandler,
    getAllAppointmentAvailabilityHandler,
    getAppointmentAvailabilityHandler,
    getAppointmentByIdHandler,
    updateAppointmentHandler,
    deleteAppointmentHandler,
};