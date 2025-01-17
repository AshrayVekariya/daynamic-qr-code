const express = require('express');
const { generateQR, verifyQR } = require('../controller/qrCodeController');
const router = express.Router();

router.post('/generate', generateQR);

router.get('/verifyQr', verifyQR);

module.exports = router;