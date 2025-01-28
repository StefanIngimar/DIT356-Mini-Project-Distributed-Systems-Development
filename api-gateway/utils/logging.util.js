const winston = require('winston');
const { SeqTransport } = require('@datalust/winston-seq');
const os = require("os");
const appConfig = require("../config/app.config");

/*
 * Log levels: error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 *  Winston will log only levels less than or equal to the specified level 
 * 
 * winston.format.combine is required to get errors to log with stack traces. 
 *  See https://github.com/winstonjs/winston/issues/1498
 * 
 * The API Gateway is running as replicas, and have unique IDs as hostnames by default.
 * Appending this unique ID to 'api-gateway-<ID>' to identify the service instance in 
 * Seq logging service. 
 */
 
const hostname = os.hostname();

const logger = winston.createLogger({
    level: 'info', 
    format: winston.format.combine(  
      winston.format.errors({ stack: true }),
      winston.format.json(),
    ),
    defaultMeta: { service: `api-gateway-${hostname}` },  
    transports: [
      //new winston.transports.Console(),
      //new winston.transports.File({ filename: 'combined.log' }),
      new SeqTransport({
        serverUrl: appConfig.seqURI,
        apiKey: appConfig.seqAPIKey,
        onError: (e => { console.error(`Winston SeqTransport: ${e}`) }),
        handleExceptions: true,
        handleRejections: true,
      }), 
    ],
    exitOnError: false, 
});

/* 
 * If we're not in production then log to the `console` with the format:
 *  `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
 */
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

module.exports = {
  logger, 
};
