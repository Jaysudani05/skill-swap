require("dotenv").config();

const express = require("express"); 
const authMiddleware = require("../middleware/auth");
const authController = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register",authController.register);
router.post("/login",authController.login);
router.get("/logout",authController.logout);
router.get("/me",authMiddleware,authController.checkAuth);

module.exports = router;