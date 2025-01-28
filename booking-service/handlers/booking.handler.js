const { nanoid } = require("nanoid");
const { logger, } = require("../utils/logging.util");
const mqttClient = require("../mqtt/mqttClient");
const { 
  prepareErrorResponse, 
  prepareErrorResponsePayload, 
} = require("../utils/error.util");
const { isDocExistent, paginate } = require("../utils/mongoose.util");
const { 
  createBooking, 
  getBookings,
  getBooking,
  getBookingsByDentist,
  updateBooking,
  getAndDeleteBooking,
  getBookingsCount,
} = require("../services/booking.service");
const { createCanceledBooking, } = require("../services/canceledBooking.service");
const { 
  updateAppointment, 
} = require("../services/appointment.service");
const { fetchPatients, fetchPatient } = require("../services/user.service");
const { fetchDentists, fetchDentist } = require("../services/dentist.service");
const { fetchClinics, fetchClinic } = require("../services/dentist.service");

const outgoingTopic = "dit356g2/bookings/res";

async function createBookingHandler(mqttReq) {
  try { 
    const bookingData = mqttReq.data;
    logger.info(`Booking to create: ${JSON.stringify(bookingData)}`);
    const booking = await createBooking(bookingData);
    
    const responsePayload = {
      msgId: mqttReq.msgId,
      status: 201,
      data: booking,
    };

    mqttClient.publish(outgoingTopic, responsePayload); 
    
    logger.info(`Updating status of AP '${bookingData.timeslot}' to RESERVED`);
    updateAppointment(bookingData.timeslot, {status: "RESERVED"});
  }
  catch (error) { 
    const errorObject = prepareErrorResponse(error);
    const responsePayload = prepareErrorResponsePayload(mqttReq, errorObject);
    mqttClient.publish(outgoingTopic, responsePayload);
  } 
}

async function getBookingsHandler(mqttReq) { 
  try {
    const pageNum = parseInt(mqttReq.query?.page, 10) || 1;
    const bookingsPerPage = parseInt(mqttReq.query?.limit, 10) || 10;
    const totalBookings = await getBookingsCount();
    const [skipTo, totalPages, currentPage] = paginate(totalBookings, pageNum, bookingsPerPage);
    let bookings = new Array();

    if (totalBookings) {

      const sortOptions = [];
      const sortQuery = mqttReq.query.sortBy;
      if (sortQuery) {
        const sortByTokens = sortQuery.split(":");
        sortOptions.push(sortByTokens);
      } else {
        sortOptions.push(["createdAt", "desc"]);
      }

      let searchOptions = {};
      const searchQuery = mqttReq.query.search;
      if (searchQuery) {
        const searchTokens = searchQuery.split(":");
        for (let i=0; i <= searchTokens.length-2; i++) {
          searchOptions[searchTokens[i]] = {$regex: new RegExp(searchTokens[++i])};
        }
      }

      bookings = await getBookings(skipTo, bookingsPerPage, sortOptions, searchOptions);

      const asyncTasks = [
        fetchPatients(),
        fetchDentists(),
        fetchClinics(),
      ];

      // run async tasks in parallel (without fail-fast behavior)
      const [patientsPrmRes, dentistsPrmRes, clinicsPrmRes] = await Promise.allSettled(asyncTasks);

      bookings.map( async (booking) => {
        if (patientsPrmRes.value) {
          const matchedPatient = patientsPrmRes.value.find(patient => patient.id === booking.patient);
          if (matchedPatient) { booking.patient = matchedPatient; }
        }

        if (dentistsPrmRes.value) {
          const matchedDentist = dentistsPrmRes.value.find(dentist => dentist.id === booking.timeslot.dentistId);
          if (matchedDentist) { booking.timeslot.dentistId = matchedDentist; }
        }

        if (clinicsPrmRes.value) {
          const matchedClinic = clinicsPrmRes.value.find(clinic => clinic.id === booking.timeslot.clinicId);
          if (matchedClinic) { booking.timeslot.clinicId = matchedClinic; }
        }
      });
    }
    
    const responsePayload = {
      msgId: mqttReq.msgId,
      status: 200,
      data: {
        currentPage: currentPage, 
        totalPages: totalPages,
        bookingsPerPage: bookingsPerPage,
        totalBookings: totalBookings,
        bookings: bookings,
      }
    };
    
    mqttClient.publish(outgoingTopic, responsePayload);
  } 
  catch (error) {
    const errorObject = prepareErrorResponse(error);
    const responsePayload = prepareErrorResponsePayload(mqttReq, errorObject);
    mqttClient.publish(outgoingTopic, responsePayload);
  }
}

