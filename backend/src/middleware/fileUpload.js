const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
}).single('file');

const processFileUpload = (req, res, next) => {
    try {
        upload(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ message: err.message });
            } else if (err) {
                return res.status(400).json({ message: 'Error uploading file: ' + err.message });
            }
            
            // Handle base64 image if provided
            if (req.body.hotel_logo && req.body.hotel_logo.startsWith('data:image/')) {
                req.file = req.body.hotel_logo;
                return next();
            }

            // If no file was uploaded and no logo URL, just continue
            if (!req.file && !req.body.hotel_logo_url) {
                return next();
            }

            // If we got a file through multer, prepare it for cloudinary
            if (req.file) {
                const base64String = req.file.buffer.toString('base64');
                const mimeType = req.file.mimetype;
                req.file = `data:${mimeType};base64,${base64String}`;
            }

            next();
        });
    } catch (error) {
        console.error('File processing error:', error);
        return res.status(400).json({ message: 'Error processing file upload' });
    }
};

module.exports = processFileUpload;