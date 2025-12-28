const Tesseract = require('tesseract.js');
const axios = require('axios');
const { VEHICLE_PLATE_REGEX } = require('../utils/constants');

/**
 * Extract vehicle number from image URL
 * @param {string} imageUrl - Cloudinary or any image URL
 * @returns {Promise<{vehicleNo: string|null, confidence: number, rawText: string}>}
 */
const extractVehicleNumber = async (imageUrl) => {
    try {
        console.log('🔍 Starting OCR extraction for:', imageUrl);

        // Download image as buffer
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            timeout: 30000 // 30 second timeout
        });
        const imageBuffer = Buffer.from(response.data);

        // Perform OCR
        const result = await Tesseract.recognize(imageBuffer, 'eng', {
            logger: m => {
                if (m.status === 'recognizing text') {
                    process.stdout.write(`\r🔄 OCR Progress: ${Math.round(m.progress * 100)}%`);
                }
            }
        });

        console.log('\n✅ OCR completed');

        const rawText = result.data.text;
        const confidence = result.data.confidence;

        // Find vehicle number patterns
        const matches = rawText.match(VEHICLE_PLATE_REGEX);

        let vehicleNo = null;
        if (matches && matches.length > 0) {
            // Clean up the match (remove spaces, uppercase)
            vehicleNo = matches[0].replace(/\s/g, '').toUpperCase();
            console.log('🚗 Vehicle number detected:', vehicleNo);
        } else {
            console.log('⚠️ No vehicle number pattern found');
        }

        return {
            vehicleNo,
            confidence: Math.round(confidence),
            rawText: rawText.trim()
        };

    } catch (error) {
        console.error('❌ OCR Error:', error.message);
        return {
            vehicleNo: null,
            confidence: 0,
            rawText: '',
            error: error.message
        };
    }
};

/**
 * Extract vehicle number from image buffer (for direct upload)
 * @param {Buffer} imageBuffer - Image buffer
 * @returns {Promise<{vehicleNo: string|null, confidence: number, rawText: string}>}
 */
const extractFromBuffer = async (imageBuffer) => {
    try {
        console.log('🔍 Starting OCR extraction from buffer');

        const result = await Tesseract.recognize(imageBuffer, 'eng', {
            logger: m => {
                if (m.status === 'recognizing text') {
                    process.stdout.write(`\r🔄 OCR Progress: ${Math.round(m.progress * 100)}%`);
                }
            }
        });

        console.log('\n✅ OCR completed');

        const rawText = result.data.text;
        const confidence = result.data.confidence;

        const matches = rawText.match(VEHICLE_PLATE_REGEX);
        let vehicleNo = null;

        if (matches && matches.length > 0) {
            vehicleNo = matches[0].replace(/\s/g, '').toUpperCase();
            console.log('🚗 Vehicle number detected:', vehicleNo);
        }

        return {
            vehicleNo,
            confidence: Math.round(confidence),
            rawText: rawText.trim()
        };

    } catch (error) {
        console.error('❌ OCR Error:', error.message);
        return {
            vehicleNo: null,
            confidence: 0,
            rawText: '',
            error: error.message
        };
    }
};

/**
 * Validate Indian vehicle number format
 * @param {string} vehicleNo - Vehicle number to validate
 * @returns {boolean}
 */
const isValidVehicleNumber = (vehicleNo) => {
    if (!vehicleNo) return false;

    // Clean the input
    const cleaned = vehicleNo.replace(/\s/g, '').toUpperCase();

    // Check against regex
    const pattern = /^[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{1,4}$/;
    return pattern.test(cleaned);
};

/**
 * Format vehicle number to standard format
 * @param {string} vehicleNo - Vehicle number
 * @returns {string} - Formatted vehicle number (e.g., MH 01 AB 1234)
 */
const formatVehicleNumber = (vehicleNo) => {
    if (!vehicleNo) return '';

    const cleaned = vehicleNo.replace(/\s/g, '').toUpperCase();

    // Try to parse and format
    const match = cleaned.match(/^([A-Z]{2})(\d{1,2})([A-Z]{1,3})(\d{1,4})$/);

    if (match) {
        return `${match[1]} ${match[2].padStart(2, '0')} ${match[3]} ${match[4]}`;
    }

    return cleaned;
};

module.exports = {
    extractVehicleNumber,
    extractFromBuffer,
    isValidVehicleNumber,
    formatVehicleNumber
};
