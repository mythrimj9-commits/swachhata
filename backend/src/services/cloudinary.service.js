const cloudinary = require('../config/cloudinary');
const { CLOUDINARY_FOLDERS } = require('../utils/constants');

/**
 * Upload image to Cloudinary
 * @param {Object} file - Multer file object with buffer
 * @param {string} folder - Folder name in Cloudinary
 */
const uploadImage = async (file, folder = CLOUDINARY_FOLDERS.COMPLAINTS) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'image',
                transformation: [
                    { quality: 'auto:good' },
                    { fetch_format: 'auto' }
                ]
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    reject(error);
                } else {
                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id,
                        width: result.width,
                        height: result.height,
                        format: result.format,
                        size: result.bytes
                    });
                }
            }
        );

        uploadStream.end(file.buffer);
    });
};

/**
 * Upload image from URL
 */
const uploadFromUrl = async (imageUrl, folder = CLOUDINARY_FOLDERS.COMPLAINTS) => {
    try {
        const result = await cloudinary.uploader.upload(imageUrl, {
            folder,
            resource_type: 'image',
            transformation: [
                { quality: 'auto:good' },
                { fetch_format: 'auto' }
            ]
        });

        return {
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            size: result.bytes
        };
    } catch (error) {
        console.error('Cloudinary URL upload error:', error);
        throw error;
    }
};

/**
 * Delete image from Cloudinary
 */
const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result.result === 'ok';
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw error;
    }
};

/**
 * Get image URL with transformations
 */
const getTransformedUrl = (publicId, options = {}) => {
    const defaultOptions = {
        width: 800,
        height: 600,
        crop: 'limit',
        quality: 'auto',
        fetch_format: 'auto'
    };

    return cloudinary.url(publicId, { ...defaultOptions, ...options });
};

/**
 * Get thumbnail URL
 */
const getThumbnailUrl = (publicId, width = 200, height = 200) => {
    return cloudinary.url(publicId, {
        width,
        height,
        crop: 'thumb',
        gravity: 'auto',
        quality: 'auto',
        fetch_format: 'auto'
    });
};

module.exports = {
    uploadImage,
    uploadFromUrl,
    deleteImage,
    getTransformedUrl,
    getThumbnailUrl
};
