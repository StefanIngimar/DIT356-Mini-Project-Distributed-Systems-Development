const express = require("express");
const bookingRouter = express.Router();
const {
    createBookingHandler, 
    getBookingsHandler,
    getBookingHandler,
    getBookingsByDentistHandler,
    confirmBookingHandler,
    cancelBookingHandler,
} = require("../handlers/booking.handler");

// booking endpoints 
bookingRouter.post("", createBookingHandler);
bookingRouter.get("", getBookingsHandler);
bookingRouter.get("/:bookingId", getBookingHandler);
bookingRouter.get("/dentist/:dentistId", getBookingsByDentistHandler);
bookingRouter.patch("/:bookingId", confirmBookingHandler);
bookingRouter.delete("/:bookingId", cancelBookingHandler);

module.exports = bookingRouter;
 