const express = require('express');
const router = express.Router();

const qrRouter = require('./qrRouter');

router.use('/', qrRouter);

module.exports = router;

