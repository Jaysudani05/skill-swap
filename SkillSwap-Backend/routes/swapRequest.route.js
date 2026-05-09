const express = require('express');
const router = express.Router();
const swapRequestController = require('../controllers/swapRequest.controller');
const auth = require('../middleware/auth'); // Assuming you have auth middleware

// POST /api/swap-requests - Send a new swap request
router.post('/', auth, swapRequestController.sendRequest);

// GET /api/swap-requests - Get swap requests (sent/received/all)
router.get('/', auth, swapRequestController.getSwapRequests);

// PATCH /api/swap-requests/:requestId/respond - Accept or reject a swap request
router.patch('/:requestId/respond', auth, swapRequestController.respondToSwapRequest);

// DELETE /api/swap-requests/:requestId - Cancel a swap request
router.delete('/:requestId', auth, swapRequestController.cancelSwapRequest);

module.exports = router;
