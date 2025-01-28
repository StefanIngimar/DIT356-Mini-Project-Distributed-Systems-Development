const appointmentModel = require('../models/appointment.model');
const { logger } = require("../utils/logging.util");

async function createAppointment(appointmentData) {
    logger.info(`Received appointment data for creation: ${JSON.stringify(appointmentData)}`);

    const { dentistId, date, start_time, end_time } = appointmentData;

    if (!dentistId || !date || !start_time || !end_time) {
        throw new Error("Invalid appointment data: missing required fields");
    }

    // check for double bookings by dentists
    logger.info("Checking for overlapping appointments...");
    const existingAppointment = await appointmentModel.findOne({
        dentistId,
        date,
        $or: [
            { start_time: { $lt: end_time }, end_time: { $gt: start_time } },
        ],
    });

    if (existingAppointment) {
        logger.info(`Conflict detected: ${JSON.stringify(existingAppointment)}`);
        throw new Error(
            `Dentist is already booked during this timeslot: ${existingAppointment.start_time} - ${existingAppointment.end_time}`
        );
    }
    logger.info("No conflicts found. Creating appointment...");
    return await appointmentModel.create(appointmentData);
}

async function getAllAppointments() {
    return await appointmentModel.find({}, "-__v").exec();
}

async function getAppointmentByDentist(dentistId) {
    logger.info(`Querying appointments for dentistId: ${dentistId}`);
    const appointments = await appointmentModel.find({ dentistId }, "-__v").lean();

    if (!appointments || appointments.length === 0) {
        logger.info(`No appointments found for dentistId: ${dentistId}`);
        return {};
    }
    const result = {};
    appointments.forEach((appointment) => {
        const { _id: appointmentId, date, start_time, end_time, status } = appointment;

        if (!result[date]) {
            result[date] = [];
        }
        result[date].push({
            appointmentId,
            start_time,
            end_time,
            status,
        });
    });

    return result;
}

async function getAppointmentByClinic(clinicId) {
    logger.info(`Querying appointments for clinicId: ${clinicId}`);
    const appointments = await appointmentModel.find({ clinicId }, "-__v").lean();

    if (!appointments || appointments.length === 0) {
        logger.info(`No appointments found for clinicId: ${clinicId}`);
        return {};
    }
    const result = {
        clinicId,
        dentists: [],
    };

    const groupedByDentist = {};
    appointments.forEach((appointment) => {
        const { _id: appointmentId, dentistId, date, start_time, end_time, status } = appointment;

        if (!groupedByDentist[dentistId]) {
            groupedByDentist[dentistId] = [];
        }
        groupedByDentist[dentistId].push({
            appointmentId,
            date,
            start_time,
            end_time,
            status,
        });
    });

    for(const [dentistId, time_slots] of Object.entries(groupedByDentist)) {
        result.dentists.push({
            dentistId,
            time_slots,
        });
    }

    return result;
}

async function getAppointmentAvailability(clinicId){
    logger.info(`Fetching appointment availability for clinicId: ${clinicId}`);

    const appointments = await appointmentModel.find({ clinicId }, "-__v").lean();

    if(!appointments || appointments.length === 0) {
        logger.info(`No availability found for clinicId: ${clinicId}`);
        return {};
    }

    const totalAppointments = appointments.length;
    const freeAppointments = appointments.filter(appointment => appointment.status === 'FREE').length;

    const freePercentage = (freeAppointments / totalAppointments) * 100;

    let availabilityStatus;
    if(freePercentage > 80) {
        availabilityStatus = 'HIGH';
    } else if (freePercentage > 40) {
        availabilityStatus = 'MEDIUM';
    } else {
        availabilityStatus = 'LOW';
    }

    logger.info(`Calculated availability status: ${availabilityStatus}`);

    return {
        clinicId,
        totalAppointments,
        freeAppointments,
        freePercentage,
        availabilityStatus
    };
}

async function getAllAppointmentAvailability() {
    logger.info(`Fetching appointment availability for all clinics`);

    const appointments = await appointmentModel.find({}, "-__v").lean();
    logger.info(`Fetched appointments: ${JSON.stringify(appointments)}`);

    if (!appointments.length) {
        logger.info(`No availability found for any clinic`);
        return [];
    }

    const clinicStatus = appointments.reduce((status, { clinicId, status: appointmentStatus }) => {
        if (!status[clinicId]) {
            status[clinicId] = { total: 0, free: 0 };
        }
        status[clinicId].total += 1;
        if (appointmentStatus === "FREE") {
            status[clinicId].free += 1;
        }
        return status;
    }, {});

    logger.info(`Grouped clinics: ${JSON.stringify(clinicStatus)}`);

    const availability = Object.entries(clinicStatus).map(([clinicId, { total, free }]) => {
        const freePercentage = (free / total) * 100;
        const availabilityStatus =
            freePercentage > 80 ? "HIGH" : freePercentage > 40 ? "MEDIUM" : "LOW";

        return {
            clinic_id: clinicId,
            availability_status: availabilityStatus,
        };
    });

    logger.info(`Final availability data: ${JSON.stringify(availability)}`);
    return availability;
}

async function getAppointmentById(appointmentId) {
    return await appointmentModel
        .findOne({ _id: appointmentId }, "-__v")
        .exec();
}

async function updateAppointment(appointmentId, appointmentData) {
    await appointmentModel.updateOne(
        { _id: appointmentId },
        appointmentData
    );
    return await appointmentModel
        .findOne({ _id: appointmentId }, "-__v")
        .exec();
}

async function deleteAppointment(appointmentId) {
    return await appointmentModel.deleteOne({ _id: appointmentId });
}

module.exports = {
    createAppointment,
    getAllAppointments,
    getAppointmentByClinic,
    getAppointmentById,
    getAppointmentByDentist,
    updateAppointment,
    deleteAppointment,
    getAppointmentAvailability,
    getAllAppointmentAvailability,
};
