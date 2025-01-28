const BookingValidationError = require("../errors/validation.error");

function isDateInPast(appointmentDate, startTime) {
  const nowTimestampMs = Date.now();
  const apTimestampMs = Date.parse(`${appointmentDate}T${startTime}`)

  return apTimestampMs < nowTimestampMs;
}

const hrsInAdvance = 24;
function isValidInAdvance(appointmentDate, startTime) {
  const nowDate = new Date(Date.now());
  const hrsInAdvanceTimestampMs = nowDate.setUTCHours(nowDate.getUTCHours() + hrsInAdvance);
  const apTimestampMs = Date.parse(`${appointmentDate}T${startTime}`);
  return apTimestampMs > hrsInAdvanceTimestampMs;
}

function validateBooking(appointmentDate, startTime) {
  if (isDateInPast(appointmentDate, startTime)) {
    throw new BookingValidationError("Cannot book a timeslot in the past");
  }

  if (!isValidInAdvance(appointmentDate, startTime)) {
    throw new BookingValidationError(`Cannot book a timeslot with less than ${hrsInAdvance} in advance`);
  }
}

module.exports = {
  validateBooking,
};