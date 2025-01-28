const express = require("express");

const {
  getUsersHandler,
  getUserHandler,
  getUserPreferencesHandler,
  registerUserHandler,
  loginHandler,
  validateJwtTokenHandler,
  addUserPreference,
  addTimeSlotToUserPreference,
  updateUserPreference,
  removeUserPreference,
} = require("../handlers/user.handler");

const router = express.Router();

router.get("/users", getUsersHandler);
router.get("/users/:userId", getUserHandler);
router.get("/users/:userId/preferences", getUserPreferencesHandler);

router.post("/login", loginHandler);
router.post("/users", registerUserHandler);
router.post("/users/:userId/jwt", validateJwtTokenHandler);
router.post("/users/:userId/preferences", addUserPreference);
router.post(
  "/users/:userId/preferences/:preferenceId/time-slots",
  addTimeSlotToUserPreference
);

router.patch("/users/:userId/preferences/:preferenceId", updateUserPreference);

router.delete("/users/:userId/preferences/:preferenceId", removeUserPreference);

module.exports = router;
