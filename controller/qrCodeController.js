const QRCode = require("qrcode");
const QRCodeModel = require('./../model/qrModel');

exports.generateQR = async (req, res) => {
    try {
        const { dynamicUrl } = req.body;
        if (!dynamicUrl) {
            return res.status(400).send({ error: "Dynamic URL is required" });
        }

        const qrCodeUrl = `https://daynamic-qr-code.onrender.com/verifyQr`;

        // Generate QR code
        const qrCode = await QRCode.toDataURL(qrCodeUrl);

        // Save to database
        await QRCodeModel.create({ url: dynamicUrl, img: qrCode });

        res.send({ qrCode, verifyUrl: qrCodeUrl });
    } catch (error) {
        console.log(error);
    }
}

exports.verifyQR = async (req, res) => {
    try {
        const qrRecord = await QRCodeModel.find();

        if (!qrRecord) {
            return res.status(404).send({ error: "QR Code not found" });
        }

        // Redirect to the dynamic URL
        res.redirect(qrRecord[0]?.url);
    } catch (error) {
        console.log(error);

    }
}