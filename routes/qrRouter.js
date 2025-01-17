const express = require('express');
const { generateQR, verifyQR, updateQRURL, deleteQR } = require('../controller/qrCodeController');
const router = express.Router();

router.post('/generate', generateQR);

router.get('/verifyQr/:id', verifyQR);

router.put('/updateUrl/:id', updateQRURL);

router.delete('/deleteQr/:id', deleteQR);

module.exports = router;