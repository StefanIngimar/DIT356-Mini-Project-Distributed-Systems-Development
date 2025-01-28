class BookingValidationError extends Error {
    constructor(message = 'Booking validation error') {
      super(message);
      this.name = this.constructor.name;
    }
  }
  
  module.exports = BookingValidationError; 