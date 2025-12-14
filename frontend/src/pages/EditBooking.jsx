import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import axios from 'axios';
import { format } from 'date-fns';
import { RiCalendarLine, RiHotelBedLine, RiUserLine, RiPhoneLine, RiMailLine, RiMapPinLine, RiRestartLine } from 'react-icons/ri';
import "react-datepicker/dist/react-datepicker.css";
import './EditBooking.css';
import { toast } from 'react-toastify';
const BASE_URL = import.meta.env.VITE_API_URL;

const EditBooking = () => {
    const { bookingId } = useParams();
    // console.log("bookingId:", bookingId);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [errorDetails, setErrorDetails] = useState('');
    const [searchingRooms, setSearchingRooms] = useState(false);
    const [roomTypes, setRoomTypes] = useState([]);
    const [availableRooms, setAvailableRooms] = useState({});
    const [removedRooms, setRemovedRooms] = useState([]);
    const [showGuestForms, setShowGuestForms] = useState(false);
    const [bookingType, setBookingType] = useState('book');
    const [manualPricingMode, setManualPricingMode] = useState({});

    // ID proof type options
    const idProofTypes = [
        { value: 'AADHAR', label: 'Aadhar Card' },
        { value: 'PASSPORT', label: 'Passport' },
        { value: 'DRIVING_LICENSE', label: 'Driving License' },
        { value: 'VOTER_ID', label: 'Voter ID' },
        { value: 'PAN_CARD', label: 'PAN Card' }
    ];
       
    const [numberOfNights, setNumberOfNights] = useState(0);
    const [formData, setFormData] = useState({
        // Booking Details
        checkInDate: null,
        checkOutDate: null,
        numberOfRooms: 1,
        numberOfGuests: 1,
        totalAmount: 0,
        paymentStatus: 'UNPAID',
        bookingStatus: 'Upcoming',
        
        // Guest Details
        customerName: '',
        phoneNumber: '',
        email: '',
        id_proof: 'AADHAR',
        id_proof_number: '',
        gstNumber: '',
        mealPlan: '',
        
        // Address Details
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        country: '',
        pin: '',
        
        // Room Selections - Each room will have roomType, roomId, price_per_night, total_price
        roomSelections: []
    });

    // Additional guests data structure
    const emptyGuest = {
        name: '',
        phone: '',
        email: '',
        id_proof: 'AADHAR',
        id_proof_number: '',
    };

    // Additional guests data
    const [additionalGuests, setAdditionalGuests] = useState([]);

    // Effect to handle date changes
    useEffect(() => {
        if (formData.checkInDate && formData.checkOutDate) {
            calculateTotalAmount();
            
            // Clear available rooms when dates change to force re-searching
            setAvailableRooms({});
        }
    }, [formData.checkInDate, formData.checkOutDate]);

    // Effect to load initial booking data
    useEffect(() => {
        const initializeForm = async () => {
            try {
                setLoading(true);
                // First fetch room types
                const token = localStorage.getItem('token');
                const roomTypesResponse = await axios.get(`${BASE_URL}/api/rooms/types`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const formattedTypes = roomTypesResponse.data.map(type => ({
                    id: type.room_type,
                    name: type.room_type,
                    base_price: type.price_per_night
                }));
                setRoomTypes(formattedTypes);

                // Then fetch booking details
                await fetchBookingDetails();
            } catch (err) {
                console.error('Error initializing form:', err);
                setError('Failed to initialize form data');
                toast.error('Failed to load form data');
            }
        };

        initializeForm();
    }, [bookingId]);

    const fetchBookingDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/api/bookings/${bookingId}/details`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (!response.data) {
                throw new Error('Invalid booking data received');
            }

            const bookingData = response.data.booking;
            const customerData = response.data.customer;
            const guestsData = response.data.guests;
            //  console.log("bookingData", bookingData);
            // console.log("statusbooking", bookingData.status);
            // console.log("customerData", customerData);
            // console.log("guestsData", guestsData);
            // Safely parse dates
            const checkInDate = bookingData.check_in_date ? new Date(bookingData.check_in_date) : null;
            const checkOutDate = bookingData.check_out_date ? new Date(bookingData.check_out_date) : null;

            // Validate dates
            if (checkInDate && isNaN(checkInDate.getTime())) {
                console.error('Invalid check-in date:', bookingData.checkin_date);
                throw new Error('Invalid check-in date received');
            }
            if (checkOutDate && isNaN(checkOutDate.getTime())) {
                console.error('Invalid check-out date:', bookingData.checkout_date);
                throw new Error('Invalid check-out date received');
            }
            
            const { primary: primaryGuest, additional: additionalGuests } = guestsData;
            
            // Calculate number of nights
            const nights = checkInDate && checkOutDate ? 
                Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)) : 0;
            setNumberOfNights(nights);

            // Set form data from booking details
            setFormData({
                checkInDate: checkInDate,
                checkOutDate: checkOutDate,
                numberOfRooms: bookingData.rooms?.length || 1,
                numberOfGuests: 1, // Count only the primary guest in formData
                numberOfNights: nights,
                totalAmount: bookingData.total_amount || 0,
                paymentStatus: bookingData.payment_status || 'UNPAID',
                bookingStatus: bookingData.status || 'Booked',
                
                // Primary guest and customer details
                customerName: customerData.name || '',
                phoneNumber: customerData.phone || '',
                email: customerData.email || '',
                id_proof: primaryGuest?.id_proof || 'AADHAR',
                id_proof_number: primaryGuest?.id_proof_number || '',
                gstNumber: customerData.gst_number || '',
                mealPlan: customerData.meal_plan || '',
                
                // Address details
                addressLine1: customerData.address?.address_line1 || '',
                addressLine2: customerData.address?.address_line2 || '',
                city: customerData.address?.city || '',
                state: customerData.address?.state || '',
                country: customerData.address?.country || '',
                pin: customerData.address?.pin || '',
                
                // Room selections
                roomSelections: (bookingData.rooms || []).map((room, roomIndex) => {
        if (!room) {
            console.error('Invalid room data:', room);
            return null;
        }

        const roomId = room.room_id ? parseInt(room.room_id, 10) : null;
        const roomType = room.room_type || '';
        const roomNumber = room.room_number || '';
        const pricePerNight = parseFloat(room.price_per_night) || 0;
        
        // Check if room has nightly rates
        const usesNightlyRates = room.uses_nightly_rates || false;
        const nightlyRates = usesNightlyRates && room.nightly_rates ? 
            room.nightly_rates.map(nr => parseFloat(nr.rate) || 0) : [];

        // Store complete room data for existing rooms
        const originalData = {
            room_id: roomId,
            room_type: roomType,
            room_number: roomNumber,
            price_per_night: pricePerNight,
            uses_nightly_rates: usesNightlyRates,
            nightly_rates: room.nightly_rates
        };

        // Calculate total price for existing room
        let totalPrice = 0;
        if (usesNightlyRates && nightlyRates.length > 0) {
            totalPrice = nightlyRates.reduce((sum, rate) => sum + rate, 0);
        } else {
            totalPrice = pricePerNight * nights;
        }

        // Create a room selection with all necessary data
        return {
            roomId: roomId,
            roomType: roomType,
            roomNumber: roomNumber,
            price_per_night: pricePerNight,
            uses_nightly_rates: usesNightlyRates, // Add this property
            isExistingRoom: true, // Flag to identify existing rooms
            originalData: originalData, // Keep original data for reference
            readonly: true, // Make the room type selection read-only for existing rooms
            guests: room.guests || [],
            nightlyPrices: nightlyRates.length > 0 ? nightlyRates : [],
            showNightlyRates: usesNightlyRates,
            nights: nights
        };           
                //  return {
                //         roomType: room.room_type || '',
                //         room_type: room.room_type || '', // For API consistency
                //         roomId: roomId, // Store as integer
                //         room_id: roomId, // For API consistency
                //         roomNumber: room.room_number || '',
                //         price_per_night: pricePerNight,
                //         isExistingRoom: true,
                //         originalRoomData: { // Store original room data for reference
                //             roomId: roomId,
                //             roomNumber: room.room_number || '',
                //             roomType: room.room_type || '',
                //             price_per_night: pricePerNight
                //         }
                //     };
                }).filter(room => room !== null) // Remove any invalid rooms
            });

            // Set manual pricing mode for rooms that have nightly rates
            const manualPricingModeState = {};
            (bookingData.rooms || []).forEach((room, index) => {
                if (room.uses_nightly_rates && room.nightly_rates && room.nightly_rates.length > 0) {
                    manualPricingModeState[index] = true;
                }
            });
            setManualPricingMode(manualPricingModeState);

            // Handle additional guests
            if (Array.isArray(additionalGuests) && additionalGuests.length > 0) {
                const additionalGuestData = additionalGuests.map(guest => ({
                    name: guest.name || '',
                    phone: guest.phone || '',
                    email: guest.email || '',
                    id_proof: guest.id_proof || 'AADHAR',
                    id_proof_number: guest.id_proof_number || ''
                }));
                setAdditionalGuests(additionalGuestData);
                setShowGuestForms(true);
            }

            // Search for available rooms for each room selection immediately
            if (bookingData.rooms?.length > 0 && checkInDate && checkOutDate) {
                // Search in parallel for faster loading
                await Promise.all(bookingData.rooms.map((_, index) => searchAvailableRooms(index)));
            }

            setLoading(false);
            
            // Store original room count, total amount and nights for comparison
            setOriginalRoomCount(bookingData.rooms?.length || 0);
            setOriginalBookingTotal(bookingData.total_amount || 0);
            setOriginalNights(nights);
            
            // Mark initial load as complete after all data is loaded
            // This allows useEffect to start recalculating total when user makes changes
            setTimeout(() => setInitialLoadComplete(true), 100);
        } catch (error) {
            console.error('Error fetching booking details:', error);
            toast.error(error.response?.data?.message || error.message || 'Failed to fetch booking details');
            setError(error.response?.data?.message || error.message || 'Failed to fetch booking details');
            setLoading(false);
            setTimeout(() => setInitialLoadComplete(true), 100);
        }
    };

    const searchAvailableRooms = async (roomIndex) => {
        const currentSelection = formData.roomSelections?.[roomIndex];
        if (!currentSelection) {
            // console.log('No room selection found for index:', roomIndex);
            return;
        }
        if (!currentSelection.roomType) {
            toast.warning('Please select a room type first');
            return;
        }

        if (!formData.checkInDate || !formData.checkOutDate) {
            toast.warning('Please select check-in and check-out dates first');
            return;
        }

        // Clear any previous rooms while searching
        setAvailableRooms(prev => ({
            ...prev,
            [roomIndex]: []
        }));

        setSearchingRooms(true);

        try {
            const token = localStorage.getItem('token');
            const checkInDateStr = format(formData.checkInDate, 'yyyy-MM-dd');
            const checkOutDateStr = format(formData.checkOutDate, 'yyyy-MM-dd');

            // Build the request params
            const params = {
                roomType: currentSelection.roomType,
                checkIn: checkInDateStr,
                checkOut: checkOutDateStr
            };
            
            // If this is an edit operation and we're checking the current room's availability,
            // exclude it from the search to ensure it shows up as available
            if (bookingId && currentSelection.isExistingRoom && currentSelection.roomId) {
                params.bookingId = bookingId;
                params.excludeRoomId = currentSelection.roomId;
            }

            const response = await axios.get(`${BASE_URL}/api/rooms/available`, {
                params: params,
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.data.success) {
                toast.error(response.data.message || 'No rooms available');
                setAvailableRooms(prev => ({
                    ...prev,
                    [roomIndex]: []
                }));
                return;
            }

            let formattedRooms = Array.isArray(response.data.rooms) ? 
                response.data.rooms.map(room => ({
                    room_id: room.room_id,
                    roomId: room.room_id,
                    room_number: room.room_number,
                    roomNumber: room.room_number,
                    room_type: room.room_type,
                    roomType: room.room_type,
                    price_per_night: parseFloat(room.price_per_night)
                })) : [];

            // For edit operations, always include the current room if it exists
            // to allow keeping the same room
            if (currentSelection.isExistingRoom && currentSelection.roomId) {
                const currentRoomExists = formattedRooms.some(room => room.room_id === currentSelection.roomId);
                if (!currentRoomExists) {
                    // Always include the existing room at the start of the list for better visibility
                    formattedRooms.unshift({
                        room_id: currentSelection.roomId,
                        roomId: currentSelection.roomId,
                        room_number: currentSelection.roomNumber,
                        roomNumber: currentSelection.roomNumber,
                        room_type: currentSelection.roomType,
                        roomType: currentSelection.roomType,
                        price_per_night: parseFloat(currentSelection.price_per_night),
                        isExistingRoom: true // Mark this as the existing room for UI purposes
                    });
                }
            }

            // Sort rooms by room number for consistent display
            formattedRooms.sort((a, b) => {
                const roomA = String(a.room_number || a.roomNumber || '');
                const roomB = String(b.room_number || b.roomNumber || '');
                return roomA.localeCompare(roomB);
            });

            setAvailableRooms(prev => ({
                ...prev,
                [roomIndex]: formattedRooms
            }));

            if (formattedRooms.length === 0) {
                toast.warning('No rooms available for the selected dates and room type');
            }

        } catch (error) {
            console.error('Error searching available rooms:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch available rooms');
        } finally {
            setSearchingRooms(false);
        }
    };

    useEffect(() => {
        // Only search if we have room selections and valid dates
        if (formData.roomSelections && formData.roomSelections.length > 0 && 
            formData.checkInDate && formData.checkOutDate) {
            formData.roomSelections.forEach((room, index) => {
                // Only search for rooms that have a room type selected
                if (room.roomType) {
                    searchAvailableRooms(index);
                }
            });
        }
    }, [formData.checkInDate, formData.checkOutDate]);

    const calculateTotalAmount = () => {
        if (!formData.checkInDate || !formData.checkOutDate) {
            return;
        }

        const nights = Math.max(1, Math.ceil(
            (formData.checkOutDate - formData.checkInDate) / (1000 * 60 * 60 * 24)
        ));
        
        let totalAmount;
        
        // If dates changed, recalculate entire total
        if (datesChanged) {
            totalAmount = 0;
            
            formData.roomSelections.forEach((room, index) => {
                if (room.isExistingRoom && !room.isRestoredRoom) {
                    // Original existing rooms: recalculate based on new nights
                    if (room.uses_nightly_rates && room.nightlyPrices && room.nightlyPrices.length > 0) {
                        // Sum adjusted nightly prices
                        const nightlyTotal = room.nightlyPrices.reduce((sum, price) => sum + (parseFloat(price) || 0), 0);
                        totalAmount += nightlyTotal;
                    } else if (room.price_per_night) {
                        // Recalculate with new nights
                        totalAmount += (parseFloat(room.price_per_night) || 0) * nights;
                    }
                } else {
                    // New rooms and restored rooms
                    if (manualPricingMode[index] && room.nightlyPrices && room.nightlyPrices.length > 0) {
                        const nightlyTotal = room.nightlyPrices.reduce((sum, price) => sum + (parseFloat(price) || 0), 0);
                        totalAmount += nightlyTotal;
                    } else if (room.price_per_night) {
                        totalAmount += (parseFloat(room.price_per_night) || 0) * nights;
                    }
                }
            });
        } else {
            // Dates not changed: use original total + new rooms only
            totalAmount = originalBookingTotal;
            
            formData.roomSelections.forEach((room, index) => {
                // Skip original existing rooms - already in originalBookingTotal
                if (room.isExistingRoom && !room.isRestoredRoom) {
                    return;
                }
                
                // Add new rooms and restored rooms
                if (manualPricingMode[index] && room.nightlyPrices && room.nightlyPrices.length > 0) {
                    const nightlyTotal = room.nightlyPrices.reduce((sum, price) => sum + (parseFloat(price) || 0), 0);
                    totalAmount += nightlyTotal;
                } else if (room.price_per_night) {
                    totalAmount += (parseFloat(room.price_per_night) || 0) * nights;
                }
            });
        }

        // Update form data with calculated total
        setFormData(prev => ({
            ...prev,
            totalAmount: totalAmount
        }));
    };

    // Track if initial data has loaded - don't auto-recalculate on load
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);
    
    // Track original room count to detect when user adds/removes rooms
    const [originalRoomCount, setOriginalRoomCount] = useState(0);
    
    // Track original booking total amount (from database)
    const [originalBookingTotal, setOriginalBookingTotal] = useState(0);
    
    // Track if dates have been changed from original
    const [datesChanged, setDatesChanged] = useState(false);
    const [originalNights, setOriginalNights] = useState(0);

    // Effect to recalculate total amount ONLY when user makes actual changes
    // This preserves the original booking total unless user explicitly changes something
    useEffect(() => {
        if (!initialLoadComplete) {
            return; // Skip calculation during initial load
        }
        
        // Only recalculate if room count changed (add/remove room)
        // Manual pricing changes are handled in their own functions
        if (formData.roomSelections.length !== originalRoomCount) {
            calculateTotalAmount();
        }
    }, [formData.roomSelections.length, initialLoadComplete]);
    

    const handleInputChange = (e) => {
        console.log("handleInputChange called", e.target);
        const { name, value } = e.target;
        
        // Special handling for booking status changes
        if (name === 'bookingStatus') {
            const currentPaymentStatus = formData.paymentStatus.toUpperCase();
            const newStatus = value;

            // Prevent checkout if payment is not complete
            if (newStatus === 'Checked-out' && currentPaymentStatus !== 'PAID') {
                toast.error('Cannot checkout: Payment must be completed first');
                return;
            }

            // Update all selected rooms' status based on booking status
            const updatedRoomSelections = formData.roomSelections.map(room => {
                let roomStatus;
                switch (newStatus) {
                    case 'Checked-in':
                        roomStatus = 'Occupied';
                        break;
                    case 'Checked-out':
                        roomStatus = 'Available';
                        break;
                    default:
                        roomStatus = 'Booked';
                }
                return {
                    ...room,
                    status: roomStatus
                };
            });

            setFormData(prev => ({
                ...prev,
                [name]: value,
                roomSelections: updatedRoomSelections
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
        // console.log("formData after handleInputChange", formData.bookingStatus)
    };

    // Calculate nights between two dates - Same as BookingForm
    const calculateNights = (startDate, endDate) => {
        if (!startDate || !endDate) return 0;
        return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    };
    // console.log("numberOfNights", numberOfNights);

    const handleDateChange = (date, field) => {
        let newCheckIn = formData.checkInDate;
        let newCheckOut = formData.checkOutDate;

        if (field === 'checkInDate') {
            newCheckIn = date;
            // If check-in date is after check-out date, update check-out date
            if (newCheckIn && newCheckOut && newCheckIn > newCheckOut) {
                newCheckOut = new Date(newCheckIn.getTime() + (24 * 60 * 60 * 1000)); // Next day
            }
        } else {
            newCheckOut = date;
            // If check-out date is before check-in date, update check-in date
            if (newCheckIn && newCheckOut && newCheckOut < newCheckIn) {
                newCheckIn = new Date(newCheckOut.getTime() - (24 * 60 * 60 * 1000)); // Previous day
            }
        }

        // Calculate number of nights
        const nights = calculateNights(newCheckIn, newCheckOut);
        setNumberOfNights(nights);
        
        // Check if nights changed from original
        const nightsHaveChanged = nights !== originalNights;
        if (nightsHaveChanged) {
            setDatesChanged(true);
        }

        // Update form data with new dates and adjust nightly prices for all rooms
        setFormData(prev => {
            const updatedRoomSelections = prev.roomSelections.map((room, idx) => {
                // Check if this room uses nightly rates (manual pricing mode OR existing room with uses_nightly_rates)
                const usesNightlyRates = manualPricingMode[idx] || (room.isExistingRoom && room.uses_nightly_rates);
                
                if (usesNightlyRates && (room.showNightlyRates || room.uses_nightly_rates)) {
                    const currentNightlyPrices = room.nightlyPrices || [];
                    const currentNights = currentNightlyPrices.length;
                    
                    let newNightlyPrices = [...currentNightlyPrices];
                    
                    // If nights increased, add new price inputs with same value as last night
                    if (nights > currentNights) {
                        const lastPrice = currentNightlyPrices[currentNights - 1] || room.price_per_night || 0;
                        for (let i = currentNights; i < nights; i++) {
                            newNightlyPrices.push(lastPrice);
                        }
                    } 
                    // If nights decreased, remove extra price inputs
                    else if (nights < currentNights) {
                        newNightlyPrices = newNightlyPrices.slice(0, nights);
                    }
                    
                    return {
                        ...room,
                        nightlyPrices: newNightlyPrices,
                        nights: nights
                    };
                }
                
                // For rooms not in manual pricing mode, just update nights
                return {
                    ...room,
                    nights: nights
                };
            });
            
            // Calculate new total amount if nights changed
            let newTotalAmount = prev.totalAmount;
            
            if (nightsHaveChanged) {
                newTotalAmount = 0;
                
                updatedRoomSelections.forEach((room, index) => {
                    if (room.isExistingRoom && !room.isRestoredRoom) {
                        // Original existing rooms: recalculate based on new nights
                        if (room.uses_nightly_rates && room.nightlyPrices && room.nightlyPrices.length > 0) {
                            // Sum adjusted nightly prices
                            const nightlyTotal = room.nightlyPrices.reduce((sum, price) => sum + (parseFloat(price) || 0), 0);
                            newTotalAmount += nightlyTotal;
                        } else if (room.price_per_night) {
                            // Recalculate with new nights
                            newTotalAmount += (parseFloat(room.price_per_night) || 0) * nights;
                        }
                    } else {
                        // New rooms and restored rooms
                        if (manualPricingMode[index] && room.nightlyPrices && room.nightlyPrices.length > 0) {
                            const nightlyTotal = room.nightlyPrices.reduce((sum, price) => sum + (parseFloat(price) || 0), 0);
                            newTotalAmount += nightlyTotal;
                        } else if (room.price_per_night) {
                            newTotalAmount += (parseFloat(room.price_per_night) || 0) * nights;
                        }
                    }
                });
            }
            
            return {
                ...prev,
                checkInDate: newCheckIn,
                checkOutDate: newCheckOut,
                numberOfNights: nights,
                roomSelections: updatedRoomSelections,
                totalAmount: newTotalAmount
            };
        });
    };
    

    const handleRoomSelectionChange = async (index, field, value) => {
        const updatedSelections = [...formData.roomSelections];
        const currentSelection = updatedSelections[index];
        
        if (field === 'roomType') {
            // Validate dates first
            if (!formData.checkInDate || !formData.checkOutDate) {
                toast.warning('Please select check-in and check-out dates first');
                return;
            }

            if (currentSelection.isExistingRoom) {
                toast.warning('Cannot change room type for existing rooms');
                return;
            }

            // When room type changes, clear the room number and update base price
            const roomType = roomTypes.find(type => type.id === value);
            updatedSelections[index] = {
                ...currentSelection,
                roomType: value,
                room_type: value,  // Add this for API compatibility
                roomId: '',        // Clear room ID when room type changes
                room_id: '',       // Add this for API compatibility
                roomNumber: '',    // Clear room number when room type changes
                price_per_night: roomType ? roomType.base_price : 0,
                isExistingRoom: false // Mark as new selection when type changes
            };
            
            // Clear available rooms when room type changes
            setAvailableRooms(prev => ({
                ...prev,
                [index]: []
            }));
            
            setFormData(prev => ({
                ...prev,
                roomSelections: updatedSelections
            }));
            
            // Recalculate total after room type change
            setTimeout(() => calculateTotalAmount(), 0);
            
            // Search for available rooms with the new room type
            await searchAvailableRooms(index);
            
        } else if (field === 'roomId' && value) {
            // When room number is selected, update the room details
            const selectedRoom = availableRooms[index]?.find(room => room.room_id.toString() === value);
            // console.log('Selected room:', selectedRoom);
            
            if (selectedRoom) {
                updatedSelections[index] = {
                    ...currentSelection,
                    roomId: selectedRoom.room_id,
                    room_id: selectedRoom.room_id,
                    roomNumber: selectedRoom.room_number,
                    room_number: selectedRoom.room_number,
                    roomType: selectedRoom.room_type,
                    room_type: selectedRoom.room_type,
                    price_per_night: parseFloat(selectedRoom.price_per_night),
                    isExistingRoom: false
                };
                
                setFormData(prev => ({
                    ...prev,
                    roomSelections: updatedSelections
                }));
            
                // Recalculate total when room is selected
                setTimeout(() => calculateTotalAmount(), 0);
            } else {
                toast.error('Selected room not found in available rooms list');
            }
        } else if (field === 'price_per_night') {
            // When manual price is entered
            updatedSelections[index] = {
                ...currentSelection,
                price_per_night: parseFloat(value) || 0
            };
            
            setFormData(prev => ({
                ...prev,
                roomSelections: updatedSelections
            }));
            
            // Recalculate total when price changes
            setTimeout(() => calculateTotalAmount(), 0);
        }
    };

    const handleAdditionalGuestChange = (index, field, value) => {
        const updatedGuests = [...additionalGuests];
        updatedGuests[index] = {
            ...updatedGuests[index],
            [field]: value
        };
        setAdditionalGuests(updatedGuests);
    };

    const toggleManualPricing = (roomIndex) => {
        const room = formData.roomSelections[roomIndex];
        const isManual = manualPricingMode[roomIndex];
        
        // Toggle the manual pricing mode first
        const newManualMode = !isManual;
        setManualPricingMode(prev => ({
            ...prev,
            [roomIndex]: newManualMode
        }));
        
        if (!isManual) {
            // Switching to manual mode - initialize nightly prices with current price_per_night
            const nights = Math.max(1, Math.ceil(
                (formData.checkOutDate - formData.checkInDate) / (1000 * 60 * 60 * 24)
            ));
            
            const nightlyPrices = Array(nights).fill(room.price_per_night || 0);
            
            setFormData(prev => {
                const updatedSelections = [...prev.roomSelections];
                updatedSelections[roomIndex] = {
                    ...updatedSelections[roomIndex],
                    nightlyPrices: nightlyPrices
                };
                
                // Recalculate total: Start with original booking total + only NEW rooms
                const nights = Math.max(1, Math.ceil(
                    (prev.checkOutDate - prev.checkInDate) / (1000 * 60 * 60 * 24)
                ));
                
                let newTotalAmount = originalBookingTotal;
                updatedSelections.forEach((r, idx) => {
                    // Skip existing rooms
                    if (r.isExistingRoom) {
                        return;
                    }
                    
                    if (idx === roomIndex) {
                        // This room is now in manual mode - use nightly prices
                        const nightlyTotal = nightlyPrices.reduce((sum, price) => sum + (parseFloat(price) || 0), 0);
                        newTotalAmount += nightlyTotal;
                    } else if (manualPricingMode[idx] && r.nightlyPrices && r.nightlyPrices.length > 0) {
                        // Other NEW rooms in manual mode
                        const nightlyTotal = r.nightlyPrices.reduce((sum, price) => sum + (parseFloat(price) || 0), 0);
                        newTotalAmount += nightlyTotal;
                    } else if (r.price_per_night) {
                        // Other NEW rooms in auto mode
                        newTotalAmount += (parseFloat(r.price_per_night) || 0) * nights;
                    }
                });
                
                return {
                    ...prev,
                    roomSelections: updatedSelections,
                    totalAmount: newTotalAmount
                };
            });
        } else {
            // Switching back to auto mode - clear nightly prices and recalculate with price_per_night
            setFormData(prev => {
                const updatedSelections = [...prev.roomSelections];
                updatedSelections[roomIndex] = {
                    ...updatedSelections[roomIndex],
                    nightlyPrices: []
                };
                
                // Recalculate total: Start with original booking total + only NEW rooms
                const nights = Math.max(1, Math.ceil(
                    (prev.checkOutDate - prev.checkInDate) / (1000 * 60 * 60 * 24)
                ));
                
                let newTotalAmount = originalBookingTotal;
                updatedSelections.forEach((r, idx) => {
                    // Skip existing rooms
                    if (r.isExistingRoom) {
                        return;
                    }
                    
                    if (idx === roomIndex) {
                        // This room is now back to auto mode - use price_per_night
                        if (r.price_per_night) {
                            newTotalAmount += (parseFloat(r.price_per_night) || 0) * nights;
                        }
                    } else if (manualPricingMode[idx] && r.nightlyPrices && r.nightlyPrices.length > 0) {
                        // Other NEW rooms in manual mode
                        const nightlyTotal = r.nightlyPrices.reduce((sum, price) => sum + (parseFloat(price) || 0), 0);
                        newTotalAmount += nightlyTotal;
                    } else if (r.price_per_night) {
                        // Other NEW rooms in auto mode
                        newTotalAmount += (parseFloat(r.price_per_night) || 0) * nights;
                    }
                });
                
                return {
                    ...prev,
                    roomSelections: updatedSelections,
                    totalAmount: newTotalAmount
                };
            });
        }
    };

    const handleNightlyPriceChange = (roomIndex, nightIndex, value) => {
        setFormData(prev => {
            const updatedSelections = [...prev.roomSelections];
            const nightlyPrices = [...(updatedSelections[roomIndex].nightlyPrices || [])];
            nightlyPrices[nightIndex] = parseFloat(value) || 0;
            
            updatedSelections[roomIndex] = {
                ...updatedSelections[roomIndex],
                nightlyPrices: nightlyPrices
            };
            
            // Recalculate total: Start with original booking total + only NEW rooms
            const nights = Math.max(1, Math.ceil(
                (prev.checkOutDate - prev.checkInDate) / (1000 * 60 * 60 * 24)
            ));
            
            let newTotalAmount = originalBookingTotal;
            updatedSelections.forEach((r, idx) => {
                // Skip original existing rooms (not restored ones)
                if (r.isExistingRoom && !r.isRestoredRoom) {
                    return;
                }
                
                // Process new rooms and restored rooms
                // Check if this room is in manual pricing mode
                if (manualPricingMode[idx] && r.nightlyPrices && r.nightlyPrices.length > 0) {
                    // Sum all nightly prices for manual mode
                    const roomTotal = r.nightlyPrices.reduce((sum, price) => sum + (parseFloat(price) || 0), 0);
                    newTotalAmount += roomTotal;
                } else {
                    // Use price_per_night * nights for auto mode
                    const pricePerNight = parseFloat(r.price_per_night) || 0;
                    newTotalAmount += pricePerNight * nights;
                }
            });
            
            return {
                ...prev,
                roomSelections: updatedSelections,
                totalAmount: newTotalAmount
            };
        });
    };

    const addRoom = async () => {
        const newRoom = {
            roomType: '',
            roomId: '',
            roomNumber: '',
            price_per_night: 0,
            isExistingRoom: false
        };
        
        const newIndex = formData.roomSelections.length;
        
        setFormData(prev => ({
            ...prev,
            roomSelections: [...prev.roomSelections, newRoom],
            numberOfRooms: prev.roomSelections.length + 1
        }));
        
        // If we have dates selected, search for available rooms immediately
        if (formData.checkInDate && formData.checkOutDate) {
            await searchAvailableRooms(newIndex);
        }
    };

    const restoreRoom = (roomData) => {
        // Create a new room selection with the original data
        const restoredRoom = {
            ...roomData,
            isExistingRoom: true,
            isRestoredRoom: true, // Flag to identify this is a restored room - price changes should be tracked
            originalData: roomData,
            roomType: roomData.roomType,
            roomNumber: roomData.roomNumber,
            showNightlyRates: roomData.uses_nightly_rates || false, // Show nightly rates if room uses them
            nightlyPrices: roomData.nightlyPrices || [] // Restore nightly prices
        };
        
        // Add the room back to selections at its previous position or at the end
        const insertIndex = typeof roomData.previousIndex === 'number' ? 
            Math.min(roomData.previousIndex, formData.roomSelections.length) : 
            formData.roomSelections.length;

        setFormData(prev => {
            const updatedSelections = [
                ...prev.roomSelections.slice(0, insertIndex),
                restoredRoom,
                ...prev.roomSelections.slice(insertIndex)
            ];
            
            // Add back the price of restored existing room
            const priceToAdd = roomData.priceToRestore || 0;
            const newTotalAmount = prev.totalAmount + priceToAdd;
            
            return {
                ...prev,
                roomSelections: updatedSelections,
                totalAmount: newTotalAmount
            };
        });
        
        // Set manual pricing mode for this room if it uses nightly rates
        if (roomData.uses_nightly_rates) {
            setManualPricingMode(prev => ({
                ...prev,
                [insertIndex]: true
            }));
        }

        // Remove from removedRooms using _id or room number as identifier
        setRemovedRooms(prev => prev.filter(room => 
            room._id ? room._id !== roomData._id : room.roomNumber !== roomData.roomNumber
        ));
    };

    const removeRoom = (index) => {
        const roomToRemove = formData.roomSelections[index];
        
        if (formData.roomSelections.length <= 1) {
            toast.error('Cannot remove the last room');
            return;
        }
        
        // Calculate the price to be removed for the removed room
        const nights = Math.max(1, Math.ceil(
            (formData.checkOutDate - formData.checkInDate) / (1000 * 60 * 60 * 24)
        ));
        
        let priceToRemove = 0;
        if (roomToRemove.isExistingRoom) {
            // Debug log
            // console.log('🔍 Removing existing room:', {
            //     roomNumber: roomToRemove.roomNumber,
            //     uses_nightly_rates: roomToRemove.uses_nightly_rates,
            //     nightlyPrices: roomToRemove.nightlyPrices,
            //     price_per_night: roomToRemove.price_per_night,
            //     nights: nights
            // });
            
            // For existing room: calculate based on nightly rates or price_per_night
            if (roomToRemove.uses_nightly_rates && roomToRemove.nightlyPrices && roomToRemove.nightlyPrices.length > 0) {
                // Sum of nightly rates
                priceToRemove = roomToRemove.nightlyPrices.reduce((sum, price) => sum + (parseFloat(price) || 0), 0);
                // console.log('💰 Using nightly rates. Total price to remove:', priceToRemove);
            } else {
                // price_per_night * nights
                priceToRemove = (parseFloat(roomToRemove.price_per_night) || 0) * nights;
                // console.log('💰 Using price_per_night. Price to remove:', priceToRemove);
            }
            
            // Store removed existing room for restore functionality with all data
            setRemovedRooms(prev => [...prev, {
                ...roomToRemove, // Store complete room data including nightlyPrices
                originalData: roomToRemove.originalData,
                roomNumber: roomToRemove.roomNumber,
                roomType: roomToRemove.roomType,
                previousIndex: index,
                priceToRestore: priceToRemove, // Store price for restore
                uses_nightly_rates: roomToRemove.uses_nightly_rates,
                nightlyPrices: roomToRemove.nightlyPrices || []
            }]);
        }

        setFormData(prev => {
            const updatedRoomSelections = prev.roomSelections.filter((_, i) => i !== index);
            
            let newTotalAmount;
            
            if (roomToRemove.isExistingRoom) {
                // For existing room: Subtract from current total
                newTotalAmount = prev.totalAmount - priceToRemove;
                // console.log('📊 Existing room removed. Previous total:', prev.totalAmount, '→ New total:', newTotalAmount);
            } else {
                // For new room: Recalculate from original booking total + remaining new rooms
                newTotalAmount = originalBookingTotal;
                
                updatedRoomSelections.forEach((room, idx) => {
                    // Skip existing rooms - already included in originalBookingTotal
                    if (room.isExistingRoom) {
                        return;
                    }
                    
                    // Adjust index for manualPricingMode since we removed a room
                    const adjustedIdx = idx < index ? idx : idx + 1;
                    
                    if (manualPricingMode[adjustedIdx] && room.nightlyPrices && room.nightlyPrices.length > 0) {
                        // Manual pricing mode - sum nightly prices
                        const roomTotal = room.nightlyPrices.reduce((sum, price) => sum + (parseFloat(price) || 0), 0);
                        newTotalAmount += roomTotal;
                    } else if (room.price_per_night) {
                        // Auto pricing mode - price_per_night * nights
                        newTotalAmount += (parseFloat(room.price_per_night) || 0) * nights;
                    }
                });
            }
            
            return {
                ...prev,
                roomSelections: updatedRoomSelections,
                numberOfRooms: updatedRoomSelections.length,
                totalAmount: newTotalAmount
            };
        });
        
        setAvailableRooms(prev => {
            const newAvailableRooms = {};
            Object.keys(prev).forEach(key => {
                const numKey = parseInt(key);
                if (numKey < index) {
                    newAvailableRooms[numKey] = prev[key];
                } else if (numKey > index) {
                    newAvailableRooms[numKey - 1] = prev[key];
                }
            });
            return newAvailableRooms;
        });
        
        // Also update manual pricing mode indices
        setManualPricingMode(prev => {
            const newManualPricing = {};
            Object.keys(prev).forEach(key => {
                const numKey = parseInt(key);
                if (numKey < index) {
                    newManualPricing[numKey] = prev[key];
                } else if (numKey > index) {
                    newManualPricing[numKey - 1] = prev[key];
                }
            });
            return newManualPricing;
        });
    };
    

    const addAdditionalGuest = () => {
        const newGuest = { ...emptyGuest };
        setAdditionalGuests(prev => [...prev, newGuest]);
    };

    const removeAdditionalGuest = (index) => {
        setAdditionalGuests(prev => prev.filter((_, i) => i !== index));
    };

    // Effect to update guest count when additional guests change
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            numberOfGuests: 1 // Only count primary guest in formData
        }));
    }, [additionalGuests.length]);


   const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setErrorDetails('');
    
    // Validation checks
    if (!formData.checkInDate || !formData.checkOutDate) {
        setError('Please select check-in and check-out dates');
        toast.error('Please select check-in and check-out dates');
        setLoading(false);
        return;
    }

    if (!formData.customerName || !formData.phoneNumber) {
        setError('Please fill in guest details');
        toast.error('Please fill in guest details');
        setLoading(false);
        return;
    }

    // Validate ID proof details
    if (!formData.id_proof_number || !formData.id_proof) {
        setError('Please provide valid ID proof details');
        toast.error('Please provide valid ID proof details');
        setLoading(false);
        return;
    }

    // Validate rooms
    if (formData.roomSelections.length === 0) {
        setError('Please select at least one room');
        toast.error('Please select at least one room');
        setLoading(false);
        return;
    }

    // Count valid rooms (either existing or properly selected new rooms)
    const validRooms = formData.roomSelections.filter(room => {
        if (room.isExistingRoom) return true; // Existing rooms are always valid
        return room.roomType && room.roomId && room.price_per_night; // New rooms need all fields
    });

    if (validRooms.length === 0) {
        setError('At least one room must be selected and fully configured');
        toast.error('Please select a room and complete all room details');
        setLoading(false);
        return;
    }

    // Check for incomplete room selections
    const incompleteRooms = formData.roomSelections.filter(room => {
        if (room.isExistingRoom) return false; // Skip existing rooms
        return !room.roomType || !room.roomId || !room.price_per_night;
    });

    if (incompleteRooms.length > 0) {
        const roomWord = incompleteRooms.length === 1 ? 'room' : 'rooms';
        setError(`${incompleteRooms.length} ${roomWord} have incomplete details. Please complete all room details or remove incomplete rooms.`);
        toast.error('Please complete all room details or remove incomplete rooms');
        setLoading(false);
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const currentTime = new Date().toISOString();

        // Process room selections - both existing and new
        const selected_rooms = formData.roomSelections
            .filter(room => {
                // Keep room if it's an existing room or if it has all required fields
                return room.isExistingRoom || (room.roomType && room.roomId && room.price_per_night);
            })
            .map((room, index) => {
                // For existing rooms - preserve all data and update status
                if (room.isExistingRoom) {
                    const newStatus = formData.bookingStatus=== 'Checked-in' ? 'Occupied' :
                                     formData.bookingStatus === 'Checked-out' ? 'Available' : 'Booked';
                    
                    // Check if this existing room is using manual nightly pricing
                    const usesNightlyRates = manualPricingMode[index] && room.nightlyPrices && room.nightlyPrices.length > 0;
                    const nightlyRates = usesNightlyRates ? room.nightlyPrices.map((rate, nightIndex) => ({
                        night: nightIndex + 1,
                        rate: parseFloat(rate) || 0
                    })) : null;
                    
                    // Ensure room_id is properly formatted
                    return {
                        ...room.originalData,
                        room_id: parseInt(room.originalData.room_id || room.roomId, 10),
                        status: newStatus,
                        uses_nightly_rates: usesNightlyRates,
                        nightly_rates: nightlyRates
                    };
                }

                // For new rooms
                const roomId = parseInt(room.roomId, 10);
                const pricePerNight = parseFloat(room.price_per_night);

                if (isNaN(roomId) || isNaN(pricePerNight)) {
                    return null;
                }

                // Check if this room uses manual nightly pricing
                const usesNightlyRates = manualPricingMode[index] && room.nightlyPrices && room.nightlyPrices.length > 0;
                const nightlyRates = usesNightlyRates ? room.nightlyPrices.map((rate, nightIndex) => ({
                    night: nightIndex + 1,
                    rate: parseFloat(rate) || 0
                })) : null;

                return {
                    room_id: roomId,
                    room_type: room.roomType || room.room_type,
                    room_number: room.roomNumber || room.room_number,
                    price_per_night: pricePerNight,
                    status: formData.bookingStatus === 'Checked-in' ? 'Occupied' :
                            formData.bookingStatus === 'Checked-out' ? 'Available' : 'Booked',
                    uses_nightly_rates: usesNightlyRates,
                    nightly_rates: nightlyRates
                };
            });

        // Filter out any null rooms (incomplete new room selections)
        const validRooms = selected_rooms.filter(room => room !== null);

        // Validate payment status for checkout
        if (formData.bookingStatus === 'Checked-out' && formData.paymentStatus.toUpperCase() !== 'PAID') {
            setError('Cannot checkout: Payment must be completed first');
            toast.error('Cannot checkout: Payment must be completed first');
            setLoading(false);
            return;
        }

        // Calculate number of nights
        const numberOfNights = calculateNights(formData.checkInDate, formData.checkOutDate);

        // Prepare combined nightly rates for booking table (ONLY rooms with manual pricing)
        const hasNightlyRates = validRooms.some(room => room.uses_nightly_rates);
        const combinedNightlyRates = hasNightlyRates ? validRooms.flatMap(room => {
            // Only include rooms that are using manual nightly pricing
            if (room.uses_nightly_rates && room.nightly_rates && room.nightly_rates.length > 0) {
                return room.nightly_rates.map(nr => ({
                    night: nr.night,
                    rate: nr.rate,
                    room_id: room.room_id.toString() // Add room_id to track which rate belongs to which room
                }));
            }
            return []; // Skip rooms without manual pricing
        }) : null;

        // Prepare booking data
        const bookingData = {
            number_of_nights: numberOfNights, // Add number of nights to booking data
            checkin_date: format(formData.checkInDate, 'yyyy-MM-dd'),
            checkout_date: format(formData.checkOutDate, 'yyyy-MM-dd'),
            checkin_time: formData.bookingStatus === 'Checked-in' ? currentTime : null,
            checkout_time: formData.bookingStatus  === 'Checked-out' ? currentTime : null,
            number_of_rooms: validRooms.length, // Use actual count of valid rooms
            number_of_guests: 1 + additionalGuests.length,
            total_amount: parseFloat(formData.totalAmount),
            payment_status: formData.paymentStatus.toUpperCase(),
            booking_status: formData.bookingStatus,
            selected_rooms: validRooms, // Only include valid rooms
            nightly_rates: combinedNightlyRates // Combined nightly rates for booking table
        };

        // Prepare customer data
        const customerData = {
            name: formData.customerName,
            phone: formData.phoneNumber,
            email: formData.email || '',
            id_proof: formData.id_proof,         // Always send idProofType as id_proof
            id_proof_number: formData.id_proof_number,  
            gst_number: formData.gstNumber || '',
            meal_plan: formData.mealPlan || 'none',
            address: {
                address_line1: formData.addressLine1 || '',
                address_line2: formData.addressLine2 || '',
                city: formData.city || '',
                state: formData.state || '',
                country: formData.country || '',
                pin: formData.pin || ''
            }
        };

        // Prepare primary guest data with correct field names
        const primary_guest = {
            name: formData.customerName,
            phone: formData.phoneNumber,
            email: formData.email || '',
            id_proof: formData.id_proof,         // Always send idProofType as id_proof
            id_proof_number: formData.id_proof_number,      // Always send idProof as id_proof_number
            gst_number: formData.gstNumber || '',
            meal_plan: formData.mealPlan || 'none',
             address: {
                address_line1: formData.addressLine1 || '',
                address_line2: formData.addressLine2 || '',
                city: formData.city || '',
                state: formData.state || '',
                country: formData.country || '',
                pin: formData.pin || ''
            }
        };

        // Format additional guests data with correct field names
        const additional_guests = additionalGuests.map(guest => ({
            name: guest.name,
           
            id_proof: guest.id_proof,          // Always send id_proof_type as id_proof
            id_proof_number: guest.id_proof_number         // Always send id_proof as id_proof_number
        }));
        // console.log("Submitting booking update:", { ...bookingData, customerData, primary_guest, additional_guests });

        // Send update request with consistent field names and data types
        const response = await axios.put(
            `${BASE_URL}/api/bookings/${bookingId}`,
            {
                ...bookingData,               // Contains selected_rooms and properly cased statuses
              // Contains address and other customer details
                primary_guest,                // Contains properly named id_proof fields
                additional_guests             // Contains properly named id_proof fields
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        if (response.data.success) {
            toast.success('Booking updated successfully');
            navigate('/bookings');
        } else {
            throw new Error(response.data.message || 'Failed to update booking');
        }

    } catch (error) {
        console.error('Error updating booking:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Error updating booking';
        toast.error(errorMessage);
        setError(errorMessage);

        // Set detailed error if available
        if (error.response?.data?.details) {
            setErrorDetails(JSON.stringify(error.response.data.details, null, 2));
        }
    } finally {
        setLoading(false);
    }
};

    if (loading) {
        return <div className="loading-spinner"></div>;
    }

    return (
        <div className="edit-booking-container">
            {/* <h2 className="edit-booking-title">Edit Booking Details</h2> */}
            <form onSubmit={handleSubmit} className="edit-booking-form">
                {/* Booking Status Section */}
                <div className="form-section">
                    <h3>Booking Status</h3>
                    <div className="form-group">
                        <label>Booking Status</label>
                        <select
                            name="bookingStatus"
                            value={formData.bookingStatus}
                            onChange={handleInputChange}
                            className="form-control"
                        >
                            <option value="Upcoming">Upcoming</option>
                            <option value="Checked-in">Checked In</option>
                            <option value="Checked-out">Checked Out</option>
                            <option value="Cancelled">Cancelled </option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Payment Status</label>
                        <select
                            name="paymentStatus"
                            value={formData.paymentStatus}
                            onChange={handleInputChange}
                            className="form-control"
                        >
                            <option value="UNPAID">Unpaid</option>
                            <option value="PARTIAL">Partial</option>
                            <option value="PAID">Paid</option>
                            <option value="REFUND">Refund</option>
                        </select>
                    </div>
                </div>

                {/* Date Selection */}
                <div className="form-section">
                    <h3>Dates</h3>
                    <div className="dates-container">
                        <div className="form-group">
                            <label><RiCalendarLine /> Check-in Date</label>
                            <DatePicker
                                selected={formData.checkInDate}
                                onChange={(date) => handleDateChange(date, 'checkInDate')}
                                className="form-control"
                                dateFormat="dd/MM/yyyy"
                                isClearable
                                placeholderText="Select check-in date"
                                selectsStart
                                startDate={formData.checkInDate}
                                endDate={formData.checkOutDate}
                            />
                        </div>
                        <div className="form-group">
                            <label><RiCalendarLine /> Check-out Date</label>
                            <DatePicker
                                selected={formData.checkOutDate}
                                onChange={(date) => handleDateChange(date, 'checkOutDate')}
                                className="form-control"
                                dateFormat="dd/MM/yyyy"
                                isClearable
                                placeholderText="Select check-out date"
                                selectsEnd
                                startDate={formData.checkInDate}
                                endDate={formData.checkOutDate}
                                minDate={formData.checkInDate || new Date()}
                                disabled={!formData.checkInDate}
                            />
                        </div>
                        <div className="booking-info">
                            <div className="nights-info">
                                <strong>Duration:</strong> {numberOfNights > 0 ? 
                                    `${numberOfNights} ${numberOfNights === 1 ? 'Night' : 'Nights'}` : 
                                    'Select dates'}
                            </div>
                            <div className="guests-info">
                                <strong>Total Guests:</strong> {1 + additionalGuests.length} {/* 1 primary guest + additional guests */}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Room Selection */}
                <div className="form-section">
                    <div className="section-header">
                        <div className="section-title">
                            <h3>Room Selection</h3>
                            <div className="room-summary">
                                <span className="room-count">Total Rooms: {formData.roomSelections.length}</span>
                                
                                {/* Removed Rooms Section */}
                                {removedRooms.length > 0 && (
                                    <div className="removed-rooms-section">
                                        <h4>Removed Rooms</h4>
                                        <div className="removed-rooms-list">
                                            {removedRooms.map((room, index) => (
                                                <div key={room._id || index} className="removed-room-item">
                                                    <span>Room {room.roomNumber} ({room.roomType})</span>
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => restoreRoom(room)}
                                                    >
                                                        <RiRestartLine /> Restore Room
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <span className="room-amount">Total Amount: ₹{formData.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                        <button type="button" onClick={addRoom} className="add-room-btn">
                            Add Room
                        </button>
                    </div>
                    {formData.roomSelections.map((room, index) => (
                        <div key={index} className="room-selection">
                            <div className="room-header">
                                <h4>Room {index + 1}</h4>
                                {formData.roomSelections.length > 1 && (
                                    <button type="button" onClick={() => removeRoom(index)} className="remove-room-btn">
                                        Remove Room
                                    </button>
                                )}
                            </div>
                            <div className="room-fields">
                                <div className="form-group">
                                    <label><RiHotelBedLine /> Room Type</label>
                                    <div className="room-type-selection">
                                        {room.isExistingRoom ? (
                                            <div className="existing-room-info">
                                                <span className="room-type">{room.roomType.replace(/_/g, ' ')}</span>
                                                <span className="room-number">Room #{room.roomNumber}</span>
                                                <span className="room-price">₹{room.price_per_night}/night</span>
                                            </div>
                                        ) : (
                                            <>
                                                <select
                                                    value={room.roomType || ''}
                                                    onChange={(e) => handleRoomSelectionChange(index, 'roomType', e.target.value)}
                                                    className="form-control"
                                                >
                                                    <option value="">Select Room Type</option>
                                                    {roomTypes.map(type => (
                                                        <option key={type.id} value={type.id}>
                                                            {type.name.replace(/_/g, ' ')} - ₹{type.base_price}/night
                                                        </option>
                                                    ))}
                                                </select>
                                                {room.roomType && !room.isExistingRoom && (
                                                    <button 
                                                        type="button" 
                                                        onClick={() => searchAvailableRooms(index)}
                                                        className="search-availability-btn"
                                                        disabled={searchingRooms}
                                                    >
                                                        {searchingRooms ? 'Searching...' : 'Search Availability'}
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="form-group">
                                    <label><RiHotelBedLine /> Room Number</label>
                                    {room.isExistingRoom ? (
                                        <div className="existing-room-number">
                                            Room {room.roomNumber}
                                            <span className="room-price">₹{room.price_per_night}/night</span>
                                        </div>
                                    ) : (
                                        <div className="new-room-selection">
                                            <select
                                                value={room.roomId || ''}
                                                onChange={(e) => {
                                                    const selectedRoom = availableRooms[index]?.find(r => r.room_id.toString() === e.target.value);
                                                    if (selectedRoom) {
                                                        setFormData(prev => {
                                                            const updatedSelections = [...prev.roomSelections];
                                                            updatedSelections[index] = {
                                                                ...updatedSelections[index],
                                                                roomId: selectedRoom.room_id,
                                                                room_id: selectedRoom.room_id,
                                                                roomNumber: selectedRoom.room_number,
                                                                room_number: selectedRoom.room_number,
                                                                price_per_night: selectedRoom.price_per_night,
                                                                isExistingRoom: false
                                                            };
                                                            return {
                                                                ...prev,
                                                                roomSelections: updatedSelections
                                                            };
                                                        });
                                                        setTimeout(() => calculateTotalAmount(), 0);
                                                    }
                                                }}
                                                className="form-control"
                                                disabled={!room.roomType || searchingRooms}
                                            >
                                                <option value="">Select Room Number</option>
                                                {searchingRooms ? (
                                                    <option value="" disabled>Searching available rooms...</option>
                                                ) : !room.roomType ? (
                                                    <option value="" disabled>Select room type first</option>
                                                ) : !availableRooms[index] || availableRooms[index].length === 0 ? (
                                                    <option value="" disabled>No rooms available for selected type</option>
                                                ) : (
                                                    availableRooms[index].map(availableRoom => (
                                                        <option key={availableRoom.room_id} value={availableRoom.room_id}>
                                                            Room {availableRoom.room_number} - ₹{availableRoom.price_per_night}/night
                                                        </option>
                                                    ))
                                                )}
                                            </select>
                                            {room.roomId && room.roomNumber && (
                                                <div className="selected-room-info">
                                                    Selected: Room {room.roomNumber} - ₹{room.price_per_night}/night
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Manual Pricing Section - For both existing and new rooms */}
                            {room.roomId && numberOfNights > 0 && (
                                <div className="manual-pricing-section">
                                    <button
                                        type="button"
                                        onClick={() => toggleManualPricing(index)}
                                        className="toggle-manual-pricing-btn"
                                    >
                                        {manualPricingMode[index] ? 'Use Previous Price' : 'Add Price Manually'}
                                    </button>
                                    
                                    {manualPricingMode[index] && room.nightlyPrices && (
                                        <div className="room-nightly-prices">
                                            <h5>Nightly Prices {room.isExistingRoom && <span className="existing-room-label">(Existing Room)</span>}</h5>
                                            {room.nightlyPrices.map((price, nightIndex) => (
                                                <div key={nightIndex} className="night-price-row">
                                                    <label>Night {nightIndex + 1}:</label>
                                                    <input
                                                        type="number"
                                                        value={price || ''}
                                                        onChange={(e) => handleNightlyPriceChange(index, nightIndex, e.target.value)}
                                                        className="price-input"
                                                        placeholder="Enter price"
                                                        min="0"
                                                        step="0.01"
                                                        disabled={room.isExistingRoom && !room.isRestoredRoom}
                                                        title={room.isExistingRoom && !room.isRestoredRoom ? "Cannot edit existing room prices" : ""}
                                                    />
                                                </div>
                                            ))}
                                            {room.nightlyPrices.length > 0 && (
                                                <div className="room-total">
                                                    <strong>Room Total:</strong> ₹{room.nightlyPrices.reduce((sum, price) => sum + (parseFloat(price) || 0), 0).toFixed(2)}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Primary Guest Details */}
                <div className="form-section">
                    <h3>Primary Guest Details</h3>
                    <div className="guest-details">
                        <div className="form-group">
                            <label><RiUserLine /> Guest Name</label>
                            <input
                                type="text"
                                name="customerName"
                                value={formData.customerName}
                                onChange={handleInputChange}
                                className="form-control"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label><RiPhoneLine /> Phone Number</label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                className="form-control"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label><RiMailLine /> Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="form-control"
                            />
                        </div>
                        <div className="form-group">
                            <label>ID Proof Type</label>
                            <select
                                name="id_proof"
                                value={formData.id_proof}
                                onChange={handleInputChange}
                                className="form-control"
                                required
                            >
                                {idProofTypes.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>ID Proof Number</label>
                            <input
                                type="text"
                                name="id_proof_number"
                                value={formData.id_proof_number}
                                onChange={handleInputChange}
                                className="form-control"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>GST Number (Optional)</label>
                            <input
                                type="text"
                                name="gstNumber"
                                value={formData.gstNumber}
                                onChange={handleInputChange}
                                className="form-control"
                            />
                        </div>
                        <div className="form-group">
                            <label>Meal Plan</label>
                            <input
                                type="text"
                                name="mealPlan"
                                value={formData.mealPlan}
                                onChange={handleInputChange}
                                className="form-control"
                            />
                        </div>
                        
                    </div>
                </div>

                {/* Address Details */}
                <div className="form-section">
                    <h3>Address Details</h3>
                    <div className="address-fields">
                        <div className="form-group">
                            <label><RiMapPinLine /> Address Line 1</label>
                            <input
                                type="text"
                                name="addressLine1"
                                value={formData.addressLine1}
                                onChange={handleInputChange}
                                className="form-control"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Address Line 2</label>
                            <input
                                type="text"
                                name="addressLine2"
                                value={formData.addressLine2}
                                onChange={handleInputChange}
                                className="form-control"
                            />
                        </div>
                        <div className="form-group">
                            <label>City</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                className="form-control"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>State</label>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                className="form-control"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Country</label>
                            <input
                                type="text"
                                name="country"
                                value={formData.country}
                                onChange={handleInputChange}
                                className="form-control"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>PIN Code</label>
                            <input
                                type="text"
                                name="pin"
                                value={formData.pin}
                                onChange={handleInputChange}
                                className="form-control"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Additional Guests */}
                <div className="form-section">
                    <div className="section-header">
                        <h3>Additional Guests</h3>
                        <button
                            type="button"
                            onClick={() => setShowGuestForms(!showGuestForms)}
                            className="toggle-button"
                        >
                            {showGuestForms ? 'Hide' : 'Show'}
                        </button>
                    </div>
                    
                    {showGuestForms && (
                        <div className="additional-guests">
                            {additionalGuests.map((guest, index) => (
                                <div key={index} className="guest-form">
                                    <h4>Guest {index + 1}</h4>
                                    <div className="guest-fields">
                                        <div className="form-group">
                                            <label>Name</label>
                                            <input
                                                type="text"
                                                value={guest.name}
                                                onChange={(e) => handleAdditionalGuestChange(index, 'name', e.target.value)}
                                                className="form-control"
                                            />
                                        </div>
                                       
                                        <div className="form-group">
                                            <label>ID Proof Type</label>
                                            <select
                                                value={guest.id_proof}
                                                onChange={(e) => handleAdditionalGuestChange(index, 'id_proof', e.target.value)}
                                                className="form-control"
                                            >
                                                {idProofTypes.map(type => (
                                                    <option key={type.value} value={type.value}>
                                                        {type.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>ID Proof Number</label>
                                            <input
                                                type="text"
                                                value={guest.id_proof_number}
                                                onChange={(e) => handleAdditionalGuestChange(index, 'id_proof_number', e.target.value)}
                                                className="form-control"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeAdditionalGuest(index)}
                                        className="remove-guest-btn"
                                    >
                                        Remove Guest
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addAdditionalGuest}
                                className="add-guest-btn"
                            >
                                Add Guest
                            </button>
                        </div>
                    )}
                </div>

                {/* Summary Section */}
                <div className="form-section summary-section">
                    <h3>Booking Summary</h3>
                    <div className="summary-details">
                        <p>Number of Guests: <strong>{1 + additionalGuests.length}</strong></p> {/* 1 primary guest + additional guests */}
                        <p>Payment Status: <strong>{formData.paymentStatus}</strong></p>
                        <p>Booking Status: <strong>{formData.bookingStatus}</strong></p>
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="button-group">
                    <button type="button" onClick={() => navigate('/bookings')} className="cancel-button">
                        Cancel
                    </button>
                    <button type="submit" className="save-button" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );

};
export default EditBooking;