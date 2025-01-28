
const mongoose = require("mongoose");
const NotFoundError = require("../errors/notFound.error");

function prepareErrorResponse(error) {
    const MONGODB_UNIQUE_CONSTRAINT_VIOLATION_CODE = 11000;
  
    function prepareErrorObject(statusCode, message, details) {
      return {
        statusCode: statusCode,
        message: message,
        details: details,
      };
    }
  
    let errorObject = prepareErrorObject(
      500,
      "Something went wrong",
      error.message,
    );
  
    if (error instanceof mongoose.Error.ValidationError) {
      errorObject = prepareErrorObject(
        400,
        "Invalid data provided",
        error.errors.map((error) => ({
          message: error.message,
        })),
      );
    } else if (error instanceof mongoose.Error.CastError) {
      errorObject = prepareErrorObject(
        400,
        "Could not cast a value",
        `Invalid value pair at ${error.path} to ${error.value}`,
      );
    } else if (error instanceof NotFoundError) {
      errorObject = prepareErrorObject(
        404,
        "Record not found",
        error.message,
      );
    } else if (error.code === MONGODB_UNIQUE_CONSTRAINT_VIOLATION_CODE) {
      let bookingDuplMsg = ""; 
      let bookingDuplDetailMsg = "";

      if (error.keyValue.timeslot) {
        bookingDuplMsg = "Booking unsuccessful";
        bookingDuplDetailMsg = "Booking timeslot is no longer available"
      }

      errorObject = prepareErrorObject(
        400,
        bookingDuplMsg || "Unique constraint was violated",
        bookingDuplDetailMsg || error.keyValue,
      );
    }  
    
    return errorObject;
}

function prepareErrorResponsePayload(mqttReq, errorObject) {
    return {
        msgId: mqttReq.msgId,
        status: errorObject.statusCode,
        data: {
          message: errorObject.message,
          details: errorObject.details
        }
    };
}

module.exports = {
    prepareErrorResponse, 
    prepareErrorResponsePayload, 
};