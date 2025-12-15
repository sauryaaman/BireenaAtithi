import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import axios from 'axios';
import { format } from 'date-fns';
import { RiCalendarLine, RiHotelBedLine, RiUserLine, RiPhoneLine, RiMailLine, RiMapPinLine } from 'react-icons/ri';
import "react-datepicker/dist/react-datepicker.css";
import '../components/Booking/BookingForm.css';
// import './BookingForm.css';
const BASE_URL = import.meta.env.VITE_API_URL;

const BookingForm = () => {
  const navigate = useNavigate();
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState('');  // Will store which button is loading
  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [searchingRooms, setSearchingRooms] = useState(false);
  const [showGuestForms, setShowGuestForms] = useState(false);
  const [availableRooms, setAvailableRooms] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  const [bookingType, setBookingType] = useState('book');
  
  const [nightlyPrices, setNightlyPrices] = useState({});

  // ID proof type options
  const idProofTypes = [
    { value: 'AADHAR', label: 'Aadhar Card' },
    { value: 'PASSPORT', label: 'Passport' },
    { value: 'DRIVING_LICENSE', label: 'Driving License' },
    { value: 'VOTER_ID', label: 'Voter ID' },
    { value: 'PAN_CARD', label: 'PAN Card' }
  ];

  // Validation patterns
  const validationPatterns = {
    AADHAR: { regex: /^[0-9]{12}$/, message: 'Aadhar must be exactly 12 digits' },
    PASSPORT: { regex: /^[A-Z][0-9]{7}$/, message: 'Passport must be 1 uppercase letter followed by 7 digits (e.g., A1234567)' },
    DRIVING_LICENSE: { regex: /^[A-Z]{2}[0-9]{13}$/, message: 'Driving License must be 2 uppercase letters followed by 13 digits' },
    VOTER_ID: { regex: /^[A-Z]{3}[0-9]{7}$/, message: 'Voter ID must be 3 uppercase letters followed by 7 digits' },
    PAN_CARD: { regex: /^[A-Z]{5}[0-9]{4}[A-Z]$/, message: 'PAN must be 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)' },
    phone: { regex: /^[0-9]{10}$/, message: 'Phone number must be exactly 10 digits' },
    pin: { regex: /^[0-9]{6}$/, message: 'PIN code must be exactly 6 digits' },
    email: { regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' }
  };

  // Validation functions
  const validateField = (fieldType, value, idProofType = null) => {
    if (!value) return '';
    
    let pattern;
    if (fieldType === 'idProof' && idProofType) {
      pattern = validationPatterns[idProofType];
    } else {
      pattern = validationPatterns[fieldType];
    }
    
    if (pattern && !pattern.regex.test(value)) {
      return pattern.message;
    }
    return '';
  };

  const [formData, setFormData] = useState({
    // Booking Details
    checkInDate: new Date(),
    checkOutDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    numberOfRooms: 1,
    numberOfGuests: 1,
    totalAmount: 0,
    paymentStatus: 'UNPAID', // Initialize payment status
    amountPaid: 0, // Initialize amount paid
    paymentMode: 'Cash', // Default payment mode
    
    // Guest Details
    customerName: '',
    phoneNumber: '',
    email: '',
    idProofType: 'AADHAR', // Default ID proof type
    idProof: '', // ID proof number
    gstNumber: '',
    mealPlan: '', // Will be entered manually and stored in uppercase
    
    // Address Details
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: '',
    pin: '',
    
    // Room Selections
    roomSelections: Array(1).fill({ roomType: '', roomId: '', price_per_night: 0, })
  });
  
  // Additional guests data structure
  const emptyGuest = {
    name: '',
    phone: '',
    email: '',
    id_proof_type: 'AADHAR',
    id_proof: '',
  };

  // Additional guests data
  const [additionalGuests, setAdditionalGuests] = useState([]);

  // Fetch room types
  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BASE_URL}/api/rooms/types`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Transform response to match the format needed by the form
        const formattedTypes = response.data.map(type => ({
          id: type.room_type,
          name: type.room_type,
          base_price: type.price_per_night
        }));
        setRoomTypes(formattedTypes);
      } catch (err) {
        setError('Failed to fetch room types');
      }
    };
    fetchRoomTypes();
  }, []);

  // Search for available rooms when room type and dates are selected
  const searchAvailableRooms = async (roomIndex) => {
    if (!formData.checkInDate || !formData.checkOutDate) {
      setError('Please select dates first');
      return;
    }

    const selection = formData.roomSelections[roomIndex];
    if (!selection.roomType) {
      setError('Please select room type first');
      return;
    }

    setSearchingRooms(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      // console.log('Searching for rooms with params:', {
      //   roomType: selection.roomType,
      //   checkIn: format(formData.checkInDate, 'yyyy-MM-dd'),
      //   checkOut: format(formData.checkOutDate, 'yyyy-MM-dd')
      // });
      
      const response = await axios.get(
        `${BASE_URL}/api/rooms/available`,
        {
          params: {
            roomType: selection.roomType,
            checkIn: format(formData.checkInDate, 'yyyy-MM-dd'),
            checkOut: format(formData.checkOutDate, 'yyyy-MM-dd')
          },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // console.log('Response from server:', response.data);
      
      if (!response.data.success) {
        setError(response.data.message || 'No rooms available');
        setAvailableRooms(prev => ({
          ...prev,
          [roomIndex]: []
        }));
        return;
      }

      if (!response.data.success) {
        setError(response.data.message || 'No rooms available');
        setAvailableRooms([]);
        return;
      }

      // Transform response to include necessary room details with pricing
      const rooms = response.data.rooms
        .map(room => ({
          _id: room.room_id,
          room_id: room.room_id,
          room_number: room.room_number,
          room_type: room.room_type,
          price_per_night: room.price_per_night,
          total_price: response.data.pricing.totalPrice,
          nights: response.data.pricing.numberOfNights,
          capacity: room.capacity
        }))
        // Filter out already selected rooms
        .filter(room => !formData.roomSelections.some(
          selection => selection.roomId === room.room_id
        ));

      setAvailableRooms(prev => ({
        ...prev,
        [roomIndex]: rooms
      }));

      // Clear error if we have rooms
      if (rooms.length > 0) {
        setError('');
      }
      
      // Update the room selection with pricing information
      const newSelections = [...formData.roomSelections];
      if (newSelections[roomIndex]) {
        newSelections[roomIndex] = {
          ...newSelections[roomIndex],
          price_per_night: response.data.pricing.pricePerNight,
          total_price: response.data.pricing.totalPrice,
          nights: response.data.pricing.numberOfNights
        };
        console.log('Updated room selection with pricing:', newSelections[roomIndex]);
      }
      
      setFormData(prev => ({
        ...prev,
        roomSelections: newSelections
        
      }));
      // console.log('Updated form data with room selections:', formData.roomSelections);
       
    } catch (err) {
      console.error('Error searching rooms:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to search for available rooms. Please try again.');
      }
      // Clear only the current room index's availability
      setAvailableRooms(prev => ({
        ...prev,
        [roomIndex]: null
      }));
    } finally {
      setSearchingRooms(false);
    }
  };
 

  // Function to check if date is today
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  // Function to calculate total amount
  const calculateTotalAmount = () => {
    return formData.roomSelections.reduce((total, selection) => {
      if (selection.roomId && selection.total_price) {
        return total + selection.total_price;
      }
      return total;
    }, 0);
  };

  // Update total amount when room selections or dates change
  useEffect(() => {
    const total = calculateTotalAmount();
    if (!isNaN(total)) {
      setFormData(prev => ({
        ...prev,
        totalAmount: total
      }));
    }
  }, [formData.roomSelections, formData.checkInDate, formData.checkOutDate, availableRooms]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time validation
    let error = '';
    if (name === 'idProof') {
      error = validateField('idProof', value, formData.idProofType);
    } else if (name === 'phoneNumber') {
      error = validateField('phone', value);
    } else if (name === 'pin') {
      error = validateField('pin', value);
    } else if (name === 'email' && value) {
      error = validateField('email', value);
    }

    // Update validation errors
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[name] = error;
      } else {
        delete newErrors[name];
      }
      return newErrors;
    });
  };

  const handleDateChange = (date, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: date,
      // Reset room selections when dates change
      roomSelections: Array(prev.numberOfRooms).fill().map(() => ({ roomType: '', roomId: '' })),
      totalAmount: 0
    }));
    
    // Validate dates
    const checkIn = field === 'checkInDate' ? date : formData.checkInDate;
    const checkOut = field === 'checkOutDate' ? date : formData.checkOutDate;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.checkInDate;
      delete newErrors.checkOutDate;
      
      if (checkIn < today) {
        newErrors.checkInDate = 'Check-in date cannot be in the past';
      }
      
      if (checkOut <= checkIn) {
        newErrors.checkOutDate = 'Check-out must be after check-in';
      }
      
      const daysDiff = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      if (daysDiff < 1) {
        newErrors.checkOutDate = 'Minimum 1 night stay required';
      }
      
      return newErrors;
    });
    
    // Reset available rooms
    setAvailableRooms({});
  };

  const handleGuestChange = (index, field, value) => {
    if (index === -1) {
      // Primary guest
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    } else {
      // Additional guests
      setAdditionalGuests(prev => {
        const newGuests = [...prev];
        if (!newGuests[index]) {
          newGuests[index] = {};
        }
        newGuests[index] = {
          ...newGuests[index],
          [field]: value
        };
        return newGuests;
      });

      // Validate additional guest fields
      const errorKey = `guest_${index}_${field}`;
      let error = '';
      
      if (field === 'id_proof') {
        const idType = additionalGuests[index]?.id_proof_type || 'AADHAR';
        error = validateField('idProof', value, idType);
      } else if (field === 'phone' && value) {
        error = validateField('phone', value);
      } else if (field === 'email' && value) {
        error = validateField('email', value);
      }

      setValidationErrors(prev => {
        const newErrors = { ...prev };
        if (error) {
          newErrors[errorKey] = error;
        } else {
          delete newErrors[errorKey];
        }
        return newErrors;
      });
    }
  };

    const handleSubmit = async (e, type) => {
      e.preventDefault();
      setLoading(type);
      setError('');
      setValidationErrors({});

      try {
        const errors = {};

        // Validate dates
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (formData.checkInDate < today) {
          errors.checkInDate = 'Check-in date cannot be in the past';
        }
        
        if (formData.checkOutDate <= formData.checkInDate) {
          errors.checkOutDate = 'Check-out must be after check-in';
        }
        
        const daysDiff = Math.ceil((formData.checkOutDate - formData.checkInDate) / (1000 * 60 * 60 * 24));
        if (daysDiff < 1) {
          errors.checkOutDate = 'Minimum 1 night stay required';
        }

        // Validate primary guest
        if (!formData.customerName?.trim()) {
          errors.customerName = 'Name is required';
        }

        const phoneError = validateField('phone', formData.phoneNumber);
        if (!formData.phoneNumber) {
          errors.phoneNumber = 'Phone number is required';
        } else if (phoneError) {
          errors.phoneNumber = phoneError;
        }

        if (formData.email) {
          const emailError = validateField('email', formData.email);
          if (emailError) errors.email = emailError;
        }

        const idProofError = validateField('idProof', formData.idProof, formData.idProofType);
        if (!formData.idProof) {
          errors.idProof = 'ID proof number is required';
        } else if (idProofError) {
          errors.idProof = idProofError;
        }

        const pinError = validateField('pin', formData.pin);
        if (!formData.pin) {
          errors.pin = 'PIN code is required';
        } else if (pinError) {
          errors.pin = pinError;
        }

        if (!formData.addressLine1?.trim()) {
          errors.addressLine1 = 'Address is required';
        }

        if (!formData.city?.trim()) {
          errors.city = 'City is required';
        }

        if (!formData.state?.trim()) {
          errors.state = 'State is required';
        }

        if (!formData.country?.trim()) {
          errors.country = 'Country is required';
        }

        if (!formData.mealPlan?.trim()) {
          errors.mealPlan = 'Meal plan is required';
        }

        // Validate additional guests
        additionalGuests.forEach((guest, index) => {
          if (!guest.name?.trim()) {
            errors[`guest_${index}_name`] = 'Guest name is required';
          }
          
          const guestIdProofError = validateField('idProof', guest.id_proof, guest.id_proof_type || 'AADHAR');
          if (!guest.id_proof) {
            errors[`guest_${index}_id_proof`] = 'ID proof is required';
          } else if (guestIdProofError) {
            errors[`guest_${index}_id_proof`] = guestIdProofError;
          }

          if (guest.phone) {
            const guestPhoneError = validateField('phone', guest.phone);
            if (guestPhoneError) {
              errors[`guest_${index}_phone`] = guestPhoneError;
            }
          }

          if (guest.email) {
            const guestEmailError = validateField('email', guest.email);
            if (guestEmailError) {
              errors[`guest_${index}_email`] = guestEmailError;
            }
          }
        });

        // Validate room selections and payment status
        const hasIncompleteRooms = formData.roomSelections.some(
          selection => !selection.roomType || !selection.roomId
        );

        if (hasIncompleteRooms) {
          errors.roomSelection = 'Please complete room selection for all rooms';
        }

        if (!formData.paymentStatus) {
          errors.paymentStatus = 'Please select a payment status';
        }

        // If validation errors exist, show them and stop
        if (Object.keys(errors).length > 0) {
          setValidationErrors(errors);
          setError('Please fix all validation errors before submitting');
          setLoading('');
          
          // Scroll to first error
          setTimeout(() => {
            const firstError = document.querySelector('.form-group.error, .error-message');
            if (firstError) {
              firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);
          return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Please login to continue');
        }
      
        // Primary guest data
        const primaryGuest = {
          name: formData.customerName,
          phone: formData.phoneNumber,
          email: formData.email,
          id_proof_type: formData.idProofType,
          id_proof: formData.idProof,
          gst_number: formData.gstNumber || null,
          meal_plan: formData.mealPlan,
          address_line1: formData.addressLine1?.trim() || null,
          address_line2: formData.addressLine2?.trim() || null,
          city: formData.city?.trim() || null,
          state: formData.state?.trim() || null,
          country: formData.country?.trim() || null,
          pin: formData.pin?.trim() || null
        };

        // Validate primary guest
        if (!primaryGuest.name || !primaryGuest.phone || !primaryGuest.email) {
          throw new Error('Please fill in all primary guest details');
        }

        // Filter out valid rooms and guests
        const validRooms = formData.roomSelections.filter(
          selection => selection.roomId && selection.roomType
        );

        const validGuests = additionalGuests.filter(
          guest => guest.name && guest.id_proof
        );

        // Validate rooms
        if (!validRooms.length) {
          throw new Error('Please select at least one room');
        }

        // Calculate total from all selected rooms
        const totalAmount = validRooms.reduce((sum, room) => 
          sum + (room.total_price || 0), 0
        );

        // Process room rates information
        const roomRatesInfo = validRooms.map(room => {
          const roomNights = room.nights || 0;
          const rates = room.showNightlyRates 
            ? Array.from({ length: roomNights }).map((_, index) => ({
                night: index + 1,
                rate: nightlyPrices[`${room.roomId}-${index}`] || room.price_per_night
              }))
            : null;
          
          return {
            room_id: room.roomId,
            uses_nightly_rates: !!room.showNightlyRates,
            nightly_rates: rates
          };
        });

        // Calculate nightly rates array for backward compatibility
        // Only include rooms that are using manual nightly pricing
        const hasNightlyRates = validRooms.some(room => room.showNightlyRates);
        const nightlyRates = hasNightlyRates ? validRooms.flatMap(room => {
          // Only process rooms with manual nightly pricing
          if (!room.showNightlyRates) {
            return []; // Skip rooms without manual pricing
          }
          
          const nights = room.nights || 0;
          return Array.from({ length: nights }).map((_, index) => ({
            night: index + 1,
            rate: nightlyPrices[`${room.roomId}-${index}`] || room.price_per_night,
            room_id: room.roomId // Add room_id to track which rate belongs to which room
          }));
        }) : null;

        // Log nightly rates calculation
        // console.log('Night by night rates:', nightlyRates);
        // console.log('Valid rooms with nightly rates:', validRooms.map(room => ({
        //   roomId: room.roomId,
        //   showNightlyRates: room.showNightlyRates,
        //   nights: room.nights,
        //   prices: Object.keys(nightlyPrices)
        //     .filter(key => key.startsWith(room.roomId))
        //     .map(key => ({ night: key.split('-')[1], price: nightlyPrices[key] }))
        // })));

        const bookingData = {
          primary_guest: primaryGuest,
          total_amount: totalAmount,
          additional_guests: validGuests,
          selected_rooms: validRooms.map((selection, index) => ({
            room_id: selection.roomId,
            room_type: selection.roomType,
            price_per_night: selection.price_per_night,
            total_price: selection.total_price,
            uses_nightly_rates: !!selection.showNightlyRates,
            nightly_rates: roomRatesInfo[index].nightly_rates
          })),
          checkin_date: format(formData.checkInDate, 'yyyy-MM-dd'),
          checkout_date: format(formData.checkOutDate, 'yyyy-MM-dd'),
          number_of_guests: formData.numberOfGuests,
          payment_status: formData.paymentStatus?.toUpperCase() || 'UNPAID',
          amount_paid: formData.amountPaid || 0,
          payment_mode: formData.paymentMode || 'Cash',
          is_immediate_checkin: type === 'checkin',
          nightly_rates: nightlyRates // For backward compatibility
        };

        // console.log('Sending booking data to backend:', JSON.stringify(bookingData, null, 2));

        // console.log('Making API request to create booking...', {
        //   url: `${BASE_URL}/api/bookings`,
        //   headers: { Authorization: 'Bearer [REDACTED]' }
        // });

        // Single API call for both booking types
        const response = await axios.post(
          `${BASE_URL}/api/bookings`,
          bookingData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // console.log('Backend response full:', response);
        // console.log('Backend response data:', JSON.stringify(response.data, null, 2));

        // Validate response data
        if (!response.data) {
          console.error('No data received in response');
          throw new Error('No response data received from server');
        }

        if (!response.data.booking_id) {
          console.error('No booking_id in response data:', response.data);
          throw new Error('No booking ID received from server');
        }

        if (response.data && response.data.success === false) {
          throw new Error(response.data.error || 'Failed to create booking');
        }

        // Broadcast event to refresh room status
        window.dispatchEvent(new CustomEvent('roomStatusChanged'));
        
        let successMessage = type === 'checkin' 
          ? 'Guest checked in successfully!'
          : 'Booking created successfully!';
        
        // Show a proper success message
        alert(successMessage);
        
        // Only navigate on success
        navigate('/bookings');
    } catch (error) {
      console.error('Error in booking submission:', error);
      setLoading('');  // Reset loading state
      
      // Extract error details
      const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
      const errorDetails = error.response?.data?.error || error.stack || '';
      
      // Set both the main error message and details
      setError(errorMessage);
      setErrorDetails(errorDetails);
      
      if (error.response?.status === 400) {
        // Bad request - validation errors
        setError('Please check your booking details');
      } else if (error.response?.status === 401) {
        // Unauthorized
        setError('Please login again to continue');
        setTimeout(() => navigate('/login'), 2000); // Give user time to see the error
      } else if (error.response?.status === 409) {
        // Conflict - room already booked
        setError('Selected room(s) are no longer available. Please try different rooms.');
      } else {
        // Generic error message
        setError(errorMessage || 'Failed to create booking. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNumberOfGuestsChange = (value) => {
    const numGuests = parseInt(value);
    setFormData(prev => ({
      ...prev,
      numberOfGuests: numGuests
    }));
    
    // Update additional guests array size
    if (numGuests > 1) {
      setShowGuestForms(true);
      setAdditionalGuests(prev => {
        const newGuests = [...prev];
        // Add or remove guest objects as needed
        while (newGuests.length < numGuests - 1) {
          newGuests.push({
            ...emptyGuest
          });
        }
        return newGuests.slice(0, numGuests - 1);
      });
    } else {
      setShowGuestForms(false);
      setAdditionalGuests([]);
    }
  };

  return (
    <div className="booking-form-container">
      {error && (
        <div className="error-container" style={{ padding: '1rem', marginBottom: '1rem', color: '#dc2626', backgroundColor: '#fee2e2', borderRadius: '0.375rem', border: '1px solid #fecaca' }}>
          <div className="error-message" style={{ fontWeight: 'bold', marginBottom: errorDetails ? '0.5rem' : '0' }}>
            {error}
          </div>
          {errorDetails && (
            <div className="error-details" style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
              {errorDetails}
            </div>
          )}
        </div>
      )}
      {/* <h2>New Booking</h2> */}
      
      <form onSubmit={handleSubmit} className="booking-form">
        {/* Room Selection Section */}
        <div className="form-section">
          <h3><RiHotelBedLine /> Room Selection</h3>
          <div className="form-grid">
            <div className={`form-group ${validationErrors.checkInDate ? 'error' : ''}`}>
              <label>Check-in Date *</label>
              <DatePicker
                selected={formData.checkInDate}
                onChange={(date) => handleDateChange(date, 'checkInDate')}
                minDate={new Date()}
                dateFormat="dd/MM/yyyy"
                className="date-picker"
                required
              />
              {validationErrors.checkInDate && (
                <span className="error-message" style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                  {validationErrors.checkInDate}
                </span>
              )}
            </div>

            <div className={`form-group ${validationErrors.checkOutDate ? 'error' : ''}`}>
              <label>Check-out Date *</label>
              <DatePicker
                selected={formData.checkOutDate}
                onChange={(date) => handleDateChange(date, 'checkOutDate')}
                minDate={formData.checkInDate}
                dateFormat="dd/MM/yyyy"
                className="date-picker"
                required
              />
              {validationErrors.checkOutDate && (
                <span className="error-message" style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                  {validationErrors.checkOutDate}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="numberOfGuests">Number of Guests *</label>
              <input
                type="number"
                id="numberOfGuests"
                name="numberOfGuests"
                value={formData.numberOfGuests}
                onChange={(e) => handleNumberOfGuestsChange(e.target.value)}
                min="1"
                max="4"
                required
              />
            </div>
          </div>

    
        </div>

        {/* Room Selection Section */}
        <div className="form-section room-selection-section">
          <h3><RiHotelBedLine /> Room Booking</h3>
          
          {/* Number of Rooms Selection */}
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="numberOfRooms">Number of Rooms *</label>
              <input
                type="number"
                id="numberOfRooms"
                name="numberOfRooms"
                value={formData.numberOfRooms}
                onChange={(e) => {
                  const num = Math.min(Math.max(1, parseInt(e.target.value) || 1), 5);
                  setFormData(prev => ({
                    ...prev,
                    numberOfRooms: num,
                    roomSelections: Array(num).fill().map((_, idx) => 
                      prev.roomSelections[idx] || { roomType: '', roomId: '' }
                    )
                  }));
                }}
                min="1"
                max="5"
                required
              />
            </div>
          </div>

          {/* Room Selection Fields */}
          {Array.from({ length: formData.numberOfRooms }).map((_, index) => (
            <div key={index} className="room-selection-fields">
              <div className="room-header">
                <h4>Room {index + 1}</h4>
                {formData.roomSelections[index]?.roomType && (
                  <button 
                    type="button" 
                    className="remove-room-btn"
                    onClick={() => {
                      const newSelections = [...formData.roomSelections];
                      newSelections[index] = { roomType: '', roomId: '' };
                      setFormData(prev => ({
                        ...prev,
                        roomSelections: newSelections
                      }));
                      setAvailableRooms(prev => ({
                        ...prev,
                        [index]: null
                      }));
                    }}
                  >
                    Remove Room Type
                  </button>
                )}
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Room Type *</label>
                  <select
                    value={formData.roomSelections[index]?.roomType || ''}
                    onChange={(e) => {
                      const newSelections = [...formData.roomSelections];
                      newSelections[index] = { roomType: e.target.value, roomId: '' };
                      setFormData(prev => ({
                        ...prev,
                        roomSelections: newSelections
                      }));
                      setAvailableRooms(prev => ({
                        ...prev,
                        [index]: null
                      }));
                    }}
                    required
                  >
                    <option value="">Select room type</option>
                    {roomTypes.map((type) => (
                      <option key={type.id} value={type.name}>
                        {type.name} - ₹{type.base_price}/night
                      </option>
                    ))}
                  </select>
                </div>

                {formData.roomSelections[index]?.roomType && (
                  <div className="form-group">
                    <label>Room Number *</label>
                    {availableRooms[index] ? (
                      availableRooms[index].length > 0 ? (
                        <div>
                          <select
                            value={formData.roomSelections[index]?.roomId || ''}
                            onChange={(e) => {
                              const selectedRoom = availableRooms[index].find(r => r.room_id === e.target.value);
                              const newSelections = [...formData.roomSelections];
                              newSelections[index] = {
                                ...formData.roomSelections[index],
                                roomId: e.target.value,
                                price_per_night: selectedRoom ? selectedRoom.price_per_night : 0
                               
                              };
                              setFormData(prev => ({
                                ...prev,
                                roomSelections: newSelections
                              }));
                            }}
                            required
                          >
                            <option value="">Select room number</option>
                            {availableRooms[index].map(room => (
                              <option key={room.room_id} value={room.room_id}>
                                Room {room.room_number} - ₹{room.price_per_night} per night
                              </option>
                            ))}
                          </select>
                          {formData.roomSelections[index]?.roomId && (
                            <div className="selected-room-price">
                              <p>Room Rate: ₹{formData.roomSelections[index].price_per_night} per night</p>
                                
                              
                              <p>Stay Duration: {formData.roomSelections[index].nights} nights</p>
                              <p className="room-total">Room Total: ₹{formData.roomSelections[index].total_price}</p>
                              <button
                                type="button"
                                className="add-nightly-rates-btn"
                                onClick={() => {
                                  const newSelections = [...formData.roomSelections];
                                  newSelections[index] = {
                                    ...newSelections[index],
                                    showNightlyRates: !newSelections[index].showNightlyRates
                                  };
                                  setFormData(prev => ({
                                    ...prev,
                                    roomSelections: newSelections
                                  }));
                                }}
                              >
                                {formData.roomSelections[index].showNightlyRates ? 'Use Default Rate' : 'Add Nightly Rates Manually'}
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="no-rooms-message">
                          No rooms available of this type
                        </div>
                      )
                    ) : (
                      <div className="search-button-container">
                        <button 
                          type="button" 
                          onClick={() => searchAvailableRooms(index)}
                          className="check-availability-btn"
                        >
                          Check Availability
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {formData.roomSelections[index]?.roomId && 
                  formData.roomSelections[index]?.showNightlyRates && 
                  availableRooms[index] && (
                    <div className="room-nightly-prices">
                      <h4>Room {availableRooms[index].find(r => r.room_id === formData.roomSelections[index].roomId)?.room_number} - Nightly Rates</h4>
                      <p className="nightly-rates-info">Enter rate for each night. Leave empty to use default rate.</p>
                      {Array.from({ length: formData.roomSelections[index].nights || 0 }).map((_, nightIndex) => (
                        <div key={nightIndex} className="night-price-row">
                          <label>Night {nightIndex + 1} Price:</label>
                          <input
                            type="number"
                            value={
                              nightlyPrices[`${formData.roomSelections[index].roomId}-${nightIndex}`] || 
                              formData.roomSelections[index].price_per_night || 0
                            }
                            onChange={(e) => {
                              const newPrice = parseFloat(e.target.value) || 0;
                            
                            // Update nightly price for this room and night
                            setNightlyPrices(prev => ({
                              ...prev,
                              [`${formData.roomSelections[index].roomId}-${nightIndex}`]: newPrice
                            }));

                            // Calculate new total for this room
                            const roomNights = Array.from({ length: formData.roomSelections[index].nights });
                            const roomTotal = roomNights.reduce((sum, _, night) => {
                              const price = night === nightIndex ? newPrice : 
                                nightlyPrices[`${formData.roomSelections[index].roomId}-${night}`] || 
                                formData.roomSelections[index].price_per_night;
                              return sum + price;
                            }, 0);

                            // Update room selection with new total
                            const newSelections = [...formData.roomSelections];
                            newSelections[index] = {
                              ...newSelections[index],
                              total_price: roomTotal
                            };

                            setFormData(prev => ({
                              ...prev,
                              roomSelections: newSelections,
                              totalAmount: newSelections.reduce((sum, sel) => sum + (sel.total_price || 0), 0)
                            }));
                          }}
                          min="0"
                          className="price-input"
                        />
                      </div>
                    ))}
                    <div className="room-total">
                      Room Total: ₹{formData.roomSelections[index].total_price || 0}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Booking Summary */}
          {formData.roomSelections.some(selection => selection.roomId) && (
            <div className="booking-summary">
              <h4>Booking Summary</h4>
              <div className="summary-items">
                <div className="nights-info">
                  {Math.ceil((formData.checkOutDate - formData.checkInDate) / (1000 * 60 * 60 * 24))} nights
                </div>
                {formData.roomSelections.map((selection, index) => 
                  selection.roomId && availableRooms[index] && (
                    <div key={index} className="summary-item">
                      <div className="room-info">
                        <span>Room {availableRooms[index].find(r => r._id === selection.roomId)?.room_number}</span>
                        <span>{selection.roomType}</span>
                      </div>
                      <div className="price">
                        ₹{availableRooms[index].find(r => r._id === selection.roomId)?.price_per_night} per night
                      </div>
                    </div>
                  )
                )}
                <div className="total-amount">
                  <span>Total Amount for {Math.ceil((formData.checkOutDate - formData.checkInDate) / (1000 * 60 * 60 * 24))} nights</span>
                  <span>₹{formData.totalAmount}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Primary Guest Details */}
        <div className="form-section">
          <h3><RiUserLine /> Primary Guest Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="customerName">Name *</label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={`form-group ${validationErrors.phoneNumber ? 'error' : ''}`}>
              <label htmlFor="phoneNumber">Phone Number *</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                maxLength="10"
                required
              />
              {validationErrors.phoneNumber && (
                <span className="error-message" style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                  {validationErrors.phoneNumber}
                </span>
              )}
            </div>

            <div className={`form-group ${validationErrors.email ? 'error' : ''}`}>
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
              {validationErrors.email && (
                <span className="error-message" style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                  {validationErrors.email}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="idProofType">ID Proof Type *</label>
              <select
                id="idProofType"
                name="idProofType"
                value={formData.idProofType}
                onChange={handleInputChange}
                required
              >
                {idProofTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={`form-group ${validationErrors.idProof ? 'error' : ''}`}>
              <label htmlFor="idProof">ID Proof Number *</label>
              <input
                type="text"
                id="idProof"
                name="idProof"
                value={formData.idProof}
                onChange={handleInputChange}
                placeholder={`Enter ${idProofTypes.find(t => t.value === formData.idProofType)?.label} Number`}
                style={{ textTransform: 'uppercase' }}
                required
              />
              {validationErrors.idProof && (
                <span className="error-message" style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                  {validationErrors.idProof}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="gstNumber">GST Number</label>
              <input
                type="text"
                id="gstNumber"
                name="gstNumber"
                value={formData.gstNumber}
                onChange={handleInputChange}
                placeholder="e.g., 22AAAAA0000A1Z5"
              />
            </div>

            <div className="form-group">
              <label htmlFor="mealPlan">Meal Plan *</label>
              <input
                type="text"
                id="mealPlan"
                name="mealPlan"
                value={formData.mealPlan}
                onChange={(e) => {
                  const uppercaseValue = e.target.value.toUpperCase();
                  setFormData(prev => ({
                    ...prev,
                    mealPlan: uppercaseValue
                  }));
                }}
                placeholder="Enter meal plan (e.g., EP, CP, MAP, AP)"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="addressLine1">Address Line 1 *</label>
              <input
                type="text"
                id="addressLine1"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="addressLine2">Address Line 2</label>
              <input
                type="text"
                id="addressLine2"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="city">City *</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="state">State *</label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="country">Country *</label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={`form-group ${validationErrors.pin ? 'error' : ''}`}>
              <label htmlFor="pin">PIN Code *</label>
              <input
                type="text"
                id="pin"
                name="pin"
                value={formData.pin}
                onChange={handleInputChange}
                maxLength="6"
                required
              />
              {validationErrors.pin && (
                <span className="error-message" style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                  {validationErrors.pin}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Additional Guests */}
        {showGuestForms && (
          <div className="form-section">
            <h3><RiUserLine /> Additional Guests</h3>
            {additionalGuests.map((guest, index) => (
              <div key={index} className="additional-guest">
                <h4>Guest {index + 2}</h4>
                <div className="form-grid">
                  <div className={`form-group ${validationErrors[`guest_${index}_name`] ? 'error' : ''}`}>
                    <label>Name *</label>
                    <input
                      type="text"
                      value={guest.name || ''}
                      onChange={(e) => handleGuestChange(index, 'name', e.target.value)}
                      required
                    />
                    {validationErrors[`guest_${index}_name`] && (
                      <span className="error-message" style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                        {validationErrors[`guest_${index}_name`]}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>ID Proof Type *</label>
                    <select
                      value={guest.id_proof_type || 'AADHAR'}
                      onChange={(e) => handleGuestChange(index, 'id_proof_type', e.target.value)}
                      required
                    >
                      {idProofTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={`form-group ${validationErrors[`guest_${index}_id_proof`] ? 'error' : ''}`}>
                    <label>ID Proof Number *</label>
                    <input
                      type="text"
                      value={guest.id_proof || ''}
                      onChange={(e) => handleGuestChange(index, 'id_proof', e.target.value.toUpperCase())}
                      placeholder={`Enter ${idProofTypes.find(t => t.value === (guest.id_proof_type || 'AADHAR'))?.label} Number`}
                      style={{ textTransform: 'uppercase' }}
                      required
                    />
                    {validationErrors[`guest_${index}_id_proof`] && (
                      <span className="error-message" style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                        {validationErrors[`guest_${index}_id_proof`]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Payment Details and Summary */}
        <div className="form-section">
          <h3>Payment Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="paymentStatus">Payment Status *</label>
              <select
                id="paymentStatus"
                name="paymentStatus"
                value={formData.paymentStatus}
                onChange={(e) => {
                  const newStatus = e.target.value.toUpperCase();
                  setFormData(prev => ({
                    ...prev,
                    paymentStatus: newStatus,
                    amountPaid: newStatus === 'PAID' ? prev.totalAmount : 
                              (newStatus === 'UNPAID' ? 0 : prev.amountPaid || 0),
                    paymentMode: prev.paymentMode || 'Cash'
                  }));
                }}
                required
                className="form-control"
              >
                <option value="">Select Payment Status</option>
                <option value="UNPAID">Unpaid</option>
                <option value="PARTIAL">Partial</option>
                <option value="PAID">Paid</option>
              </select>
            </div>

            {formData.paymentStatus !== 'UNPAID' && (
              <>
                <div className="form-group">
                  <label htmlFor="amountPaid">Amount Paid *</label>
                  <input
                    type="number"
                    id="amountPaid"
                    name="amountPaid"
                    value={formData.amountPaid || ''}
                    onChange={(e) => {
                      const amount = parseFloat(e.target.value) || 0;
                      const total = formData.totalAmount;
                      
                      // Validate amount
                      if (amount > total) {
                        setError('Payment amount cannot exceed total amount');
                        return;
                      }
                      
                      // Update payment status based on amount
                      let status = 'PARTIAL';
                      if (amount >= total) {
                        status = 'PAID';
                      } else if (amount <= 0) {
                        status = 'UNPAID';
                      }
                      
                      setFormData(prev => ({
                        ...prev,
                        amountPaid: amount,
                        paymentStatus: status
                      }));
                      setError('');
                    }}
                    min="0"
                    max={formData.totalAmount}
                    required
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="paymentMode">Payment Mode *</label>
                  <select
                    id="paymentMode"
                    name="paymentMode"
                    value={formData.paymentMode || 'Cash'}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        paymentMode: e.target.value
                      }));
                    }}
                    required
                    className="form-control"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="amountDue">Amount Due</label>
                  <input
                    type="text"
                    id="amountDue"
                    value={(formData.totalAmount - (formData.amountPaid || 0)).toFixed(2)}
                    disabled
                    className="form-control"
                  />
                </div>
              </>
            )}
          </div>

          {formData.roomSelections.some(selection => selection.roomId) && (
            <div className="booking-summary">
              <h3>Booking Summary</h3>
              <div className="summary-details">
                {formData.roomSelections.map((selection, index) => 
                  selection.roomId && availableRooms[index] && (
                    <div key={index} className="summary-item">
                      <span>Room {availableRooms[index].find(r => r.room_id === selection.roomId)?.room_number} Rate:</span>
                      <span>₹{availableRooms[index].find(r => r.room_id === selection.roomId)?.price_per_night || 0}/night</span>
                    </div>
                  )
                )}
                <div className="summary-item">
                  <span>Number of Nights:</span>
                  <span>
                    {Math.ceil((formData.checkOutDate - formData.checkInDate) / (1000 * 60 * 60 * 24))}
                  </span>
                </div>
                <div className="summary-item">
                  <span>Number of Guests:</span>
                  <span>{formData.numberOfGuests}</span>
                </div>
                <div className="summary-item total">
                  <span>Total Amount:</span>
                  <span>₹{formData.totalAmount}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/bookings')}
            className="cancel-btn"
          >
            Cancel
          </button>
          
          {isToday(formData.checkInDate) ? (
            <>
              <button 
                type="submit"
                className="book-btn"
                disabled={!!loading}
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit(e, 'book');
                }}
              >
                {loading === 'book' ? 'Processing...' : 'Book Now'}
              </button>
              <button 
                type="submit"
                className="checkin-btn"
                disabled={!!loading}
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit(e, 'checkin');
                }}
              >
                {loading === 'checkin' ? 'Processing...' : 'Confirm Check-in'}
              </button>
            </>
          ) : (
            <button 
              type="submit"
              className="book-btn"
              disabled={!!loading}
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e, 'book');
              }}
            >
              {loading === 'book' ? 'Processing...' : 'Book Now'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};


export default BookingForm;