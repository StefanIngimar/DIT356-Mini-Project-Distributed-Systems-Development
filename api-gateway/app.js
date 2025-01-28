const express = require("express");
const expressWs = require("express-ws");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");
const { logger } = require("./utils/logging.util"); 
const { gracefulExit, } = require("./utils/process.util"); 
const { errorHandler } = require("./middleware/errorHandler");
const appConfig = require("./config/app.config");
const coreRouter = require("./routers/core.router");
const clinicRouter = require("./routers/clinic.router");
const dentistRouter = require("./routers/dentist.router");
const userRouter = require("./routers/user.router");
const bookingRouter = require("./routers/booking.router");
const appointmentRouter = require("./routers/appointment.router");
const notificationRouter = require("./routers/notification.router");

const { addClientCallback } = require("./routers/ws.router");

const app = express();
expressWs(app);
const routePrefix = appConfig.routePrefix;

// Register middleware and endpoints/routers:

// Parses requests with JSON payloads
app.use(express.json()); 

// Parses requests with urlencoded payloads
app.use(express.urlencoded({ extended: true })); 

// HTTP request logger
app.use(morgan("dev")); 

// Enable cross-origin resource sharing
// Register it before endpoints
app.options("*", cors());
app.use(cors());

// Routers (sub apps)
app.use(routePrefix, coreRouter);
app.use(`${routePrefix}/clinics`, clinicRouter);
app.use(`${routePrefix}/dentists`, dentistRouter);
app.use(routePrefix, userRouter);
app.use(`${routePrefix}/bookings`, bookingRouter);
app.use(`${routePrefix}/appointments`, appointmentRouter);
app.use(`${routePrefix}/notifications`, notificationRouter);

// WebSocket
app.ws(`${routePrefix}/ws`, addClientCallback);

// Handle requests to invalid endpoints
// Register it after all other route handlers 
app.use(`${routePrefix}/*`, (req, res, next) => {
  const error = new Error("Path not found");
  res.status(404);
  next(error);
});

// Register the default error handler middleware 
// Must be after all other middleware and route handlers
app.use(errorHandler);

app.listen(appConfig.port, () => {
  logger.info(`App server listening on port ${appConfig.port}, in ${appConfig.env} mode`);
});

process.on('SIGTERM', gracefulExit);
process.on("SIGINT", gracefulExit);