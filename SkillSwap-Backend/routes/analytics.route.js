const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analytics.controller");
const auth = require("../middleware/auth");

// GET /api/analytics - returns stats and recent activity for current user
router.get("/", auth, analyticsController.getAnalytics);

module.exports = router;
