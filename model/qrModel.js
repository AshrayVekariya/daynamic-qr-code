const mongoose = require("mongoose");

const qrSchema = new mongoose.Schema(
    {
        url: String,
        img: String,
    },
    {
        timestamps: true
    }
);

const QRCodeModel = mongoose.model("QRCode", qrSchema);

module.exports = QRCodeModel;