const mongoose = require('mongoose'); 
const Schema = mongoose.Schema;   
const model = mongoose.model; 

// define schema 
const bookingSchema = new Schema(
  {
    status:  {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELED"],
      required: true,
      default: "PENDING",
    },
    timeslot: { 
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      unique: true
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
const Booking = model('Booking', bookingSchema);

module.exports = Booking; 
