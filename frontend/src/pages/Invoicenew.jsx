import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import './Invoice.css';

const BASE_URL = import.meta.env.VITE_API_URL;

const Invoice = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingData, setBookingData] = useState(null);
  const [hotelInfo, setHotelInfo] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch complete booking details with hotel info
        const response = await axios.get(
          `${BASE_URL}/api/bookings/${bookingId}/invoice/details`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = response.data;
        if (!data) {
          throw new Error('No data received from server');
        }
        // Update based on the actual API response structure
        setBookingData({
          ...data.booking,
          customer: data.customer,
          guests: data.guests
        });
        setHotelInfo(data.hotel);
        setLoading(false);
      } catch (err) {
        // console.error('Error fetching invoice data:', err);
        let errorMessage = 'Failed to fetch invoice data';
        
        if (err.response?.status === 400 && err.response?.data?.error) {
          // Handle specific error messages from backend
          errorMessage = err.response.data.error;
        } else if (err.response?.status === 404) {
          errorMessage = 'Invoice not found';
        } else if (err.response?.status === 401) {
          errorMessage = 'Please login to view invoice';
          navigate('/login');
        }
        
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchData();
  }, [bookingId]);

  const handleDownload = async () => {
    setLoading(true);
    try {
      // console.log('Starting PDF download process...');
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token not found in localStorage');
        throw new Error('Please login again');
      }
      // console.log('Token found, proceeding with download...');

      // console.log('Making request to:', `${BASE_URL}/api/bookings/${bookingId}/invoice/download`);
      // Get PDF directly from backend
      const response = await axios({
        url: `${BASE_URL}/api/bookings/${bookingId}/invoice/download`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf'
        },
        responseType: 'arraybuffer', // Important: Use arraybuffer for binary data
        validateStatus: false // Allow us to handle all status codes
      });

      // console.log('Response received:', {
      //   status: response.status,
      //   contentType: response.headers['content-type'],
      //   dataSize: response.data?.size
      // });

      if (response.status !== 200) {
        throw new Error(`Server returned ${response.status}: ${response.data}`);
      }

      if (!response.data || response.data.size === 0) {
        throw new Error('Received empty PDF data from server');
      }

      // Verify content type
      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.includes('application/pdf')) {
        throw new Error('Server did not return a PDF file. Please try again or contact support.');
      }

      // Verify file size is reasonable
      if (response.data.size < 1000) { // Less than 1KB is probably an error
        throw new Error('Generated PDF appears to be invalid. Please try again.');
      }

      // Create blob and open in new window
      // console.log('Creating PDF blob from response data...');
      // Ensure we're creating the blob with the correct type and handling binary data
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'application/pdf'
      });
      // console.log('PDF Blob details:', {
      //   size: blob.size,
      //   type: blob.type,
      //   responseHeaders: response.headers,
      //   contentType: response.headers['content-type'],
      //   contentLength: response.headers['content-length']
      // });

      if (blob.size === 0) {
        // console.error('Received empty blob from server');
        throw new Error('Generated PDF is empty');
      }

      // Create object URL from blob
      const url = window.URL.createObjectURL(blob);
      // console.log('Created blob URL:', url);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${bookingId}.pdf`;
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      
      // Try to open in new tab as well
      try {
        window.open(url, '_blank');
      } catch (err) {
        // console.log('Could not open PDF in new tab:', err);
        // Already downloaded, so no fallback needed
      }

      // Cleanup URL after delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 2000);
    } catch (error) {
      // console.error('PDF Download Error:', {
      //   message: error.message,
      //   stack: error.stack,
      //   name: error.name
      // });
      
      let errorMessage = 'Failed to download invoice';
      
      if (error.response) {
        // console.error('Server Error Response:', {
        //   status: error.response.status,
        //   statusText: error.response.statusText,
        //   headers: error.response.headers,
        //   data: error.response.data,
        //   contentType: error.response.headers['content-type']
        // });
        
        if (error.response.status === 401) {
          // console.log('Authentication error detected');
          errorMessage = 'Please login again';
          navigate('/login');
        } else if (error.response.status === 404) {
          errorMessage = 'Invoice not found';
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.status === 500) {
          console.error('Server error details:', error.response.data);
          cosnole.log('Server error detected', error.response.data);
          errorMessage = 'Server error while generating invoice. Please try again.';
          // console.error('Server error details:', error.response.data);
        }
      } else if (error.request) {
        // console.error('Request Error:', {
        //   request: error.request,
        //   message: 'No response received from server'
        // });
        errorMessage = 'Failed to connect to server. Please check your internet connection.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!bookingData || !hotelInfo) return <div className="loading">No data available</div>;

  // Calculate GST
  const subtotal = bookingData.total_amount / 1.18; // Remove 18% GST
  const gstAmount = bookingData.total_amount - subtotal;
  const sgst = gstAmount / 2;
  const cgst = gstAmount / 2;

  return (
    <div className="invoice-container">
      <div className="invoice-actions">
        <button onClick={handleDownload} disabled={loading}>
          {loading ? 'Downloading...' : 'Download Invoice'}
        </button>
        <button onClick={() => navigate('/bookings')}>Back to Bookings</button>
      </div>

      <div id="invoice-printable" className="invoice">
        {/* Hotel Logo and Info */}
        <div className="invoice-header">
          {hotelInfo.hotel_logo_url && (
            <div className="hotel-logo">
              <img 
                src={`${BASE_URL}/hotel-assets/${hotelInfo.hotel_logo_url}`} 
                alt={hotelInfo.hotel_name} 
              />
            </div>
          )}
          <div className="hotel-info">
            <h1>{hotelInfo.hotel_name}</h1>
            <p>{hotelInfo.address_line1}</p>
            <p>{hotelInfo.city}, {hotelInfo.state} - {hotelInfo.pin_code}</p>
            {hotelInfo.gst_number && <p>GSTIN: {hotelInfo.gst_number}</p>}
          </div>
        </div>

        {/* Invoice Details */}
        <div className="invoice-details">
          <div className="invoice-number">
            <h2>Invoice</h2>
            <p>Invoice No: {bookingData.invoice_number || bookingData.booking_id}</p>
            <p>Date: {format(new Date(bookingData.created_at), 'dd/MM/yyyy')}</p>
          </div>

          {/* Guest Details */}
          <div className="guest-details">
            <h3>Bill To:</h3>
            <p>{bookingData.guest_name}</p>
            {bookingData.guest_gst && <p>GSTIN: {bookingData.guest_gst}</p>}
            {bookingData.guest_address && <p>{bookingData.guest_address}</p>}
            {bookingData.guest_contact && <p>{bookingData.guest_contact}</p>}
          </div>

          {/* Booking Details Table */}
          <table className="booking-details">
            <thead>
              <tr>
                <th>Description</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Nights</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Room Charges - {bookingData.room_type || 'Standard Room'}</td>
                <td>{format(new Date(bookingData.check_in_date), 'dd/MM/yyyy')}</td>
                <td>{format(new Date(bookingData.check_out_date), 'dd/MM/yyyy')}</td>
                <td>{bookingData.total_nights}</td>
                <td>₹ {subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan="4" className="text-right">Subtotal:</td>
                <td>₹ {subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan="4" className="text-right">SGST (9%):</td>
                <td>₹ {sgst.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan="4" className="text-right">CGST (9%):</td>
                <td>₹ {cgst.toFixed(2)}</td>
              </tr>
              <tr className="total-row">
                <td colSpan="4" className="text-right"><strong>Total Amount:</strong></td>
                <td><strong>₹ {bookingData.total_amount.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>

          {/* Terms and Signature */}
          <div className="terms-and-signature">
            <div className="terms">
              <h4>Terms & Conditions:</h4>
              <ol>
                <li>This is a computer-generated invoice and does not require a physical signature.</li>
                <li>Payment is due upon receipt of invoice.</li>
                <li>Please include invoice number in all correspondence.</li>
              </ol>
            </div>
            <div className="signature">
              <p>For {hotelInfo.hotel_name}</p>
              <div className="signature-line"></div>
              <p>Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;