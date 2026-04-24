const express = require('express');
const router = express.Router();
const bfhlController = require('../controllers/bfhlController');

router.post('/', bfhlController.processBfhl);
router.get('/status/:jobId', bfhlController.getJobStatus);
router.post('/analyze', bfhlController.analyzeGraph);
router.post('/export', bfhlController.exportGraph);

module.exports = router;
