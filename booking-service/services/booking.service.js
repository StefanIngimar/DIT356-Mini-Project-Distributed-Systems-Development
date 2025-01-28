const bookingModel = require("../models/booking.model");
 
async function createBooking(bookingData) {
  return await bookingModel.create(bookingData);
}

async function getBookings(skipTo, bookingsPerPage, sortOptions, searchOptions) {
  return await bookingModel
    .find(searchOptions, "-__v")
    .populate("timeslot")
    .sort(sortOptions)
    .skip(skipTo)
    .limit(bookingsPerPage)
    .lean();
}

async function getBookingsByDentist(dentistId, skipTo, bookingsPerPage, sortOptions) {
  return await bookingModel
    .find({}, "-__v")
    .populate({
      path: "timeslot",
      match: { dentistId },
    })
    .sort(sortOptions || [["createdAt", "desc"]])
    .skip(skipTo || 0)
    .limit(bookingsPerPage || 10)
    .lean();
}


async function getBookingsCount() {
  return await bookingModel.countDocuments().lean();
}

async function getBooking(bookingId) {
  return await bookingModel
    .findOne({ _id: bookingId }, "-__v")
    .populate("timeslot")
    .lean();
}

async function updateBooking(bookingId, bookingData) {
  await bookingModel.updateOne({ _id: bookingId }, bookingData);
  return await bookingModel.findOne({ _id: bookingId }, "-__v").lean();
}

async function deleteBooking(bookingId) {
  return await bookingModel.deleteOne({ _id: bookingId });
}

async function getAndDeleteBooking(bookingId) {
  return await bookingModel
    .findByIdAndDelete(bookingId)
    .select("timeslot patient -_id")
    .lean();
}

module.exports = {
  createBooking,
  getBookings,
  getBookingsByDentist,
  getBookingsCount,
  getBooking,
  updateBooking,
  deleteBooking,
  getAndDeleteBooking,
};
