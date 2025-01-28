const express = require("express");

const {
    getUserNotificationsHandler,
    markNotificationAsReadHandler,
} = require("../handlers/notification.handler");

const router = express.Router();

router.get("/:userId", getUserNotificationsHandler);

router.put("/:notificationId", markNotificationAsReadHandler);

module.exports = router;