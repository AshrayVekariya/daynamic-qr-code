const QRCode = require("qrcode");
const QRCodeModel = require('./../model/qrModel');
const path = require('path');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid'); // Import the uuid library

exports.generateQR = async (req, res) => {
    try {
        const { dynamicUrl } = req.body;

        if (!dynamicUrl) {
            return res.status(400).send({ error: 'Dynamic URL is required' });
        }

        const id = uuidv4().replace(/-/g, '').substring(0, 16);
        const qrCodeUrl = `https://daynamic-qr-code.onrender.com/verifyQr/${id}`;

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
        await QRCodeModel.create({ url: dynamicUrl, img: finalQrCodeUrl, id: id });

        res.send({ finalQrCodeUrl, verifyUrl: qrCodeUrl });
    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).send({ error: 'Failed to generate QR code' });
    }
};

exports.verifyQR = async (req, res) => {
    try {
        const { id } = req.params;
        const qrRecord = await QRCodeModel.findOne({ id });

        if (!qrRecord) {
            return res.status(404).send({ error: "QR Code not found" });
        }

        // Redirect to the dynamic URL
        res.redirect(qrRecord?.url);

    } catch (error) {
        console.log(error);
    }
}

exports.updateQRURL = async (req, res) => {
    try {
        const { id } = req.params;
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'New URL is required' });
        }

        const qr = await QRCodeModel.findOne({ _id: id });
        if (!qr) {
            return res.status(404).json({ error: 'QR Code not found.' });
        }

        qr.url = url;
        await qr.save();

        res.json({ message: 'QR Code updated successfully.' });
    } catch (error) {
        console.log(error);
    }
}

exports.deleteQR = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(404).json({ error: 'QR Code not found.' });
        }

        const qr = await QRCodeModel.findByIdAndDelete({ _id: id });

        if (qr) {
            res.json({ message: 'QR Code delete successfully.' });
        } else {
            res.json({ message: 'Something want wrong!' });
        }
    } catch (error) {
        console.log(error);
    }
}