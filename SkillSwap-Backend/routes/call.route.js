const express = require('express');
const router = express.Router();
const callController = require('../controllers/call.controller');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Start a new call
router.post('/start', callController.startCall);

// Answer a call
router.post('/:callId/answer', callController.answerCall);

// End a call
router.post('/:callId/end', callController.endCall);

// Get active calls
router.get('/active', callController.getActiveCalls);

// Get call history
router.get('/history', callController.getCallHistory);

// Handle WebRTC signaling
router.post('/:callId/signaling', callController.handleSignaling);

module.exports = router;

