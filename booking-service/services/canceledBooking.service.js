const canceledBookingModel = require("../models/canceledBooking.model");
 
async function createCanceledBooking(bookingData) {
  return await canceledBookingModel.create(bookingData);
}

module.exports = {
    createCanceledBooking,
};
  