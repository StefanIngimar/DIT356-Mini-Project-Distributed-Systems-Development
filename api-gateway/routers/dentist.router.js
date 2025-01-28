const express = require("express");

const {
  getDentistsHandler,
  getDentistFromUserIdHandler,
  getDentistHandler,
  getDentistWithClinicsHandler,
} = require("../handlers/dentist.handler");

const router = express.Router();

router.get("/", getDentistsHandler);
router.get("/:dentistId", getDentistHandler);
router.get("/users/:userId", getDentistFromUserIdHandler);
router.get("/:dentistId/clinics", getDentistWithClinicsHandler);

module.exports = router;
