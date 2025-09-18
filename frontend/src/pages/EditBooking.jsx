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
    console.log("bookingId:", bookingId);
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
            const nights = Math.max(1, Math.ceil(
                (formData.checkOutDate - formData.checkInDate) / (1000 * 60 * 60 * 24)
            ));
            setNumberOfNights(nights);
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
            // console.log("booingData", bookingData);
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
                roomSelections: (bookingData.rooms || []).map(room => {
        if (!room) {
            console.error('Invalid room data:', room);
            return null;
        }

        const roomId = room.room_id ? parseInt(room.room_id, 10) : null;
        const roomType = room.room_type || '';
        const roomNumber = room.room_number || '';
        const pricePerNight = parseFloat(room.price_per_night) || 0;

        // Store complete room data for existing rooms
        const originalData = {
            room_id: roomId,
            room_type: roomType,
            room_number: roomNumber,
            price_per_night: pricePerNight
        };

        // Create a room selection with all necessary data
        return {
            roomId: roomId,
            roomType: roomType,
            roomNumber: roomNumber,
            price_per_night: pricePerNight,
            isExistingRoom: true, // Flag to identify existing rooms
            originalData: originalData, // Keep original data for reference
            readonly: true, // Make the room type selection read-only for existing rooms
            guests: room.guests || []
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
        } catch (error) {
            console.error('Error fetching booking details:', error);
            toast.error(error.response?.data?.message || error.message || 'Failed to fetch booking details');
            setError(error.response?.data?.message || error.message || 'Failed to fetch booking details');
            setLoading(false);
        }
    };

    const searchAvailableRooms = async (roomIndex) => {
        const currentSelection = formData.roomSelections?.[roomIndex];
        if (!currentSelection) {
            console.log('No room selection found for index:', roomIndex);
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
                const currentRoomExists = formattedRooms.some(room => room.id === currentSelection.roomId);
                if (!currentRoomExists) {
                    // Always include the existing room at the start of the list for better visibility
                    formattedRooms.unshift({
                        id: currentSelection.roomId,
                        number: currentSelection.roomNumber,
                        type: currentSelection.roomType,
                        price_per_night: parseFloat(currentSelection.price_per_night),
                        isExistingRoom: true // Mark this as the existing room for UI purposes
                    });
                }
            }

            // Sort rooms by room number for consistent display
            formattedRooms.sort((a, b) => a.number.localeCompare(b.number));

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
        formData.roomSelections.forEach((_, index) => {
            searchAvailableRooms(index);
        });
    }, [formData.checkInDate, formData.checkOutDate]);

    const calculateTotalAmount = () => {
        if (!formData.checkInDate || !formData.checkOutDate) {
            return;
        }

        const nights = Math.max(1, Math.ceil(
            (formData.checkOutDate - formData.checkInDate) / (1000 * 60 * 60 * 24)
        ));
        
        let roomsTotal = 0;
        formData.roomSelections.forEach(room => {
            if (room.price_per_night) {
                roomsTotal += parseFloat(room.price_per_night) || 0;
            }
        });

        const totalAmount = roomsTotal * nights;
        // console.log('Calculating total:', { roomsTotal, nights, totalAmount });

        setFormData(prev => ({
            ...prev,
            totalAmount: totalAmount
        }));
        setNumberOfNights(nights);
    };

    // Effect to recalculate total amount when room selections or nights change
    useEffect(() => {
        calculateTotalAmount();
    }, [formData.roomSelections, numberOfNights]);
    

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

    // Calculate nights between two dates
    const calculateNights = (startDate, endDate) => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

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

        // Update form data with new dates
        setFormData(prev => ({
            ...prev,
            checkInDate: newCheckIn,
            checkOutDate: newCheckOut
        }));
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
                calculateTotalAmount();
            } else {
                toast.error('Selected room not found in available rooms list');
            }
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
            originalData: roomData,
            roomType: roomData.roomType,
            roomNumber: roomData.roomNumber
        };
        
        // Add the room back to selections at its previous position or at the end
        const insertIndex = typeof roomData.previousIndex === 'number' ? 
            Math.min(roomData.previousIndex, formData.roomSelections.length) : 
            formData.roomSelections.length;

        setFormData(prev => ({
            ...prev,
            roomSelections: [
                ...prev.roomSelections.slice(0, insertIndex),
                restoredRoom,
                ...prev.roomSelections.slice(insertIndex)
            ]
        }));

        // Remove from removedRooms using _id or room number as identifier
        setRemovedRooms(prev => prev.filter(room => 
            room._id ? room._id !== roomData._id : room.roomNumber !== roomData.roomNumber
        ));
    };

    const removeRoom = (index) => {
        const roomToRemove = formData.roomSelections[index];
        
        // If it's an existing room, store it in removedRooms for reference
        if (roomToRemove.isExistingRoom) {
            setRemovedRooms(prev => [...prev, {
                ...roomToRemove.originalData,
                roomNumber: roomToRemove.roomNumber,
                roomType: roomToRemove.roomType,
                previousIndex: index
            }]);
        }

        if (formData.roomSelections.length <= 1) {
            toast.error('Cannot remove the last room');
            return;
        }

        setFormData(prev => ({
            ...prev,
            roomSelections: prev.roomSelections.filter((_, i) => i !== index),
            numberOfRooms: prev.roomSelections.length - 1
        }));
        
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
            .map(room => {
                // For existing rooms - preserve all data and update status
                if (room.isExistingRoom) {
                    const newStatus = formData.bookingStatus=== 'Checked-in' ? 'Occupied' :
                                     formData.bookingStatus === 'Checked-out' ? 'Available' : 'Booked';
                    
                    // Ensure room_id is properly formatted
                    return {
                        ...room.originalData,
                        room_id: parseInt(room.originalData.room_id || room.roomId, 10),
                        status: newStatus
                    };
                }

                // For new rooms
                const roomId = parseInt(room.roomId, 10);
                const pricePerNight = parseFloat(room.price_per_night);

                if (isNaN(roomId) || isNaN(pricePerNight)) {
                    return null;
                }

            return {
                room_id: roomId,
                room_type: room.roomType || room.room_type,
                room_number: room.roomNumber || room.room_number,
                price_per_night: pricePerNight,
                status: formData.bookingStatus === 'Checked-in' ? 'Occupied' :
                        formData.bookingStatus === 'Checked-out' ? 'Available' : 'Booked'
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
            selected_rooms: validRooms // Only include valid rooms
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
            <h2 className="edit-booking-title">Edit Booking Details</h2>
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