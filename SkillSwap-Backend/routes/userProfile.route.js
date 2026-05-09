const express = require("express");
const userProfileController = require("../controllers/userprofile.controller");
const router = express.Router();
const auth = require("../middleware/auth");

// Basic Profile Routes
router.post('/create',auth, userProfileController.createProfile);
router.get('/user/:userId',auth, userProfileController.getProfileByUserId);
router.get('/profile/:id',auth, userProfileController.getProfileById);
router.put('/user/:userId',auth, userProfileController.updateProfile);
router.delete('/user/:userId',auth, userProfileController.deleteProfile);

// Public Profiles Route
router.get('/public', userProfileController.getPublicProfiles);

// Experience Routes
router.post("/user/:userId/experience", auth, userProfileController.addExperience);
router.put('/user/:userId/experience/:experienceId', auth, userProfileController.updateExperience);
router.delete('/user/:userId/experience/:experienceId', auth, userProfileController.removeExperience);

// Education Routes
router.post('/user/:userId/education', auth, userProfileController.addEducation);
router.put('/user/:userId/education/:educationId', auth, userProfileController.updateEducation);
router.delete('/user/:userId/education/:educationId', auth, userProfileController.removeEducation);

// Time Credits Routes
router.put('/user/:userId/time-credits', auth, userProfileController.updateTimeCredits);

// Profile Visibility Routes
router.put('/user/:userId/toggle-visibility', auth, userProfileController.toggleProfileVisibility);

module.exports = router;

