const express = require("express");
const coreRouter = express.Router();

coreRouter.get("/", function (req, res, next) {
  res.json({ message: "API-gateway. How can I help you?" });
  return;
});

coreRouter.get("/health", (req, res, next) => {
  res.json({ message: "OK!" });
  return;
});

module.exports = coreRouter;
