const { nanoid } = require("nanoid");
const { logger } = require("../utils/logging.util");
const mqttClient = require("./mqttClient");
const {
    createBookingHandler,
    getBookingsHandler,
    getBookingsByDentistHandler,
    getBookingHandler,
    confirmBookingHanlder,
    cancelBookingHandler,
} = require("../handlers/booking.handler");
const {
    createAppointmentHandler,
    getAllAppointmentHandler,
    getAppointmentsByClinicHandler,
    getAppointmentByDentistHandler,
    getAppointmentByIdHandler,
    getAppointmentAvailabilityHandler,
    getAllAppointmentAvailabilityHandler,
    updateAppointmentHandler,
    deleteAppointmentHandler,
} = require("../handlers/appointment.handler");
//decided to rewrite the router to handle both booking and appointment topics
//within the same router class
function UnifiedRouter() {
    this.sharedTopics = {
        bookings: "$share/bks/dit356g2/bookings/req",
        appointments: "$share/bks/dit356g2/appointments/req",
    };
    this.topics = {
        bookings: "dit356g2/bookings/req",
        appointments: "dit356g2/appointments/req",
    };

    this.start = function () {
        Object.values(this.sharedTopics).forEach((topic) => mqttClient.subscribe(topic));

        mqttClient.onMessage((topic, message) => {
            const mqttMsg = JSON.parse(message); // message is Buffer
            const mqttMsgStr = JSON.stringify(mqttMsg);
            const path = mqttMsg.path;
            const method = mqttMsg.method;

            logger.info(`MQTT: received on topic: ${topic} msg: ${mqttMsgStr}`);

            if (topic === this.topics.bookings) {
                handleBookingsRoute(path, method, mqttMsg);
            } else if (topic === this.topics.appointments) {
                handleAppointmentsRoute(path, method, mqttMsg);
            } else {
                logger.info("MQTT router: unrecognized topic");
            }
        });
    };

    const handleBookingsRoute = (path, method, mqttMsg) => {
        const regexBkn01 = /^\/bookings([^\/]*$)/;      // /bookings
        const regexBkn02 = /^\/bookings\/([^\/]+$)/;    // /bookings/:id
        const regexBkn03 = /^\/bookings\/dentist\/([^\/]+$)/; // /bookings/dentist/:dentistId
                    
        switch(true) {
        case regexBkn01.test(path): 
            logger.info("MQTT router: matched /bookings")
            if (method == "GET") getBookingsHandler(mqttMsg)
            else if (method == "POST") createBookingHandler(mqttMsg)
            break
        case regexBkn02.test(path): 
            logger.info("MQTT router: matched /bookings/:id")
            if (method == "GET") getBookingHandler(mqttMsg)
            else if (method == "PATCH") confirmBookingHanlder(mqttMsg)  
            else if (method == "DELETE") cancelBookingHandler(mqttMsg) 
            break
        case regexBkn03.test(path):
            logger.info("MQTT router: matched /bookings/dentist/:dentistId")
            logger.info(`Path: ${path}, Method: ${method}`)
            if (method == "GET") getBookingsByDentistHandler(mqttMsg)
            break
        default:
            logger.info("MQTT router: path not found")
        }
    }

    const handleAppointmentsRoute = (path, method, mqttMsg) => {
        const regexApptAll = /^\/appointments([^\/]*$)/; // /all appointments
        const regexApptClinic = /^\/appointments\/clinic\/([^\/]+$)/; // /appointments/clinic/:clinicId
        const regexApptDentist = /^\/appointments\/dentist\/([^\/]+$)/; // /appointments/dentist/:dentistId
        const regexApptStatus = /^\/appointments\/status\/([^\/]+$)/; // /appointments/status/:clinicId
        const regexApptId = /^\/appointments\/([^\/]+$)/; // /appointments/:id
        const regextApptAllStatus = /^\/appointments\/status$/; // /appointments/status

        switch (true) {
            case regexApptAll.test(path):
            logger.info("MQTT router: matched /appointments");
            if (method === "GET") getAllAppointmentHandler(mqttMsg);
            else if (method === "POST") createAppointmentHandler(mqttMsg);
            break;

        case regexApptClinic.test(path):
            logger.info("MQTT router: matched /appointments/clinic/:clinicId");
            if (method === "GET") getAppointmentsByClinicHandler(mqttMsg);
            break;

        case regexApptDentist.test(path):
            logger.info("MQTT router: matched /appointments/dentist/:dentistId");
            if (method === "GET") getAppointmentByDentistHandler(mqttMsg);
            break;

        case regexApptStatus.test(path):
            logger.info("MQTT router: matched /appointments/status/:clinicId");
            if (method === "GET") getAppointmentAvailabilityHandler(mqttMsg);
            break;

        case regextApptAllStatus.test(path):
            logger.info("MQTT router: matched /appointments/status");
            if (method === "GET") getAllAppointmentAvailabilityHandler(mqttMsg);
            break;

        case regexApptId.test(path):
            logger.info("MQTT router: matched /appointments/:id");
            if (method === "GET") getAppointmentByIdHandler(mqttMsg);
            else if (method === "PATCH") updateAppointmentHandler(mqttMsg);
            else if (method === "DELETE") deleteAppointmentHandler(mqttMsg);
            break;
            default:
                logger.info("MQTT router: path not found for appointments");
        }
    };
}

module.exports = UnifiedRouter;