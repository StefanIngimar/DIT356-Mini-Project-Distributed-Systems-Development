
const UnifiedRouter = require("./mqtt/mqttRouter");
const { gracefulExit, } = require("./utils/process.util"); 
const { openDbConnection } = require("./database/db");
const appConfig = require("./config/app.config");

const bookingRouter = new UnifiedRouter();

openDbConnection(appConfig.mongoURI);

bookingRouter.start();

process.on('SIGTERM', gracefulExit);
process.on("SIGINT", gracefulExit);