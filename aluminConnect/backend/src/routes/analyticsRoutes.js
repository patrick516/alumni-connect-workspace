const express = require("express");
const analyticsController = require("../controllers/analyticsController");

const router = express.Router();

// Public — no authenticate/authorize middleware, matches the
// public-facing Dashboard's requirements.
router.get("/overview", analyticsController.getPublicAnalytics);

module.exports = router;
