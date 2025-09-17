const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for temporary storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
}).single('logo'); // 'logo' is the field name

// Upload handler function
const handleUpload = (req, res, next) => {
    // console.log('Starting file upload process...');
    // console.log('Request body:', req.body);
    
    upload(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            // console.error('Multer error:', err);
            return res.status(400).json({ message: `File upload error: ${err.message}` });
        } else if (err) {
            // console.error('Other upload error:', err);
            return res.status(400).json({ message: err.message });
        }

        // If no file was uploaded, just continue
        if (!req.file) {
   
            return next();
        }

     

        try {
            // Convert buffer to base64
            const fileBuffer = req.file.buffer;
            const fileType = req.file.mimetype;
            const base64String = `data:${fileType};base64,${fileBuffer.toString('base64')}`;

            // Upload to Cloudinary
            const uploadResult = await cloudinary.uploader.upload(base64String, {
                folder: 'hotel_logos',
                resource_type: 'auto'
            });

           
            
            // Add the Cloudinary URL to the request
            req.logoUrl = uploadResult.secure_url;
            next();
        } catch (error) {
            //console.error('Cloudinary upload error:', error);
            return res.status(400).json({ message: 'Error uploading file to cloud storage' });
        }
    });
};

module.exports = {
    handleUpload
};
