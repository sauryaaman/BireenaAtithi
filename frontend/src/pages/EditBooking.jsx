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
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);
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

    // Helper function to calculate prorate days from check-in to today
    const calculateProrateFromCheckInToToday = (checkInDate) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkIn = new Date(checkInDate);
        checkIn.setHours(0, 0, 0, 0);
        
        if (checkIn > today) {
            // Booking hasn't started yet, return 0
            return 0;
        }
        
        const daysElapsed = Math.ceil((today - checkIn) / (1000 * 60 * 60 * 24));
        return Math.max(1, daysElapsed);
    };

    // Helper function to calculate days from today to removal
    const calculateDaysUntilRemoval = (currentDate) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const removDate = new Date(currentDate);
        removDate.setHours(0, 0, 0, 0);
        
        const daysDifference = Math.ceil((removDate - today) / (1000 * 60 * 60 * 24));
        return Math.max(0, daysDifference);
    };

    // Helper function to calculate the original price of an existing room
    const calculateExistingRoomOriginalPrice = (room, nights) => {
        if (room.uses_nightly_rates && room.nightlyPrices && room.nightlyPrices.length > 0) {
            return room.nightlyPrices.reduce((sum, price) => sum + (parseFloat(price) || 0), 0);
        } else if (room.price_per_night) {
            return (parseFloat(room.price_per_night) || 0) * nights;
        }
        return 0;
    };

    // Effect to handle date changes
    useEffect(() => {
        if (formData.checkInDate && formData.checkOutDate && initialLoadComplete) {
            // Only recalculate if dates were changed AFTER initial load
            calculateTotalAmount();
            
            // Clear available rooms when dates change to force re-searching
            setAvailableRooms({});
        }
    }, [formData.checkInDate, formData.checkOutDate, initialLoadComplete]);

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
            originalPrice: totalPrice, // Store original total price for reference
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
            // ✅ FIXED: Use room_id instead of array index as key
            const manualPricingModeState = {};
            (bookingData.rooms || []).forEach((room) => {
                if (room.uses_nightly_rates && room.nightly_rates && room.nightly_rates.length > 0) {
                    // ✅ CRITICAL: Use room.room_id (not roomId) since backend returns room_id
                    const roomId = room.room_id;
                    if (roomId) {
                        manualPricingModeState[roomId] = true;
                    }
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
            
            // 🔴 CONSOLE LOGGING: Edit Page Opened - Show Initial Booking Details
            console.log('═══════════════════════════════════════════════════════════');
            console.log('📋 EDIT PAGE OPENED - INITIAL BOOKING DETAILS');
            console.log('═══════════════════════════════════════════════════════════');
            console.log(`✅ Booking ID: ${bookingId}`);
            console.log(`📅 Check-in Date: ${format(checkInDate, 'dd-MMM-yyyy')}`);
            console.log(`📅 Check-out Date: ${format(checkOutDate, 'dd-MMM-yyyy')}`);
            console.log(`🌙 Total Nights: ${nights}`);
            console.log(`💰 Original Total Amount: ₹${bookingData.total_amount || 0}`);
            console.log('───────────────────────────────────────────────────────────');
            console.log('🏨 EXISTING ROOMS BREAKDOWN:');
            (bookingData.rooms || []).forEach((room, idx) => {
                const roomTotal = room.uses_nightly_rates && room.nightly_rates 
                    ? room.nightly_rates.reduce((sum, nr) => sum + parseFloat(nr.rate || 0), 0)
                    : (parseFloat(room.price_per_night) || 0) * nights;
                console.log(`  Room ${idx + 1}: ${room.room_type} (${room.room_number}) - Room ID: ${room.room_id}`);
                console.log(`    - Price per night: ₹${room.price_per_night}`);
                console.log(`    - Uses nightly rates: ${room.uses_nightly_rates}`);
                if (room.uses_nightly_rates && room.nightly_rates) {
                    console.log(`    ✅ MANUAL PRICING ENABLED`);
                    console.log(`    - Nightly rates: [${room.nightly_rates.map(nr => parseFloat(nr.rate || 0)).join(', ')}]`);
                } else {
                    console.log(`    - Auto pricing (fixed rate)`);
                }
                console.log(`    - Total for ${nights} nights: ₹${roomTotal}`);
            });
            console.log('═══════════════════════════════════════════════════════════\n');
            
            // Mark initial load as complete after all data is loaded
            // This allows useEffect to start recalculating total when user makes changes
            setTimeout(() => setInitialLoadComplete(true), 100);
        } catch (error) {
            console.error('Error fetching booking details:', error);
            console.log('═══════════════════════════════════════════════════════════');
            console.log('❌ ERROR LOADING BOOKING');
            console.log('═══════════════════════════════════════════════════════════');
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
        
        let totalAmount = 0;
        const daysUsed = calculateProrateFromCheckInToToday(formData.checkInDate);
        const daysRemainingForNewRooms = Math.max(0, nights - daysUsed);
        
        // 🔍 CONSOLE LOGGING: Calculate Total Amount
        console.log('═══════════════════════════════════════════════════════════');
        console.log('💰 CALCULATE TOTAL AMOUNT - START');
        console.log('═══════════════════════════════════════════════════════════');
        console.log(`📅 Check-in: ${format(formData.checkInDate, 'dd-MMM-yyyy')}`);
        console.log(`📅 Check-out: ${format(formData.checkOutDate, 'dd-MMM-yyyy')}`);
        console.log(`🌙 Total nights: ${nights}`);
        console.log(`📌 Days used (Check-in to Today): ${daysUsed} din`);
        console.log(`⏳ Days remaining (Today to Check-out): ${daysRemainingForNewRooms} din`);
        console.log('───────────────────────────────────────────────────────────');
        
        // Separate existing and new rooms
        const existingRoomsList = [];
        const newRoomsList = [];
        
        // CASE 1: Manual pricing for EXISTING rooms
        // Use the nightly prices that user entered
        formData.roomSelections.forEach((room, index) => {
            if (room.isExistingRoom && !room.isRestoredRoom) {
                existingRoomsList.push({ room, index });
                // EXISTING ROOM
                let roomTotal = 0;
                // ✅ FIXED: Use room.roomId instead of index as key
                if (manualPricingMode[room.roomId] && room.nightlyPrices && room.nightlyPrices.length > 0) {
                    // User manually entered prices - USE THEM DIRECTLY
                    const nightlyTotal = room.nightlyPrices.reduce((sum, price) => sum + (parseFloat(price) || 0), 0);
                    roomTotal = nightlyTotal;
                    console.log(`\n🏨 EXISTING ROOM ${index + 1}: ${room.roomType} (${room.roomNumber})`);
                    console.log(`   Mode: MANUAL PRICING ✏️`);
                    console.log(`   Nightly rates: [${room.nightlyPrices.map(p => parseFloat(p || 0).toFixed(0)).join(', ')}]`);
                    console.log(`   Total: ₹${roomTotal.toFixed(2)}`);
                } else if (room.uses_nightly_rates && room.nightlyPrices && room.nightlyPrices.length > 0) {
                    // Has nightly rates from database - use them
                    const nightlyTotal = room.nightlyPrices.reduce((sum, price) => sum + (parseFloat(price) || 0), 0);
                    roomTotal = nightlyTotal;
                    console.log(`\n🏨 EXISTING ROOM ${index + 1}: ${room.roomType} (${room.roomNumber})`);
                    console.log(`   Mode: NIGHTLY RATES (from DB)`);
                    console.log(`   Rates: [${room.nightlyPrices.map(p => parseFloat(p || 0).toFixed(0)).join(', ')}]`);
                    console.log(`   Total: ₹${roomTotal.toFixed(2)}`);
                } else if (room.price_per_night) {
                    // Use per-night rate * nights (CASE 1: Date change scenario)
                    roomTotal = (parseFloat(room.price_per_night) || 0) * nights;
                    console.log(`\n🏨 EXISTING ROOM ${index + 1}: ${room.roomType} (${room.roomNumber})`);
                    console.log(`   Mode: AUTO (Price per night)`);
                    console.log(`   ₹${room.price_per_night} × ${nights} nights = ₹${roomTotal.toFixed(2)}`);
                }
                totalAmount += roomTotal;
            } else if (room.isExistingRoom && room.isRestoredRoom) {
                // RESTORED ROOM (was removed, now added back)
                let roomTotal = 0;
                // ✅ FIXED: Use room.roomId instead of index as key
                if (manualPricingMode[room.roomId] && room.nightlyPrices && room.nightlyPrices.length > 0) {
                    const nightlyTotal = room.nightlyPrices.reduce((sum, price) => sum + (parseFloat(price) || 0), 0);
                    roomTotal = nightlyTotal;
                    console.log(`\n🔄 RESTORED ROOM ${index + 1}: ${room.roomType} (${room.roomNumber})`);
                    console.log(`   Mode: MANUAL PRICING ✏️`);
                    console.log(`   Total: ₹${roomTotal.toFixed(2)}`);
                } else if (room.price_per_night) {
                    roomTotal = (parseFloat(room.price_per_night) || 0) * nights;
                    console.log(`\n🔄 RESTORED ROOM ${index + 1}: ${room.roomType} (${room.roomNumber})`);
                    console.log(`   ₹${room.price_per_night} × ${nights} nights = ₹${roomTotal.toFixed(2)}`);
                }
                totalAmount += roomTotal;
            } else {
                newRoomsList.push({ room, index });
                // NEW ROOM - Use remaining days only (CASE 2)
                let roomTotal = 0;
                // ✅ FIXED: Use room.roomId instead of index as key
                if (manualPricingMode[room.roomId] && room.nightlyPrices && room.nightlyPrices.length > 0) {
                    // User entered prices for remaining days
                    const nightlyTotal = room.nightlyPrices.reduce((sum, price) => sum + (parseFloat(price) || 0), 0);
                    roomTotal = nightlyTotal;
                    console.log(`\n✨ NEW ROOM ${index + 1}: ${room.roomType} (${room.roomNumber})`);
                    console.log(`   Mode: MANUAL PRICING ✏️`);
                    console.log(`   Nightly rates: [${room.nightlyPrices.map(p => parseFloat(p || 0).toFixed(0)).join(', ')}]`);
                    console.log(`   Total: ₹${roomTotal.toFixed(2)}`);
                } else if (room.price_per_night) {
                    // Use remaining days only
                    const daysToCharge = room.daysRemaining !== undefined ? room.daysRemaining : daysRemainingForNewRooms;
                    roomTotal = (parseFloat(room.price_per_night) || 0) * daysToCharge;
                    console.log(`\n✨ NEW ROOM ${index + 1}: ${room.roomType} (${room.roomNumber})`);
                    console.log(`   Mode: AUTO (Remaining days only)`);
                    console.log(`   ₹${room.price_per_night} × ${daysToCharge} remaining days = ₹${roomTotal.toFixed(2)}`);
                }
                totalAmount += roomTotal;
            }
        });

        console.log('───────────────────────────────────────────────────────────');
        console.log(`📊 BREAKDOWN:`);
        console.log(`   Existing rooms: ${existingRoomsList.length}`);
        console.log(`   New rooms: ${newRoomsList.length}`);
        console.log(`   TOTAL AMOUNT: ₹${totalAmount.toFixed(2)}`);
        console.log('═══════════════════════════════════════════════════════════\n');

        // ✅ AUTO-SET PAYMENT STATUS TO PARTIAL IF TOTAL INCREASED
        console.log(`\n💳 PAYMENT STATUS CHECK:`);
        console.log(`   Original total: ₹${originalBookingTotal.toFixed(2)}`);
        console.log(`   New total: ₹${totalAmount.toFixed(2)}`);
        console.log(`   Difference: ₹${(totalAmount - originalBookingTotal).toFixed(2)}`);

        let newPaymentStatus = formData.paymentStatus;
        if (totalAmount > originalBookingTotal) {
            console.log(`   ⚠️ TOTAL INCREASED! Auto-setting payment status to PARTIAL`);
            newPaymentStatus = 'PARTIAL';
        }

        // Update form data with calculated total AND auto-set payment status if needed
        setFormData(prev => ({
            ...prev,
            totalAmount: totalAmount,
            paymentStatus: newPaymentStatus
        }));
    };

    // Track original room count to detect when user adds/removes rooms
    const [originalRoomCount, setOriginalRoomCount] = useState(0);
    
    // Track original booking total amount (from database)
    const [originalBookingTotal, setOriginalBookingTotal] = useState(0);
    
    // Track if dates have been changed from original
    const [datesChanged, setDatesChanged] = useState(false);
    const [originalNights, setOriginalNights] = useState(0);

    // ✅ CHANGE 1: LOCK calculateTotalAmount() to DATE CHANGES ONLY
    // ❌ REMOVED: useEffect for roomSelections.length
    // Reason: Full recalculation should ONLY happen on date changes
    // Room add/remove/restore now handle their own totals manually
    

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
        const oldNights = calculateNights(formData.checkInDate, formData.checkOutDate);

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

        // Calculate extra days (for existing rooms when checkout extends)
        const extraDays = Math.max(0, nights - oldNights);

        // Update form data with new dates and adjust nightly prices for all rooms
        setFormData(prev => {
            const daysUsed = calculateProrateFromCheckInToToday(newCheckIn);
            const daysRemainingForNewRooms = Math.max(0, nights - daysUsed);
            
            const updatedRoomSelections = prev.roomSelections.map((room, idx) => {
                // Check if this room uses nightly rates (manual pricing mode OR existing room with uses_nightly_rates)
                // ✅ FIXED: Use room.roomId instead of idx as key
                const usesNightlyRates = manualPricingMode[room.roomId] || (room.isExistingRoom && room.uses_nightly_rates);
                
                // Update if: room is in manual mode OR has nightly prices OR is an existing room with nightly rates
                if (usesNightlyRates && (room.nightlyPrices?.length > 0 || room.showNightlyRates || room.uses_nightly_rates)) {
                    const currentNightlyPrices = room.nightlyPrices || [];
                    const currentNights = currentNightlyPrices.length;
                    
                    let newNightlyPrices = [...currentNightlyPrices];
                    
                    if (room.isExistingRoom && !room.isRestoredRoom) {
                        // EXISTING ROOM: Update for total nights
                        if (nights > currentNights) {
                            const lastPrice = currentNightlyPrices[currentNights - 1] || room.price_per_night || 0;
                            for (let i = currentNights; i < nights; i++) {
                                newNightlyPrices.push(lastPrice);
                            }
                        } else if (nights < currentNights) {
                            newNightlyPrices = newNightlyPrices.slice(0, nights);
                        }
                    } else {
                        // NEW ROOM or RESTORED ROOM: Update for remaining days only
                        if (daysRemainingForNewRooms > currentNights) {
                            // Remaining days increased - add more input fields
                            const lastPrice = currentNightlyPrices[currentNights - 1] || room.price_per_night || 0;
                            for (let i = currentNights; i < daysRemainingForNewRooms; i++) {
                                newNightlyPrices.push(lastPrice);
                            }
                        } else if (daysRemainingForNewRooms < currentNights) {
                            // Remaining days decreased - remove input fields
                            newNightlyPrices = newNightlyPrices.slice(0, daysRemainingForNewRooms);
                        }
                    }
                    
                    return {
                        ...room,
                        nightlyPrices: newNightlyPrices,
                        nights: nights,
                        daysRemaining: !room.isExistingRoom ? daysRemainingForNewRooms : nights
                    };
                }
                
                // For rooms not in manual pricing mode
                return {
                    ...room,
                    nights: nights,
                    daysRemaining: !room.isExistingRoom ? daysRemainingForNewRooms : nights
                };
            });
            
            // Calculate new total amount if nights changed
            let newTotalAmount = prev.totalAmount;
            
            if (nightsHaveChanged) {
                // 🔴 CONSOLE LOGGING: Checkout date changed
                console.log('═══════════════════════════════════════════════════════════');
                console.log('📅 CHECKOUT DATE CHANGED - CASE 2');
                console.log('═══════════════════════════════════════════════════════════');
                console.log(`Old nights: ${oldNights}, New nights: ${nights}`);
                console.log(`Extra days: ${extraDays}`);
                console.log(`Days used (check-in to today): ${daysUsed}`);
                console.log(`Remaining days for new rooms: ${daysRemainingForNewRooms}`);
                
                if (extraDays > 0) {
                    // CASE 2A: Checkout INCREASED - Add only extra days for existing rooms
                    newTotalAmount = 0;
                    
                    updatedRoomSelections.forEach((room, index) => {
                        if (room.isExistingRoom && !room.isRestoredRoom) {
                            // EXISTING ROOM: Add only the EXTRA days price
                            console.log(`\n🏨 Room ${index + 1} - EXISTING ROOM`);
                            
                            // ✅ FIXED: Use room.roomId instead of index as key
                            if (manualPricingMode[room.roomId] && room.nightlyPrices && room.nightlyPrices.length > 0) {
                                // User manually set prices - sum only the last extraDays prices
                                const extraNightlyPrices = room.nightlyPrices.slice(-extraDays);
                                const extraPrice = extraNightlyPrices.reduce((sum, price) => sum + (parseFloat(price) || 0), 0);
                                newTotalAmount += extraPrice;
                                console.log(`  📌 Manual mode: +₹${extraPrice} for ${extraDays} extra days`);
                                console.log(`  📊 Extra prices: [${extraNightlyPrices.map(p => parseFloat(p || 0).toFixed(2)).join(', ')}]`);
                            } else if (room.uses_nightly_rates && room.nightlyPrices && room.nightlyPrices.length > 0) {
                                // Database nightly rates - sum only the last extraDays
                                const extraNightlyPrices = room.nightlyPrices.slice(-extraDays);
                                const extraPrice = extraNightlyPrices.reduce((sum, price) => sum + (parseFloat(price) || 0), 0);
                                newTotalAmount += extraPrice;
                                console.log(`  📌 DB rates: +₹${extraPrice} for ${extraDays} extra days`);
                            } else if (room.price_per_night) {
                                // Per-night rate - multiply by extra days only
                                const extraPrice = (parseFloat(room.price_per_night) || 0) * extraDays;
                                newTotalAmount += extraPrice;
                                console.log(`  📌 Per-night: +₹${extraPrice} (₹${room.price_per_night} × ${extraDays} days)`);
                            }
                        } else {
                            // NEW ROOM or RESTORED ROOM: Recalculate with new remaining days
                            console.log(`\n🏨 Room ${index + 1} - NEW/RESTORED ROOM`);
                            
                            // ✅ FIXED: Use room.roomId instead of index as key
                            if (manualPricingMode[room.roomId] && room.nightlyPrices && room.nightlyPrices.length > 0) {
                                // Manual pricing - use as-is (already for remaining days)
                                const roomTotal = room.nightlyPrices.reduce((sum, price) => sum + (parseFloat(price) || 0), 0);
                                newTotalAmount += roomTotal;
                                console.log(`  📌 Manual mode: ₹${roomTotal} (${daysRemainingForNewRooms} remaining days)`);
                            } else if (room.price_per_night) {
                                // Per-night rate - multiply by remaining days only
                                const roomTotal = (parseFloat(room.price_per_night) || 0) * daysRemainingForNewRooms;
                                newTotalAmount += roomTotal;
                                console.log(`  📌 Per-night: ₹${roomTotal} (₹${room.price_per_night} × ${daysRemainingForNewRooms} days)`);
                            }
                        }
                    });
                    
                    console.log(`\n📊 TOTAL CALCULATION:`);
                    console.log(`   Existing rooms (extra days only): Added above`);
                    console.log(`   New/Restored rooms (remaining days): Added above`);
                    console.log(`   ════════════════════════════════════════`);
                    console.log(`📊 NEW TOTAL: ₹${newTotalAmount.toFixed(2)}`);
                } else if (extraDays < 0) {
                    // CASE 2B: Checkout DECREASED - Recalculate all rooms
                    newTotalAmount = 0;
                    console.log(`\n⚠️ Checkout date REDUCED by ${Math.abs(extraDays)} days`);
                    
                    updatedRoomSelections.forEach((room, index) => {
                        if (room.isExistingRoom && !room.isRestoredRoom) {
                            // EXISTING ROOM: Recalculate with new total nights
                            console.log(`\n🏨 Room ${index + 1} - EXISTING ROOM (recalculating)`);
                            
                            // ✅ FIXED: Use room.roomId instead of index as key
                            if (manualPricingMode[room.roomId] && room.nightlyPrices && room.nightlyPrices.length > 0) {
                                const roomTotal = room.nightlyPrices.reduce((sum, price) => sum + (parseFloat(price) || 0), 0);
                                newTotalAmount += roomTotal;
                                console.log(`  📌 Manual mode: ₹${roomTotal} (${room.nightlyPrices.length} days)`);
                            } else if (room.uses_nightly_rates && room.nightlyPrices && room.nightlyPrices.length > 0) {
                                const roomTotal = room.nightlyPrices.reduce((sum, price) => sum + (parseFloat(price) || 0), 0);
                                newTotalAmount += roomTotal;
                                console.log(`  📌 DB rates: ₹${roomTotal} (${room.nightlyPrices.length} days)`);
                            } else if (room.price_per_night) {
                                const roomTotal = (parseFloat(room.price_per_night) || 0) * nights;
                                newTotalAmount += roomTotal;
                                console.log(`  📌 Per-night: ₹${roomTotal} (₹${room.price_per_night} × ${nights} days)`);
                            }
                        } else {
                            // NEW ROOM or RESTORED ROOM: Recalculate with new remaining days
                            console.log(`\n🏨 Room ${index + 1} - NEW/RESTORED ROOM (recalculating)`);
                            
                            // ✅ FIXED: Use room.roomId instead of index as key
                            if (manualPricingMode[room.roomId] && room.nightlyPrices && room.nightlyPrices.length > 0) {
                                const roomTotal = room.nightlyPrices.reduce((sum, price) => sum + (parseFloat(price) || 0), 0);
                                newTotalAmount += roomTotal;
                                console.log(`  📌 Manual mode: ₹${roomTotal} (${daysRemainingForNewRooms} days)`);
                            } else if (room.price_per_night) {
                                const roomTotal = (parseFloat(room.price_per_night) || 0) * daysRemainingForNewRooms;
                                newTotalAmount += roomTotal;
                                console.log(`  📌 Per-night: ₹${roomTotal} (₹${room.price_per_night} × ${daysRemainingForNewRooms} days)`);
                            }
                        }
                    });
                    
                    console.log(`\n📊 RECALCULATED TOTAL: ₹${newTotalAmount.toFixed(2)}`);
                }
                console.log('═══════════════════════════════════════════════════════════\n');
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
            
            // ✅ CHANGE 6: REMOVED calculateTotalAmount() call
            // Total is only recalculated on date changes, not room selections
            
            // Search for available rooms with the new room type
            await searchAvailableRooms(index);
            
        } else if (field === 'roomId' && value) {
            // When room number is selected, update the room details
            const selectedRoom = availableRooms[index]?.find(room => room.room_id.toString() === value);
            
            // Calculate remaining days for this new room
            const daysRemaining = Math.max(0, nights - calculateProrateFromCheckInToToday(formData.checkInDate));
            const chargeAmount = (selectedRoom?.price_per_night || 0) * daysRemaining;
            
            // 🔴 CONSOLE LOGGING: New Room Selected
            console.log('═══════════════════════════════════════════════════════════');
            console.log('✅ NEW ROOM SELECTED');
            console.log('═══════════════════════════════════════════════════════════');
            console.log(`🏨 Room: ${selectedRoom?.room_type} (${selectedRoom?.room_number})`);
            console.log(`💰 Price per night: ₹${selectedRoom?.price_per_night}`);
            console.log('───────────────────────────────────────────────────────────');
            console.log('📊 REMAINING DAYS CALCULATION:');
            console.log(`   Total booking nights: ${nights}`);
            console.log(`   Days already used: ${calculateProrateFromCheckInToToday(formData.checkInDate)}`);
            console.log(`   Days REMAINING: ${daysRemaining}`);
            console.log('───────────────────────────────────────────────────────────');
            console.log('💰 PRICE CALCULATION:');
            console.log(`   ₹${selectedRoom?.price_per_night} per night × ${daysRemaining} remaining days`);
            console.log(`   = ₹${chargeAmount.toFixed(2)}`);
            console.log('───────────────────────────────────────────────────────────');
            console.log(`📊 Amount to charge: ₹${chargeAmount.toFixed(2)}`);
            console.log(`   Previous total: ₹${formData.totalAmount.toFixed(2)}`);
            console.log('═══════════════════════════════════════════════════════════\n');
            
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
                    isExistingRoom: false,
                    daysRemaining: daysRemaining,  // Store remaining days for prorate
                    prorateChargedDays: daysRemaining,  // Track how many days are being charged
                    chargedAmount: chargeAmount  // 🎯 Store the exact charge amount for this room
                };
                
                // 🎯 RECALCULATE TOTAL from scratch (not just adding)
                let recalculatedTotal = 0;
                const roomBreakdown = [];
                updatedSelections.forEach((room, roomIdx) => {
                    if (room.roomId || room.room_id) {  // Only count rooms that have been selected
                        if (room.isExistingRoom && !room.isRestoredRoom) {
                            // EXISTING ROOM: price_per_night × total nights
                            const roomTotal = (parseFloat(room.price_per_night) || 0) * nights;
                            recalculatedTotal += roomTotal;
                            roomBreakdown.push(`   Room ${roomIdx + 1} (Existing): ₹${room.price_per_night} × ${nights} nights = ₹${roomTotal.toFixed(2)}`);
                        } else if (!room.isExistingRoom) {
                            // NEW ROOM: use chargedAmount if available, else calculate
                            let roomTotal = 0;
                            if (room.chargedAmount !== undefined) {
                                roomTotal = room.chargedAmount;
                                recalculatedTotal += roomTotal;
                                roomBreakdown.push(`   Room ${roomIdx + 1} (New): ₹${room.price_per_night} × ${room.daysRemaining || daysRemaining} days = ₹${roomTotal.toFixed(2)}`);
                            } else {
                                roomTotal = (parseFloat(room.price_per_night) || 0) * (room.daysRemaining || daysRemaining);
                                recalculatedTotal += roomTotal;
                                roomBreakdown.push(`   Room ${roomIdx + 1} (New): ₹${room.price_per_night} × ${room.daysRemaining || daysRemaining} days = ₹${roomTotal.toFixed(2)}`);
                            }
                        }
                    }
                });
                
                console.log(`💵 NEW TOTAL AMOUNT CALCULATED:`);
                roomBreakdown.forEach(line => console.log(line));
                console.log(`💵 ═══════════════════════════════════════`);
                console.log(`💵 FINAL TOTAL: ₹${recalculatedTotal.toFixed(2)}`);
                console.log(`💵 ═══════════════════════════════════════`);
                
                setFormData(prev => ({
                    ...prev,
                    roomSelections: updatedSelections,
                    totalAmount: recalculatedTotal  // 🎯 Set exact total (not add)
                }));
                
                // 🎨 Show toast notification with prorate info
                toast.success(
                    `✅ ${selectedRoom.room_type} (${selectedRoom.room_number}) selected\n\n` +
                    `📅 Days remaining in booking: ${daysRemaining}\n` +
                    `💰 Price: ₹${selectedRoom.price_per_night}/night\n\n` +
                    `📊 Calculation:\n` +
                    `₹${selectedRoom.price_per_night} × ${daysRemaining} days = ₹${chargeAmount.toFixed(2)}\n\n` +
                    `💵 Total amount: ₹${recalculatedTotal.toFixed(2)}`,
                    { autoClose: 4000 }
                );
            
                // ✅ UPDATED: Total amount recalculated from scratch when room selected
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
            
            // ✅ CHANGE 6: REMOVED calculateTotalAmount() call
            // Total is only recalculated on date changes
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
        // ✅ FIXED: Use room.roomId instead of roomIndex as key
        const isManual = manualPricingMode[room.roomId];
        
        console.log('═══════════════════════════════════════════════════════════');
        console.log('⚙️ MANUAL PRICING MODE TOGGLE');
        console.log('═══════════════════════════════════════════════════════════');
        console.log(`🏨 Room ${roomIndex + 1}`);
        console.log(`📊 Switching from ${isManual ? 'MANUAL' : 'AUTO'} → ${isManual ? 'AUTO' : 'MANUAL'} mode`);
        
        // Toggle the manual pricing mode first
        const newManualMode = !isManual;
        setManualPricingMode(prev => ({
            ...prev,
            [room.roomId]: newManualMode  // ✅ FIXED: Use room.roomId instead of roomIndex
        }));
        
        if (!newManualMode) {
            // Switching back to AUTO mode - clear nightly prices
            setFormData(prev => {
                const updatedSelections = [...prev.roomSelections];
                updatedSelections[roomIndex] = {
                    ...updatedSelections[roomIndex],
                    nightlyPrices: []
                };
                return {
                    ...prev,
                    roomSelections: updatedSelections
                };
            });
            return;
        }
        
        // Switching to MANUAL mode
        const nights = Math.max(1, Math.ceil(
            (formData.checkOutDate - formData.checkInDate) / (1000 * 60 * 60 * 24)
        ));
        
        // For NEW rooms: Use only REMAINING days for input fields
        // For EXISTING rooms: Use total nights
        let daysForInputFields;
        let daysUsed = 0;
        
        if (room.isExistingRoom && !room.isRestoredRoom) {
            // EXISTING ROOM: Full nights
            daysForInputFields = nights;
            console.log('───────────────────────────────────────────────────────────');
            console.log(`📌 EXISTING ROOM - Full ${nights} night input fields`);
        } else {
            // NEW ROOM or RESTORED ROOM: Only remaining days
            daysUsed = calculateProrateFromCheckInToToday(formData.checkInDate);
            daysForInputFields = Math.max(0, nights - daysUsed);
            console.log('───────────────────────────────────────────────────────────');
            console.log(`📌 NEW ROOM - Only REMAINING days (${daysForInputFields})`);
            console.log(`   Total nights: ${nights}`);
            console.log(`   Days used (check-in to today): ${daysUsed}`);
            console.log(`   Days remaining: ${daysForInputFields}`);
        }
        
        // ✅ CRITICAL FIX: Load existing nightly rates if available for existing rooms
        let nightlyPrices;
        
        if (room.isExistingRoom && !room.isRestoredRoom && room.nightlyPrices && room.nightlyPrices.length > 0) {
            // ✅ EXISTING ROOM with nightly rates: Use stored rates
            nightlyPrices = room.nightlyPrices;
            console.log(`✅ Loaded existing nightly rates from booking: [${nightlyPrices.map(p => parseFloat(p || 0).toFixed(2)).join(', ')}]`);
        } else {
            // NEW/RESTORED ROOM or no existing rates: Create new array
            nightlyPrices = Array(daysForInputFields).fill(parseFloat(room.price_per_night) || 0);
            console.log(`✅ Created new nightly rate fields`);
        }
        
        console.log(`🌙 ${nightlyPrices.length} nightly rate input fields`);
        console.log(`💰 Rates: [${nightlyPrices.map(p => parseFloat(p || 0).toFixed(2)).join(', ')}]`);
        const totalNightlyAmount = nightlyPrices.reduce((sum, p) => sum + parseFloat(p || 0), 0);
        console.log(`💰 Total amount: ₹${totalNightlyAmount.toFixed(2)}`);
        console.log('───────────────────────────────────────────────────────────');
        
        setFormData(prev => {
            const updatedSelections = [...prev.roomSelections];
            updatedSelections[roomIndex] = {
                ...updatedSelections[roomIndex],
                nightlyPrices: nightlyPrices,
                daysRemaining: daysForInputFields  // Store remaining days
            };
            
            // Recalculate total amount
            let newTotalAmount = 0;
            const totalNights = Math.max(1, Math.ceil(
                (prev.checkOutDate - prev.checkInDate) / (1000 * 60 * 60 * 24)
            ));
            const totalDaysUsed = calculateProrateFromCheckInToToday(prev.checkInDate);
            const totalRemainingDays = Math.max(0, totalNights - totalDaysUsed);
            
            updatedSelections.forEach((r, idx) => {
                if (r.isExistingRoom && !r.isRestoredRoom) {
                    // EXISTING ROOM
                    // ✅ FIXED: Use r.roomId instead of idx as key
                    if (manualPricingMode[r.roomId] && r.nightlyPrices && r.nightlyPrices.length > 0) {
                        const roomTotal = r.nightlyPrices.reduce((sum, price) => sum + (parseFloat(price) || 0), 0);
                        newTotalAmount += roomTotal;
                    } else if (r.price_per_night) {
                        newTotalAmount += (parseFloat(r.price_per_night) || 0) * totalNights;
                    }
                } else {
                    // NEW ROOM or RESTORED ROOM
                    // ✅ FIXED: Use r.roomId instead of idx as key
                    if (idx === roomIndex || (manualPricingMode[r.roomId] && r.nightlyPrices && r.nightlyPrices.length > 0)) {
                        // This room is in manual mode
                        const roomTotal = r.nightlyPrices.reduce((sum, price) => sum + (parseFloat(price) || 0), 0);
                        newTotalAmount += roomTotal;
                    } else if (r.price_per_night) {
                        // Auto mode - use remaining days
                        const daysForThisRoom = r.daysRemaining !== undefined ? r.daysRemaining : totalRemainingDays;
                        newTotalAmount += (parseFloat(r.price_per_night) || 0) * daysForThisRoom;
                    }
                }
            });
            
            console.log(`📊 NEW TOTAL AMOUNT: ₹${newTotalAmount.toFixed(2)}`);
            console.log('═══════════════════════════════════════════════════════════\n');
            
            return {
                ...prev,
                roomSelections: updatedSelections,
                totalAmount: newTotalAmount
            };
        });
    };

    const handleNightlyPriceChange = (roomIndex, nightIndex, value) => {
        setFormData(prev => {
            const updatedSelections = [...prev.roomSelections];
            const nightlyPrices = [...(updatedSelections[roomIndex].nightlyPrices || [])];
            const oldPrice = nightlyPrices[nightIndex];
            nightlyPrices[nightIndex] = parseFloat(value) || 0;
            
            updatedSelections[roomIndex] = {
                ...updatedSelections[roomIndex],
                nightlyPrices: nightlyPrices
            };
            
            // 🔴 CONSOLE LOGGING: Manual Pricing Changed
            const nights = Math.max(1, Math.ceil(
                (prev.checkOutDate - prev.checkInDate) / (1000 * 60 * 60 * 24)
            ));
            
            const room = updatedSelections[roomIndex];
            const isNewRoom = !room.isExistingRoom;
            const daysRemaining = isNewRoom ? Math.max(0, nights - calculateProrateFromCheckInToToday(prev.checkInDate)) : nights;
            
            console.log('═══════════════════════════════════════════════════════════');
            console.log('💰 MANUAL PRICE CHANGED - NIGHTLY PRICING');
            console.log('═══════════════════════════════════════════════════════════');
            console.log(`🏨 Room ${roomIndex + 1}: Night ${nightIndex + 1} / ${nightlyPrices.length}`);
            
            if (isNewRoom) {
                console.log(`📌 NEW ROOM - Input fields for ${daysRemaining} remaining days`);
            } else {
                console.log(`📌 EXISTING ROOM`);
            }
            
            console.log('───────────────────────────────────────────────────────────');
            console.log(`💵 Old price: ₹${parseFloat(oldPrice || 0).toFixed(2)}`);
            console.log(`💵 New price: ₹${parseFloat(value || 0).toFixed(2)}`);
            console.log(`📊 All nightly rates: [${nightlyPrices.map(p => parseFloat(p || 0).toFixed(2)).join(', ')}]`);
            const totalNightly = nightlyPrices.reduce((sum, p) => sum + parseFloat(p || 0), 0);
            console.log(`💰 Room total: ₹${totalNightly.toFixed(2)}`);
            console.log('───────────────────────────────────────────────────────────');
            
            // CASE 1 FIX: Include EXISTING room manual pricing in total
            // Calculate total for ALL rooms (including existing ones with manual pricing)
            let newTotalAmount = 0;
            updatedSelections.forEach((r, idx) => {
                if (r.isExistingRoom && !r.isRestoredRoom) {
                    // EXISTING ROOM - Check if in manual mode
                    // ✅ FIXED: Use r.roomId instead of idx as key
                    if (manualPricingMode[r.roomId] && r.nightlyPrices && r.nightlyPrices.length > 0) {
                        // User entered manual prices - USE THEM
                        const roomTotal = r.nightlyPrices.reduce((sum, price) => sum + (parseFloat(price) || 0), 0);
                        newTotalAmount += roomTotal;
                    } else if (r.price_per_night) {
                        // Use original per-night rate
                        newTotalAmount += parseFloat(r.price_per_night) * nights;
                    }
                } else {
                    // NEW ROOM or RESTORED ROOM
                    // ✅ FIXED: Use r.roomId instead of idx as key
                    if (manualPricingMode[r.roomId] && r.nightlyPrices && r.nightlyPrices.length > 0) {
                        // Sum all nightly prices for manual mode
                        const roomTotal = r.nightlyPrices.reduce((sum, price) => sum + (parseFloat(price) || 0), 0);
                        newTotalAmount += roomTotal;
                    } else if (r.price_per_night) {
                        // Use price_per_night * remaining days for new rooms
                        const daysToCharge = r.daysRemaining || daysRemaining;
                        newTotalAmount += parseFloat(r.price_per_night) * daysToCharge;
                    }
                }
            });
            
            console.log(`📊 PRICE BREAKDOWN (CASE 1 - EXISTING ROOM MANUAL):`);
            updatedSelections.forEach((r, idx) => {
                if (r.isExistingRoom && !r.isRestoredRoom) {
                    // ✅ FIXED: Use r.roomId instead of idx as key
                    if (manualPricingMode[r.roomId] && r.nightlyPrices) {
                        const roomTotal = r.nightlyPrices.reduce((sum, price) => sum + (parseFloat(price) || 0), 0);
                        console.log(`   + Room ${idx + 1} (EXISTING - Manual): ₹${roomTotal.toFixed(2)}`);
                    } else if (r.price_per_night) {
                        const roomTotal = parseFloat(r.price_per_night) * nights;
                        console.log(`   + Room ${idx + 1} (EXISTING - Auto): ₹${roomTotal.toFixed(2)}`);
                    }
                } else {
                    // ✅ FIXED: Use r.roomId instead of idx as key
                    if (manualPricingMode[r.roomId] && r.nightlyPrices) {
                        const roomTotal = r.nightlyPrices.reduce((sum, price) => sum + (parseFloat(price) || 0), 0);
                        console.log(`   + Room ${idx + 1} (NEW - Manual): ₹${roomTotal.toFixed(2)}`);
                    } else if (r.price_per_night) {
                        const daysToCharge = r.daysRemaining || daysRemaining;
                        const roomTotal = parseFloat(r.price_per_night) * daysToCharge;
                        console.log(`   + Room ${idx + 1} (NEW - Auto, ${daysToCharge} days): ₹${roomTotal.toFixed(2)}`);
                    }
                }
            });
            console.log(`   ════════════════════════════════════════`);
            console.log(`📊 NEW TOTAL AMOUNT: ₹${newTotalAmount.toFixed(2)}`);
            console.log('═══════════════════════════════════════════════════════════\n');
            
            return {
                ...prev,
                roomSelections: updatedSelections,
                totalAmount: newTotalAmount
            };
        });
    };

    const addRoom = async () => {
        // Calculate days remaining BEFORE adding room
        const daysUsed = calculateProrateFromCheckInToToday(formData.checkInDate);
        const daysRemaining = Math.max(0, numberOfNights - daysUsed);
        
        const newRoom = {
            roomType: '',
            roomId: '',
            roomNumber: '',
            price_per_night: 0,
            isExistingRoom: false,
            daysRemaining: daysRemaining,  // Store remaining days at time of addition
            nightlyPrices: [],  // Initialize empty array for nightly prices
            nights: numberOfNights  // Store total nights for reference
        };
        
        const newIndex = formData.roomSelections.length;
        
        setFormData(prev => ({
            ...prev,
            roomSelections: [...prev.roomSelections, newRoom],
            numberOfRooms: prev.roomSelections.length + 1
        }));
        
        // 🔴 CONSOLE LOGGING: Add Room Button Clicked
        
        console.log('═══════════════════════════════════════════════════════════');
        console.log('➕ NEW ROOM ADDED TO BOOKING');
        console.log('═══════════════════════════════════════════════════════════');
        console.log(`📌 New room added at index: ${newIndex + 1}`);
        console.log(`📊 Total rooms now: ${formData.roomSelections.length + 1}`);
        console.log('───────────────────────────────────────────────────────────');
        console.log('📅 PRORATE CALCULATION FOR NEW ROOM:');
        console.log(`📅 Check-in Date: ${format(formData.checkInDate, 'dd-MMM-yyyy')}`);
        console.log(`📅 Today's Date: ${format(new Date(), 'dd-MMM-yyyy')}`);
        console.log(`📅 Check-out Date: ${format(formData.checkOutDate, 'dd-MMM-yyyy')}`);
        console.log(`🌙 Total nights in booking: ${numberOfNights}`);
        console.log(`📌 Days already USED: ${daysUsed} days`);
        console.log(`⏳ Days REMAINING: ${daysRemaining} days`);
        console.log('───────────────────────────────────────────────────────────');
        console.log('💡 PRICING LOGIC:');
        console.log(`💰 New room will be charged for ${daysRemaining} remaining days ONLY`);
        console.log(`💰 Formula: Room price per night × ${daysRemaining} days = Total charge`);
        console.log('───────────────────────────────────────────────────────────');
        console.log('📋 Waiting for room selection and price confirmation...');
        console.log('═══════════════════════════════════════════════════════════\n');
        
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
        let priceToAddForNewRoom = 0;
        let prorateDetails = {};
        
        if (roomToRemove.isExistingRoom) {
            // PRORATE LOGIC: 
            // 1. DEDUCT: Days already used (check-in to today)
            // 2. ADD (for new room): Days remaining (today to check-out)
            const daysUsed = calculateProrateFromCheckInToToday(formData.checkInDate);
            const daysRemaining = Math.max(0, nights - daysUsed);
            
            console.log('───────────────────────────────────────────────────────────');
            console.log('🗑️ EXISTING ROOM REMOVAL - PRORATE CALCULATION');
            console.log('───────────────────────────────────────────────────────────');
            console.log(`🏨 Room: ${roomToRemove.roomType} (${roomToRemove.roomNumber})`);
            console.log(`📅 Check-in: ${format(formData.checkInDate, 'dd-MMM-yyyy')}`);
            console.log(`📅 Check-out: ${format(formData.checkOutDate, 'dd-MMM-yyyy')}`);
            console.log(`🌙 Total booking nights: ${nights}`);
            console.log(`💵 Original room price: ₹${roomToRemove.originalPrice || calculateExistingRoomOriginalPrice(roomToRemove, nights)}`);
            console.log('───────────────────────────────────────────────────────────');
            console.log(`📌 Days USED (Check-in to today): ${daysUsed} din`);
            console.log(`⏳ Days REMAINING (Today to Check-out): ${daysRemaining} din`);
            
            prorateDetails = {
                daysUsed,
                daysRemaining,
                totalNights: nights
            };
            
            // For existing room: calculate based on nightly rates or price_per_night
            // DEDUCT: Price for REMAINING days (not used days)
            // Customer pays only for days used, not for remaining days
            if (roomToRemove.uses_nightly_rates && roomToRemove.nightlyPrices && roomToRemove.nightlyPrices.length > 0) {
                // For prorate: deduct price for REMAINING nights only
                const remainingNightlyRates = roomToRemove.nightlyPrices.slice(daysUsed);
                priceToRemove = remainingNightlyRates.reduce((sum, price) => sum + (parseFloat(price) || 0), 0);
                console.log('───────────────────────────────────────────────────────────');
                console.log(`💰 Uses nightly rates: [${roomToRemove.nightlyPrices.map(p => parseFloat(p || 0).toFixed(2)).join(', ')}]`);
                console.log(`💰 REMAINING days rates (${daysUsed + 1}-${nights}): [${remainingNightlyRates.map(p => parseFloat(p || 0).toFixed(2)).join(', ')}]`);
                console.log(`💰 PRICE TO DEDUCT (for ${daysRemaining} remaining days): ₹${priceToRemove.toFixed(2)}`);
            } else {
                // price_per_night * remaining days
                priceToRemove = (parseFloat(roomToRemove.price_per_night) || 0) * daysRemaining;
                console.log('───────────────────────────────────────────────────────────');
                console.log(`💰 Price per night: ₹${roomToRemove.price_per_night}`);
                console.log(`💰 Formula: ₹${roomToRemove.price_per_night} × ${daysRemaining} remaining days = ₹${priceToRemove.toFixed(2)}`);
            }
            console.log('═══════════════════════════════════════════════════════════');
            console.log('📝 CHARGING LOGIC:');
            console.log(`✅ Customer PAYS for: ${daysUsed} day(s) USED`);
            console.log(`❌ Customer DOESN'T PAY for: ${daysRemaining} day(s) REMAINING`);
            console.log('═══════════════════════════════════════════════════════════');
            
            // Store removed existing room for restore functionality with all data
            setRemovedRooms(prev => [...prev, {
                ...roomToRemove, // Store complete room data including nightlyPrices
                originalData: roomToRemove.originalData,
                roomNumber: roomToRemove.roomNumber,
                roomType: roomToRemove.roomType,
                previousIndex: index,
                priceToRestore: priceToRemove, // Store price for restore
                uses_nightly_rates: roomToRemove.uses_nightly_rates,
                nightlyPrices: roomToRemove.nightlyPrices || [],
                prorateDetails: prorateDetails
            }]);
        }

        setFormData(prev => {
            const updatedRoomSelections = prev.roomSelections.filter((_, i) => i !== index);
            
            let newTotalAmount;
            
            if (roomToRemove.isExistingRoom) {
                // For existing room: DEDUCT only the price for days USED
                // Total = Original - (days_used × rate_per_day)
                // Customer pays ONLY for days they actually stayed
                newTotalAmount = prev.totalAmount - priceToRemove;  // DEDUCT price for days used
                
                // 🎨 Get prorate details (must be declared BEFORE use)
                const daysUsed = prorateDetails.daysUsed;
                const daysRemaining = prorateDetails.daysRemaining;
                
                console.log('═══════════════════════════════════════════════════════════');
                console.log('🗑️ ROOM REMOVED - TOTAL AMOUNT UPDATE');
                console.log('═══════════════════════════════════════════════════════════');
                console.log(`🏨 Room: ${roomToRemove.roomType} (${roomToRemove.roomNumber})`);
                console.log(`📊 Total amount BEFORE removal: ₹${prev.totalAmount.toFixed(2)}`);
                console.log(`📌 Days USED (Check-in to Today): ${daysUsed} days → Customer PAYS`);
                console.log(`📌 Days REMAINING (Today to Check-out): ${daysRemaining} days → NOT charged`);
                console.log(`➖ Deducting REMAINING days price from total: ₹${priceToRemove.toFixed(2)}`);
                console.log(`📊 Total amount AFTER removal: ₹${newTotalAmount.toFixed(2)}`);
                console.log('═══════════════════════════════════════════════════════════\n');
                
                // Enhanced toast with better formatting
                const toastMessage = (
                    <div style={{ textAlign: 'left', lineHeight: '1.6' }}>
                        <div style={{ marginBottom: '10px', fontWeight: 'bold', fontSize: '16px' }}>
                            ✅ {roomToRemove.roomType} (Room #{roomToRemove.roomNumber}) Removed
                        </div>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '10px', marginBottom: '10px' }}>
                            <div>✅ <strong>Days Customer Will PAY For:</strong></div>
                            <div style={{ marginLeft: '20px', color: '#4ade80', fontFamily: 'monospace', fontWeight: 'bold' }}>
                                {daysUsed} day(s) used
                            </div>
                            <div style={{ marginLeft: '20px', color: '#fff', fontFamily: 'monospace', fontSize: '12px' }}>
                                From: {format(formData.checkInDate, 'dd MMM yyyy')} (Check-in)<br/>
                                Till: {format(new Date(), 'dd MMM yyyy')} (Today)
                            </div>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '10px', marginBottom: '10px' }}>
                            <div>❌ <strong>Days Customer Will NOT Pay For:</strong></div>
                            <div style={{ marginLeft: '20px', color: '#ff6b6b', fontFamily: 'monospace', fontWeight: 'bold' }}>
                                {daysRemaining} day(s) remaining (refunded/deducted)
                            </div>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '10px', marginBottom: '10px' }}>
                            <div>💰 <strong>Amount Deducted from Total:</strong></div>
                            <div style={{ marginLeft: '20px', color: '#ff6b6b', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '14px' }}>
                                ₹{priceToRemove.toFixed(2)}
                            </div>
                            <div style={{ marginLeft: '20px', color: '#fff', fontSize: '12px' }}>
                                (Price for {daysRemaining} remaining days)
                            </div>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '10px' }}>
                            <div>📊 <strong>Total Amount Update:</strong></div>
                            <div style={{ marginLeft: '20px', color: '#fff', fontFamily: 'monospace' }}>
                                Before: ₹{prev.totalAmount.toFixed(2)}<br/>
                                After: ₹{newTotalAmount.toFixed(2)}<br/>
                                <span style={{ color: '#ff6b6b' }}>Deducted: ₹{priceToRemove.toFixed(2)}</span>
                            </div>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '10px' }}>
                            <div>⏳ <strong>Days Remaining in Booking:</strong></div>
                            <div style={{ marginLeft: '20px', color: '#fff' }}>
                                {daysRemaining} day(s) left (if new room added, it will be charged for {daysRemaining} days only)
                            </div>
                        </div>
                    </div>
                );
                
                toast.info(toastMessage, { autoClose: 6000 });
            } else {
                // ✅ CHANGE 5 FIXED: For new room removal, simply subtract the new room's price
                // ❌ REMOVED: originalBookingTotal usage
                // NEW LOGIC: Total = prev.totalAmount - newRoomPrice
                const daysRemaining = Math.max(0, nights - calculateProrateFromCheckInToToday(formData.checkInDate));
                const newRoomPrice = roomToRemove.price_per_night ? 
                    (parseFloat(roomToRemove.price_per_night) || 0) * (roomToRemove.daysRemaining !== undefined ? roomToRemove.daysRemaining : daysRemaining)
                    : 0;
                
                newTotalAmount = prev.totalAmount - newRoomPrice;
                
                // Show toast for new room removal
                toast.info(
                    `✅ New room removed\n` +
                    `📊 Amount deducted: ₹${newRoomPrice.toFixed(2)}\n` +
                    `💰 New total: ₹${newTotalAmount.toFixed(2)}`,
                    { autoClose: 3000 }
                );
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
        // ✅ Better error message - explain what's needed
        const incompleteNewRooms = formData.roomSelections.filter(room => !room.isExistingRoom).length;
        const existingRooms = formData.roomSelections.filter(room => room.isExistingRoom).length;
        
        let errorMsg = '';
        if (existingRooms > 0 && incompleteNewRooms > 0) {
            // Edit case: existing rooms + incomplete new rooms
            errorMsg = `Please complete all new room details:\n- Select room type\n- Select room number\n- Enter price per night`;
        } else {
            // No rooms or only incomplete new rooms
            errorMsg = 'Please select at least one complete room';
        }
        
        setError(errorMsg);
        toast.error(errorMsg);
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

        // 🔍 CONSOLE LOGGING: Save Booking - Show Scenario
        console.log('╔═══════════════════════════════════════════════════════════╗');
        console.log('║       📝 SAVE BOOKING - IDENTIFY SCENARIO                 ║');
        console.log('╚═══════════════════════════════════════════════════════════╝');
        
        const existingRoomsCount = formData.roomSelections.filter(r => r.isExistingRoom).length;
        const newRoomsCount = formData.roomSelections.filter(r => !r.isExistingRoom).length;
        const removedRoomsCount = removedRooms.length;
        
        console.log(`\n📊 Current State:`);
        console.log(`   Existing rooms: ${existingRoomsCount}`);
        console.log(`   New rooms: ${newRoomsCount}`);
        console.log(`   Removed rooms: ${removedRoomsCount}`);
        
        let scenario = '';
        if (existingRoomsCount > 0 && newRoomsCount === 0 && removedRoomsCount === 0) {
            scenario = 'CASE 1: Only date change (existing room price recalculates)';
        } else if (existingRoomsCount > 0 && newRoomsCount > 0 && removedRoomsCount === 0) {
            scenario = 'CASE 2: Existing + new room (new room gets remaining days only)';
        } else if (existingRoomsCount > 0 && newRoomsCount > 0 && removedRoomsCount > 0) {
            scenario = 'CASE 3: Existing room removed + new room added (prorate logic)';
        } else if (existingRoomsCount === 0 && newRoomsCount > 0) {
            scenario = 'Special: All new rooms (no existing)';
        }
        
        console.log(`\n🎯 SCENARIO: ${scenario}`);
        console.log('───────────────────────────────────────────────────────────');

        // ✅ FIX: Separate existing rooms from new rooms
        // Strategy depends on whether new rooms are being added:
        // - CASE 1 (only date/detail change): Send existing rooms in selected_rooms
        // - CASE 2 & 3 (new rooms added): Send ONLY new rooms in selected_rooms
        
        const newRooms = formData.roomSelections.filter(r => !r.isExistingRoom && (r.roomType && r.roomId && r.price_per_night));
        const existingRoomsData = formData.roomSelections.filter(room => room.isExistingRoom);

        let selected_rooms = [];
        
        if (newRooms.length === 0 && existingRoomsData.length > 0) {
            // 🎯 CASE 1: Only existing rooms (date change or other details change)
            // Send existing rooms to backend so they're not deleted
            selected_rooms = existingRoomsData.map(room => {
                // Check if using nightly rates: either original uses_nightly_rates OR manual pricing mode enabled
                const isUsingNightlyRates = manualPricingMode[room.roomId] || room.uses_nightly_rates;
                
                console.log(`📊 CASE 1 - Room ${room.roomNumber || room.room_number}:`);
                console.log(`   manualPricingMode[${room.roomId}]: ${manualPricingMode[room.roomId]}`);
                console.log(`   room.uses_nightly_rates: ${room.uses_nightly_rates}`);
                console.log(`   Final isUsingNightlyRates: ${isUsingNightlyRates}`);
                console.log(`   nightlyPrices: ${room.nightlyPrices && room.nightlyPrices.length > 0 ? `[${room.nightlyPrices.join(', ')}]` : 'null'}`)
                
                return {
                    room_id: parseInt(room.originalData?.room_id || room.roomId, 10),
                    room_type: room.roomType || room.room_type,
                    room_number: room.roomNumber || room.room_number,
                    price_per_night: parseFloat(room.price_per_night),  // ✅ Always send price
                    status: formData.bookingStatus === 'Checked-in' ? 'Occupied' :
                            formData.bookingStatus === 'Checked-out' ? 'Available' : 'Booked',
                    uses_nightly_rates: isUsingNightlyRates,
                    nightly_rates: isUsingNightlyRates && room.nightlyPrices && room.nightlyPrices.length > 0 ? 
                        room.nightlyPrices.map((rate, idx) => ({
                            night: idx + 1,
                            rate: parseFloat(rate) || 0,
                            room_id: parseInt(room.originalData?.room_id || room.roomId, 10) // Add room_id to track which rate belongs to which room
                        })) : null
                };
            });
        } else {
            // 🎯 CASE 2 & 3: New rooms being added
            // Send BOTH existing rooms (with their nightly_rates info) AND new rooms
            
            // 1️⃣ First collect EXISTING rooms with their nightly_rates info
            const existingRoomsForBackend = existingRoomsData.map(room => {
                const isUsingNightlyRates = manualPricingMode[room.roomId] || room.uses_nightly_rates;
                
                return {
                    room_id: parseInt(room.originalData?.room_id || room.roomId, 10),
                    room_type: room.roomType || room.room_type,
                    room_number: room.roomNumber || room.room_number,
                    price_per_night: parseFloat(room.price_per_night),  // ✅ Always send price
                    status: formData.bookingStatus === 'Checked-in' ? 'Occupied' :
                            formData.bookingStatus === 'Checked-out' ? 'Available' : 'Booked',
                    uses_nightly_rates: isUsingNightlyRates,
                    nightly_rates: isUsingNightlyRates && room.nightlyPrices && room.nightlyPrices.length > 0 ? 
                        room.nightlyPrices.map((rate, idx) => ({
                            night: idx + 1,
                            rate: parseFloat(rate) || 0,
                            room_id: parseInt(room.originalData?.room_id || room.roomId, 10) // Add room_id to track which rate belongs to which room
                        })) : null
                };
            });
            
            // 2️⃣ Then collect NEW rooms
            const newRoomsForBackend = newRooms
                .map((room, index) => {
                    const roomId = parseInt(room.roomId, 10);
                    const pricePerNight = parseFloat(room.price_per_night);

                    if (isNaN(roomId) || isNaN(pricePerNight)) {
                        return null;
                    }

                    // Check if this room uses manual nightly pricing
                    // ✅ FIXED: Use room.roomId instead of index as key
                    const usesNightlyRates = manualPricingMode[room.roomId] && room.nightlyPrices && room.nightlyPrices.length > 0;
                    const nightlyRates = usesNightlyRates ? room.nightlyPrices.map((rate, nightIndex) => ({
                        night: nightIndex + 1,
                        rate: parseFloat(rate) || 0,
                        room_id: roomId // Add room_id to track which rate belongs to which room
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
                })
                .filter(room => room !== null); // Remove any null entries
            
            // 3️⃣ Combine BOTH lists: existing rooms + new rooms
            selected_rooms = [...existingRoomsForBackend, ...newRoomsForBackend];
            
            console.log(`\n📤 SENDING TO BACKEND (CASE 2):`);
            console.log(`   Existing rooms with nightly_rates: ${existingRoomsForBackend.length}`);
            existingRoomsForBackend.forEach((room, idx) => {
                console.log(`      [${idx + 1}] Room ${room.room_id}: uses_nightly=${room.uses_nightly_rates}, rates=${room.nightly_rates ? 'yes' : 'no'}`);
            });
            console.log(`   New rooms: ${newRoomsForBackend.length}`);
            newRoomsForBackend.forEach((room, idx) => {
                console.log(`      [${idx + 1}] Room ${room.room_id}: uses_nightly=${room.uses_nightly_rates}, rates=${room.nightly_rates ? 'yes' : 'no'}`);
            });
        }

        // Also create a list of existing rooms that remain unchanged (for reference)
        // 🔴 IMPORTANT: Only send if CASE 1 (new rooms NOT being added)
        // For CASE 2 & 3, existing rooms are already in selected_rooms
        const existingRooms = (newRooms.length === 0) ? existingRoomsData
            .map(room => ({
                room_id: parseInt(room.originalData?.room_id || room.roomId, 10),
                status: formData.bookingStatus === 'Checked-in' ? 'Occupied' :
                        formData.bookingStatus === 'Checked-out' ? 'Available' : 'Booked'
            })) : [];

        // 🔍 CONSOLE LOGGING: Show room breakdown with nightly_rates info
        console.log('───────────────────────────────────────────────────────────');
        console.log('📊 ROOMS BREAKDOWN:');
        if (existingRoomsData.length > 0) {
            console.log(`\n✅ EXISTING ROOMS (${existingRoomsData.length}):`);
            existingRoomsData.forEach((room, idx) => {
                const isUsingNightly = manualPricingMode[room.roomId] || room.uses_nightly_rates;
                const rateInfo = isUsingNightly && room.nightlyPrices ? 
                    `${room.nightlyPrices.length} nightly rates` : 
                    `fixed ₹${room.price_per_night}`;
                console.log(`   [${idx + 1}] ${room.roomType} (${room.roomNumber}) - ID: ${room.roomId} | ${rateInfo}`);
            });
        }
        if (newRooms.length > 0) {
            console.log(`\n✨ NEW ROOMS (${newRooms.length}):`);
            newRooms.forEach((room, idx) => {
                const isUsingNightly = manualPricingMode[room.roomId] && room.nightlyPrices && room.nightlyPrices.length > 0;
                const rateInfo = isUsingNightly ? 
                    `${room.nightlyPrices.length} nightly rates` : 
                    `fixed ₹${room.price_per_night}`;
                console.log(`   [${idx + 1}] ${room.roomType} (${room.roomNumber}) - ID: ${room.roomId} | ${rateInfo}`);
            });
        }
        if (removedRooms.length > 0) {
            console.log(`\n🗑️  REMOVED ROOMS (${removedRooms.length}):`);
            removedRooms.forEach((room, idx) => {
                console.log(`   [${idx + 1}] ${room.roomType} (${room.roomNumber}) - will be soft deleted`);
            });
        }
        console.log('───────────────────────────────────────────────────────────');

        // Validate payment status for checkout
        if (formData.bookingStatus === 'Checked-out' && formData.paymentStatus.toUpperCase() !== 'PAID') {
            setError('Cannot checkout: Payment must be completed first');
            toast.error('Cannot checkout: Payment must be completed first');
            setLoading(false);
            return;
        }

        // 🔍 DETAILED CONSOLE LOG: Show exactly what's being sent to backend
        console.log('\n════════════════════════════════════════════════════════════');
        console.log('📤 SENDING TO BACKEND - selected_rooms:');
        console.log('════════════════════════════════════════════════════════════');
        selected_rooms.forEach((room, idx) => {
            console.log(`\n[${idx + 1}] Room ${room.room_id}:`);
            console.log(`   room_type: ${room.room_type}`);
            console.log(`   room_number: ${room.room_number}`);
            console.log(`   price_per_night: ${room.price_per_night || 'null (using nightly rates)'}`);
            console.log(`   uses_nightly_rates: ${room.uses_nightly_rates}`);
            if (room.nightly_rates) {
                console.log(`   nightly_rates: ${room.nightly_rates.length} rates = [${room.nightly_rates.map(r => r.rate).join(', ')}]`);
            } else {
                console.log(`   nightly_rates: null`);
            }
            console.log(`   status: ${room.status}`);
        });
        console.log('\n════════════════════════════════════════════════════════════\n');

        // Calculate number of nights
        const numberOfNights = calculateNights(formData.checkInDate, formData.checkOutDate);

        // Prepare combined nightly rates for booking table (ONLY new rooms with manual pricing)
        const hasNightlyRates = selected_rooms.some(room => room.uses_nightly_rates);
        const combinedNightlyRates = hasNightlyRates ? selected_rooms.flatMap(room => {
            // Only include rooms that are using manual nightly pricing
            if (room.uses_nightly_rates && room.nightly_rates && room.nightly_rates.length > 0) {
                return room.nightly_rates.map(nr => ({
                    night: nr.night,
                    rate: nr.rate,
                    room_id: nr.room_id || room.room_id // Use room_id from nightly_rates if available, otherwise from room
                }));
            }
            return []; // Skip rooms without manual pricing
        }) : null;

        // Prepare booking data
        // ✅ CASE 1: number_of_rooms = selected_rooms (which has existing rooms)
        // ✅ CASE 2 & 3: number_of_rooms = selected_rooms (new) + existingRooms.length
        const totalRoomsCount = newRooms.length === 0 ? selected_rooms.length : (selected_rooms.length + existingRooms.length);
        const bookingData = {
            number_of_nights: numberOfNights, // Add number of nights to booking data
            checkin_date: format(formData.checkInDate, 'yyyy-MM-dd'),
            checkout_date: format(formData.checkOutDate, 'yyyy-MM-dd'),
            checkin_time: formData.bookingStatus === 'Checked-in' ? currentTime : null,
            checkout_time: formData.bookingStatus  === 'Checked-out' ? currentTime : null,
            number_of_rooms: totalRoomsCount, // ✅ FIXED: Count correctly for each case
            number_of_guests: 1 + additionalGuests.length,
            total_amount: parseFloat(formData.totalAmount),
            payment_status: formData.paymentStatus.toUpperCase(),
            booking_status: formData.bookingStatus,
            selected_rooms: selected_rooms, // ✅ CASE 1: existing rooms | CASE 2&3: new rooms only
            existing_rooms: existingRooms, // ✅ CASE 1: empty | CASE 2&3: existing rooms (for reference)
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

        // Prepare removed rooms data for backend
        // Backend will UPDATE with tracking (soft delete with historical data)
        // price_charged = price for REMAINING days (what we deducted from total)
        const removed_rooms = removedRooms.map(room => ({
            room_id: parseInt(room.room_id || room.roomId, 10),
            room_number: room.roomNumber || room.room_number,
            days_used: room.prorateDetails?.daysUsed || 0,
            // price_charged = price for REMAINING days (what customer doesn't pay)
            price_charged: room.prorateDetails ? 
                (room.uses_nightly_rates && room.nightlyPrices && room.nightlyPrices.length > 0) ?
                    // For nightly rates: sum of remaining days rates
                    room.nightlyPrices.slice(room.prorateDetails.daysUsed).reduce((sum, price) => sum + (parseFloat(price) || 0), 0) :
                    // For fixed rate: rate × remaining days
                    (parseFloat(room.price_per_night) || 0) * room.prorateDetails.daysRemaining
                : 0,
            is_same_day_removal: (room.prorateDetails?.daysUsed || 0) === 0
        }));

        // Console log removed rooms for debugging
        if (removed_rooms.length > 0) {
            console.log('════════════════════════════════════════════════════════════');
            console.log('🗑️  SOFT DELETE: ROOMS TO MARK AS REMOVED');
            console.log('════════════════════════════════════════════════════════════');
            console.log('📌 Backend Action: Set is_removed = true in booking_rooms table');
            console.log('📌 Store: days_used and price_charged in booking_rooms table');
            console.log('════════════════════════════════════════════════════════════');
            removed_rooms.forEach((room, idx) => {
                console.log(`\n[${idx + 1}] Room ID: ${room.room_id} (${room.room_number})`);
                console.log(`   📌 is_removed: true (soft delete)`);
                console.log(`   ⏱️  days_used: ${room.days_used} din`);
                console.log(`   💰 price_charged: ₹${room.price_charged.toFixed(2)}`);
                console.log(`   ⚡ same_day_removal: ${room.is_same_day_removal ? 'Yes' : 'No'}`);
                if (room.is_same_day_removal) {
                    console.log(`      → Room removed on same day it was added (No charge)`);
                } else {
                    console.log(`      → Customer pays for ${room.days_used} days used`);
                    console.log(`      → Refunded for remaining days: ₹${room.price_charged.toFixed(2)}`);
                }
            });
            console.log('════════════════════════════════════════════════════════════\n');
        }

        // 🔍 FINAL SUMMARY BEFORE SENDING TO BACKEND
        console.log('╔═══════════════════════════════════════════════════════════╗');
        console.log('║         📤 SENDING TO BACKEND - FINAL SUMMARY             ║');
        console.log('╚═══════════════════════════════════════════════════════════╝');
        console.log(`\n💰 TOTAL AMOUNT: ₹${parseFloat(formData.totalAmount).toFixed(2)}`);
        console.log(`📌 Total Rooms: ${totalRoomsCount}`);
        console.log(`🗑️  Removed Rooms: ${removed_rooms.length}`);
        console.log('───────────────────────────────────────────────────────────');
        
        if (newRooms.length === 0 && existingRoomsData.length > 0) {
            // CASE 1
            console.log(`\n🎯 CASE 1: ONLY EXISTING ROOMS (Date/Detail Change)`);
            console.log(`   selected_rooms will have: ${selected_rooms.length} existing rooms`);
            console.log(`   existing_rooms will have: 0 (empty)`);
            console.log(`   → Existing rooms sent ONLY in selected_rooms`);
        } else if (newRooms.length > 0 && removedRooms.length === 0) {
            // CASE 2
            console.log(`\n🎯 CASE 2: EXISTING + NEW ROOMS`);
            console.log(`   selected_rooms will have: ${selected_rooms.length} new rooms`);
            console.log(`   existing_rooms will have: ${existingRooms.length} existing rooms`);
            console.log(`   → Existing rooms stay as-is, new rooms added`);
        } else if (newRooms.length > 0 && removedRooms.length > 0) {
            // CASE 3
            console.log(`\n🎯 CASE 3: EXISTING REMOVED + NEW ADDED`);
            console.log(`   selected_rooms will have: ${selected_rooms.length} new rooms`);
            console.log(`   existing_rooms will have: ${existingRooms.length} existing rooms`);
            console.log(`   removed_rooms will have: ${removed_rooms.length} rooms to soft-delete`);
            console.log(`   → Existing removed (soft), new added`);
        }
        
        console.log('───────────────────────────────────────────────────────────');
        console.log(`✅ selected_rooms: ${selected_rooms.length}`);
        if (selected_rooms.length > 0) {
            selected_rooms.forEach((room, idx) => {
                console.log(`   [${idx + 1}] Room ID ${room.room_id}: ₹${room.price_per_night}/night`);
            });
        }
        console.log(`✅ existing_rooms: ${existingRooms.length}`);
        if (existingRooms.length > 0) {
            existingRooms.forEach((room, idx) => {
                console.log(`   [${idx + 1}] Room ID ${room.room_id} - will remain as is`);
            });
        }
        console.log(`🗑️  removed_rooms: ${removed_rooms.length}`);
        if (removed_rooms.length > 0) {
            removed_rooms.forEach((room, idx) => {
                console.log(`   [${idx + 1}] Room ID ${room.room_id}: is_removed=true, days_used=${room.days_used}, price_charged=₹${room.price_charged.toFixed(2)}`);
            });
        }

        // ✅ PAYMENT STATUS LOG
        console.log('═══════════════════════════════════════════════════════════');
        console.log('💳 PAYMENT STATUS - BEFORE SENDING TO BACKEND');
        console.log('═══════════════════════════════════════════════════════════');
        console.log(`📌 Payment Status: ${bookingData.payment_status}`);
        console.log(`📌 Total Amount: ₹${bookingData.total_amount}`);
        console.log(`📌 Booking Status: ${bookingData.booking_status}`);
        console.log('═══════════════════════════════════════════════════════════\n');

        // Send update request with consistent field names and data types
        const response = await axios.put(
            `${BASE_URL}/api/bookings/${bookingId}`,
            {
                ...bookingData,               // Contains selected_rooms and properly cased statuses
              // Contains address and other customer details
                primary_guest,                // Contains properly named id_proof fields
                additional_guests,            // Contains properly named id_proof fields
                removed_rooms                 // Contains removed room tracking data
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        if (response.data.success) {
            // ✅ SUCCESS LOG
            console.log('═══════════════════════════════════════════════════════════');
            console.log('✅ BOOKING UPDATED SUCCESSFULLY - BACKEND RESPONSE');
            console.log('═══════════════════════════════════════════════════════════');
            console.log(`✅ Booking ID: ${bookingId}`);
            console.log(`✅ Payment Status Updated: ${bookingData.payment_status}`);
            console.log(`✅ Total Amount: ₹${bookingData.total_amount}`);
            console.log(`✅ Message: ${response.data.message}`);
            console.log('═══════════════════════════════════════════════════════════\n');
            
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
                                <span className="room-amount">Total Amount: ₹{formData.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Removed Rooms Display Section */}
                        {removedRooms && removedRooms.length > 0 && (
                            <div className="removed-rooms-section" style={{ 
                                marginTop: '20px', 
                                padding: '15px', 
                                backgroundColor: '#fff3cd',
                                border: '1px solid #ffc107',
                                borderRadius: '8px'
                            }}>
                                <h4 style={{ marginTop: 0, color: '#856404', marginBottom: '15px' }}>
                                    🗑️ Removed Rooms ({removedRooms.length})
                                </h4>
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    {removedRooms.map((room, idx) => (
                                        <div key={idx} style={{
                                            padding: '12px',
                                            backgroundColor: '#fff',
                                            border: '1px solid #ffc107',
                                            borderRadius: '6px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 'bold', marginBottom: '6px', color: '#333' }}>
                                                    {room.roomType?.replace(/_/g, ' ')} - Room #{room.roomNumber}
                                                </div>
                                                <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
                                                    📅 Used Days: {room.prorateDetails?.daysUsed || 0} day(s)
                                                </div>
                                                <div style={{ fontSize: '13px', color: '#666' }}>
                                                    💰 Price Charged: ₹{(
                                                        room.prorateDetails ? 
                                                        (room.uses_nightly_rates && room.nightlyPrices && room.nightlyPrices.length > 0) ?
                                                            room.nightlyPrices.slice(0, room.prorateDetails.daysUsed).reduce((sum, price) => sum + (parseFloat(price) || 0), 0) :
                                                            (parseFloat(room.price_per_night) || 0) * room.prorateDetails.daysUsed
                                                        : 0
                                                    ).toFixed(2)}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => restoreRoom(room)}
                                                title={room.prorateDetails ? `Restore: This room was used for ${room.prorateDetails.daysUsed} day(s)` : 'Restore this room'}
                                            >
                                                <RiRestartLine /> Restore
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div style={{
                                    marginTop: '12px',
                                    padding: '12px',
                                    backgroundColor: '#e7f3ff',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    color: '#0056b3'
                                }}>
                                    ℹ️ <strong>Note:</strong> Removed rooms are already included in the total amount above (charged for days used).
                                </div>
                            </div>
                        )}

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
                                                        // Calculate remaining days for this new room
                                                        const daysRemaining = Math.max(0, numberOfNights - calculateProrateFromCheckInToToday(formData.checkInDate));
                                                        
                                                        setFormData(prev => {
                                                            const updatedSelections = [...prev.roomSelections];
                                                            updatedSelections[index] = {
                                                                ...updatedSelections[index],
                                                                roomId: selectedRoom.room_id,
                                                                room_id: selectedRoom.room_id,
                                                                roomNumber: selectedRoom.room_number,
                                                                room_number: selectedRoom.room_number,
                                                                price_per_night: selectedRoom.price_per_night,
                                                                isExistingRoom: false,
                                                                daysRemaining: daysRemaining,  // Store remaining days
                                                                nights: numberOfNights  // Store total nights
                                                            };
                                                            return {
                                                                ...prev,
                                                                roomSelections: updatedSelections
                                                            };
                                                        });
                                                        // ✅ CHANGE 6: REMOVED calculateTotalAmount() call
                                                        // Total is only recalculated on date changes
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
                                        {/* ✅ FIXED: Use room.roomId instead of index as key */}
                                        {manualPricingMode[room.roomId] ? 'Use Previous Price' : 'Add Price Manually'}
                                    </button>
                                    
                                    {/* ✅ FIXED: Use room.roomId instead of index as key */}
                                    {manualPricingMode[room.roomId] && room.nightlyPrices && (
                                        <div className="room-nightly-prices">
                                            <h5>Nightly Prices 
                                                {room.isExistingRoom ? (
                                                    <span className="existing-room-label">(Existing Room - {room.nightlyPrices.length} nights)</span>
                                                ) : (
                                                    <span className="new-room-label">(New Room - {room.nightlyPrices.length} remaining days)</span>
                                                )}
                                            </h5>
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
                                                        title={room.isExistingRoom ? `Night ${nightIndex + 1} of ${room.nightlyPrices.length} - Existing Room` : `Night ${nightIndex + 1} of ${room.nightlyPrices.length} - Remaining days`}
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