async function getBookingsByDentistHandler(mqttReq) {
  try {
    const dentistId = mqttReq.path.split("/")[3];
    logger.info(`Extracted dentist ID: ${dentistId}`);
    if (!dentistId) {
      throw new Error("Dentist ID is required.");
    }

    const pageNum = parseInt(mqttReq.query?.page, 10) || 1;
    const bookingsPerPage = parseInt(mqttReq.query?.limit, 10) || 10;
    const sortOptions = mqttReq.query.sortBy
      ? [[mqttReq.query.sortBy.split(":")[0], mqttReq.query.sortBy.split(":")[1]]]
      : [["createdAt", "desc"]];

    const skipTo = (pageNum - 1) * bookingsPerPage;

    const bookings = await getBookingsByDentist(dentistId, skipTo, bookingsPerPage, sortOptions);

    logger.info(`Total bookings for dentist ${dentistId}: ${bookings.length}`);
    
    const filteredBookings = bookings.filter((booking) => booking.timeslot !== null);

    const patients = await fetchPatients();
    const enrichedBookings = filteredBookings.map((booking) => {
      const patient = patients.find((p) => p.id === booking.patient) || {};
      return{
        ...booking,
        patient: {
          id: booking.patient,
          first_name: patient.first_name,
          last_name: patient.last_name,
        },
      };
    });

    const responsePayload = {
      msgId: mqttReq.msgId,
      status: 200,
      data: {
        currentPage: pageNum,
        totalPages: Math.ceil(enrichedBookings.length / bookingsPerPage),
        bookingsPerPage,
        totalBookings: enrichedBookings.length,
        bookings: enrichedBookings,
      },
    };

    mqttClient.publish(outgoingTopic, responsePayload);
  } catch (error) {
    const errorObject = prepareErrorResponse(error);
    const responsePayload = prepareErrorResponsePayload(mqttReq, errorObject);
    mqttClient.publish(outgoingTopic, responsePayload);
  }
}

async function getBookingHandler(mqttReq) { 
  try {
    const bookingId = mqttReq.path.split("/")[2];
    const booking = await getBooking(bookingId);
    isDocExistent(booking, mqttReq.path); // might throw NotFoundError 

    // convert Mongoose Query object to JS native object:
    //const booking = bookingQry.toObject(); 

    const asyncTasks = [
      fetchPatient(booking.patient),
      fetchDentist(booking.timeslot.dentistId),
      fetchClinic(booking.timeslot.clinicId),
    ];

    // run async tasks in parallel (without fail-fast behavior)
    const [patientPrmRes, dentistPrmRes, clinicPrmRes] = await Promise.allSettled(asyncTasks);

    booking.patient = patientPrmRes.value || booking.patient;
    booking.timeslot.dentistId = dentistPrmRes.value || booking.timeslot.dentistId;
    booking.timeslot.clinicId = clinicPrmRes.value || booking.timeslot.clinicId;

    const responsePayload = {
      msgId: mqttReq.msgId,
      status: 200,
      data: booking,
    };
    
    mqttClient.publish(outgoingTopic, responsePayload);
  } 
  catch (error) {
    const errorObject = prepareErrorResponse(error);
    const responsePayload = prepareErrorResponsePayload(mqttReq, errorObject);
    mqttClient.publish(outgoingTopic, responsePayload);
  }
}

async function updateBookingHandler(mqttReq, bookingData) { 
  try {
    const bookingId = mqttReq.path.split("/")[2];
    let booking = await updateBooking(bookingId, bookingData);
    isDocExistent(booking, mqttReq.path);

    const responsePayload = {
      msgId: mqttReq.msgId,
      status: 200,
      data: booking,
    };
    
    mqttClient.publish(outgoingTopic, responsePayload);
  } 
  catch (error) {
    const errorObject = prepareErrorResponse(error);
    const responsePayload = prepareErrorResponsePayload(mqttReq, errorObject);
    mqttClient.publish(outgoingTopic, responsePayload);
  }
}

async function confirmBookingHanlder(mqttReq) { 
  const bookingPatchData = { status: "CONFIRMED" };
  updateBookingHandler(mqttReq, bookingPatchData);
}

async function cancelBookingHandler(mqttReq) { 
  try {
    const bookingId = mqttReq.path.split("/")[2];
    let deletedBooking = await getAndDeleteBooking(bookingId);
    isDocExistent(deletedBooking, mqttReq.path);

    const canceledBooking = await createCanceledBooking(deletedBooking);
    
    const responsePayload = {
      msgId: mqttReq.msgId,
      status: 200,
      data: canceledBooking,
    };

    mqttClient.publish(outgoingTopic, responsePayload);
 
    logger.info(`Updating status of AP '${deletedBooking.timeslot}' to FREE`);
    updateAppointment(deletedBooking.timeslot, {status: "FREE"});
  }
  catch (error) { 
    const errorObject = prepareErrorResponse(error);
    const responsePayload = prepareErrorResponsePayload(mqttReq, errorObject);
    mqttClient.publish(outgoingTopic, responsePayload);
  } 
}

module.exports = {
  createBookingHandler,
  getBookingsHandler,
  getBookingsByDentistHandler,
  getBookingHandler,
  updateBookingHandler,
  confirmBookingHanlder,
  cancelBookingHandler,
};