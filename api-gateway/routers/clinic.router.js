const express = require("express");
const clinicRouter = express.Router();
const {
    getClinicsHandler,
    getClinicHandler,
    createClinicHandler,
    updateClinicHandler,
    deleteClinicHandler,
    createDentistForClinicHandler,
    getDentistsForClinicHandler, 
    getDentistForClinicHandler,
    updateDentistForClinicHandler,
    deleteDentistForClinicHandler, 
} = require("../handlers/clinic.handler");

// clinics endpoints 
clinicRouter.post("", createClinicHandler);
clinicRouter.get("", getClinicsHandler);
clinicRouter.get("/:clinicId", getClinicHandler);
clinicRouter.put("/:clinicId", updateClinicHandler);
clinicRouter.delete("/:clinicId", deleteClinicHandler);

clinicRouter.post("/:clinicId/dentists", createDentistForClinicHandler);
clinicRouter.get("/:clinicId/dentists", getDentistsForClinicHandler);
clinicRouter.get("/:clinicId/dentists/:dentistId", getDentistForClinicHandler);
clinicRouter.put("/:clinicId/dentists/:dentistId", updateDentistForClinicHandler);
clinicRouter.delete("/:clinicId/dentists/:dentistId", deleteDentistForClinicHandler);

module.exports = clinicRouter;
 