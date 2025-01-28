const mongoose = require('mongoose'); 
const Schema = mongoose.Schema;   
const model = mongoose.model; 

// define schema 
const canceledBookingSchema = new Schema(
  {
    status:  {
      type: String,
      enum: ["CANCELED"],
      required: true,
      default: "CANCELED",
    },
    timeslot: {
      type: String,
      required: true,
    },
    patient: {
        type: String,
        required: true,
    }
  },
  {
    timestamps: true,
  }
);

// create model from schema 
const CanceledBooking = model('CanceledBooking', canceledBookingSchema);

module.exports = CanceledBooking; 
