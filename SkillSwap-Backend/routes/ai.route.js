const express = require("express");
const aiController = require("../controllers/ai.controller");
const auth = require("../middleware/auth");

const router = express.Router();

// POST /api/ai/match-skills  (auth required — we need req.user to find their profile)
router.post("/match-skills", auth, aiController.matchSkills);

module.exports = router;
