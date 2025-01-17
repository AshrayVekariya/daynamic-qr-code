const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    url: { type: String, required: true },
    img: { type: String, required: true },
});

module.exports = mongoose.model('QRCode', qrCodeSchema);
