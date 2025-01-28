const appConfig = {
  env: process.env.NODE_ENV || 'development',
  mqttBroker: process.env.BROKER_URI || "mqtt://localhost",
  mongoURI: process.env.MONGODB_URI || "mongodb://localhost:27017/BookingServiceDev",
  seqURI: process.env.SEQ_API_URI || "http://localhost:5341",
  seqAPIKey: process.env.SEQ_API_KEY
};

module.exports = appConfig;