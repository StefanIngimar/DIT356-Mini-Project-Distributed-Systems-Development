const express = require("express");
const appointmentRouter = express.Router();
const {
    createAppointmentHandler, 
    updateAppointmentHandler,
    getAppointmentClinicHandler,
    getAppointmentIdHandler,
    getAppointmentDentistHandler,
    getAllAppointmentsHandler,
    cancelAppointmentHandler,
    getAppointmentStatusHandler,
    getAllAppointmentStatusHandler,
} = require("../handlers/appointment.handler");

// appointment endpoints
appointmentRouter.post("/", createAppointmentHandler);
appointmentRouter.get("/clinic/:clinicId", getAppointmentClinicHandler);
appointmentRouter.get("/:appointmentId", getAppointmentIdHandler);
appointmentRouter.get("/dentist/:dentistId", getAppointmentDentistHandler);
appointmentRouter.get("/status", getAllAppointmentStatusHandler);
appointmentRouter.get("/", getAllAppointmentsHandler);
appointmentRouter.get("/status/:clinicId", getAppointmentStatusHandler);
appointmentRouter.patch("/:appointmentId", updateAppointmentHandler);
appointmentRouter.delete("/:appointmentId", cancelAppointmentHandler);

module.exports = appointmentRouter;