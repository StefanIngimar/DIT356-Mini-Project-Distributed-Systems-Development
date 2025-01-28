const mongoose = require('mongoose'); 
const Schema = mongoose.Schema;   
const model = mongoose.model; 

// status values: FREE, RESERVED, BOOKED 

// define schema 
const appointmentSchema = new Schema(
  {
    date:  {
      type: Date,
      required: true,
    },
    start_time: {
      type: String,
      required: true,
    },
    end_time: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["FREE", "RESERVED", "BOOKED"],
        required: true,
        default: "FREE",
    },
    clinicId: {
        type: String,
        required: true,
    },
    dentistId: {
        type: String,
        required: true,
    },
  },
  {
    timestamps: true,
  }
);
//compound index to enforce unique start time for the same dentist to prevent double bookings
appointmentSchema.index(
  { dentistId: 1, date: 1, start_time: 1 },
  { unique: true }
);

// create model from schema 
const Appointment = model('Appointment', appointmentSchema);

module.exports = Appointment; 
