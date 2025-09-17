const validateGSTNumber = (gstNumber) => {
    // GST number format: 22AAAAA0000A1Z5
    const gstPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstPattern.test(gstNumber);
};

const validatePinCode = (pinCode) => {
    // Indian PIN code format: 6 digits
    const pinPattern = /^[1-9][0-9]{5}$/;
    return pinPattern.test(pinCode);
};

const validateHotelDetails = (req, res, next) => {
    const {
        gst_number,
        pin_code,
        address_line1,
        city,
        state,
        country
    } = req.body;

    // If any hotel detail is provided, validate all required fields
    if (gst_number || pin_code || address_line1) {
        if (!address_line1) {
            return res.status(400).json({ message: 'Address line 1 is required for hotel details' });
        }
        if (!city) {
            return res.status(400).json({ message: 'City is required for hotel details' });
        }
        if (!state) {
            return res.status(400).json({ message: 'State is required for hotel details' });
        }
        if (!country) {
            return res.status(400).json({ message: 'Country is required for hotel details' });
        }
    }

    // Validate GST number if provided
    if (gst_number && !validateGSTNumber(gst_number)) {
        return res.status(400).json({ message: 'Invalid GST number format' });
    }

    // Validate PIN code if provided
    if (pin_code && !validatePinCode(pin_code)) {
        return res.status(400).json({ message: 'Invalid PIN code format' });
    }

    next();
};

module.exports = validateHotelDetails;