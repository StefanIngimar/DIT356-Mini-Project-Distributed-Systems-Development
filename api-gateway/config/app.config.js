const defaultPort = 3000; 
const defaultHostname = "localhost";

const appConfig = {
  port: process.env.API_PORT || defaultPort,
  host: process.env.API_HOST || defaultHostname,
  url: process.env.API_URL || `http://${defaultHostname}:${defaultPort}`,
  routePrefix: process.env.API_PREFIX || "/api/v1", 
  env: process.env.NODE_ENV || 'development',
  mqttBroker: process.env.BROKER_URI || `mqtt://${defaultHostname}`, 
  mqttWsBrokerUri: process.env.BROKER_WS_URI || `ws://${defaultHostname}`, 
  mqttWsBrokerPort: process.env.BROKER_WS_PORT || "9001", 
  seqURI: process.env.SEQ_API_URI || "http://localhost:5341",
  seqAPIKey: process.env.SEQ_API_KEY
};

module.exports = appConfig;