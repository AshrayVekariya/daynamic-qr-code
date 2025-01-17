const QRCode = require("qrcode");
const QRCodeModel = require('./../model/qrModel');
const path = require('path');
const sharp = require('sharp')

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

exports.generateQR = async (req, res) => {
    try {
        const { dynamicUrl } = req.body;

        if (!dynamicUrl) {
            return res.status(400).send({ error: 'Dynamic URL is required' });
        }

        const qrCodeUrl = `https://daynamic-qr-code.onrender.com/verifyQr`;

        // Generate QR code with high error correction level
        const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl, {
            errorCorrectionLevel: 'H', // High error correction level
            width: 200, // Increase size for better resolution
            margin: 4, // Add margin for better scanning
        });

        // Path to the center image (logo)
        const centerImagePath = path.join(__dirname, './../public/image.svg');

        // Process the center image (resize and add margin)
        const centerImage = await sharp(centerImagePath)
            .resize(30, 30) // Resize logo (20% of QR code size)
            .flatten({ background: { r: 255, g: 255, b: 255 } }) // Add white background
            .extend({
                top: 8,
                bottom: 8,
                left: 8,
                right: 8,
                background: { r: 255, g: 255, b: 255, alpha: 1 }, // White margin around the logo
            })
            .toBuffer();

        // Decode the QR code and get the image buffer
        const qrBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');

        // Overlay the logo onto the QR code
        const qrWithImage = await sharp(qrBuffer)
            .composite([{ input: centerImage, gravity: 'center' }]) // Center the logo
            .toBuffer();

        // Convert the final image to a data URL
        const finalQrCodeUrl = `data:image/png;base64,${qrWithImage.toString('base64')}`;

        // Save to database
        await QRCodeModel.create({ url: dynamicUrl, img: finalQrCodeUrl });

        res.send({ finalQrCodeUrl, verifyUrl: qrCodeUrl });
    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).send({ error: 'Failed to generate QR code' });
    }
};
