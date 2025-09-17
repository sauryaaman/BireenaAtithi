const { v4: uuidv4 } = require('uuid');
const supabase = require('../config/db');

const uploadHotelLogo = async (file) => {
    try {
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `hotel_logos/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('assets')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
            });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: publicURL } = supabase.storage
            .from('assets')
            .getPublicUrl(filePath);

        return publicURL;
    } catch (error) {
        console.error('Error uploading hotel logo:', error);
        throw new Error('Failed to upload hotel logo');
    }
};

module.exports = {
    uploadHotelLogo
};