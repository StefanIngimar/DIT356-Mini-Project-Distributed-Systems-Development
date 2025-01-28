// status code 404
class NotFoundError extends Error {
    constructor(message = 'Resource not found') {
      super(message);
      this.name = this.constructor.name;
    }
  }
  
  module.exports = NotFoundError; 