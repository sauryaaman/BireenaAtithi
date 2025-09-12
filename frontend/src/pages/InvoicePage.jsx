import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  RiDownloadLine,
  RiPrinterLine,
  RiArrowLeftLine,
} from 'react-icons/ri';
import './InvoicePage.css';
const BASE_URL = import.meta.env.VITE_API_URL; 
const InvoicePage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${BASE_URL}/api/bookings/${bookingId}/bill`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setBooking(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${BASE_URL}/api/bookings/${bookingId}/invoice/download`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob'
        }
      );

      // Create blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      setError('Failed to download invoice');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) return <div className="loading">Loading invoice...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!booking) return <div className="error-message">Invoice not found</div>;

  return (
    <div className="invoice-page">
      <div className="page-header no-print">
        <button className="back-btn" onClick={() => navigate('/bookings')}>
          <RiArrowLeftLine /> Back to Bookings
        </button>
        <div className="actions">
          <button onClick={handleDownload} className="download-btn">
            <RiDownloadLine /> Download PDF
          </button>
          <button onClick={handlePrint} className="print-btn">
            <RiPrinterLine /> Print
          </button>
        </div>
      </div>

      <div className="invoice-container" id="invoice-content">
        <div className="invoice-header">
          <h1>INVOICE</h1>
          <div className="hotel-info">
            <h2>Hotel Nalanda City</h2>
            <p>Nalanda Nalanda More, Nalanda, Bihar, 803111</p>
            <p>+91 7903893936</p>
            <p>Citynalanda712@gmail.com</p>
          </div>
        </div>

        <div className="invoice-details">
          <div className="invoice-meta">
            <div>
              <strong>Invoice No:</strong> INV-{booking.booking_id}
            </div>
            <div>
              <strong>Date:</strong> {formatDate(booking.checkin_date)}
            </div>
            <div>
              <strong>Booking ID:</strong> {booking.booking_id}
            </div>
          </div>

          <div className="customer-info">
            <h3>Bill To:</h3>
            <p>{booking.customer.name}</p>
            <p>Phone: {booking.customer.phone}</p>
            <p>Email: {booking.customer.email}</p>
          </div>

          <table className="booking-details">
            <thead>
              <tr>
                <th>Description</th>
                <th>Rate/Night</th>
                <th>Nights</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {booking.booking_rooms.map((room) => (
                <tr key={room.room_id}>
                  <td>
                    <div className="room-info">
                      <div className="room-type">{room.rooms.room_type.replace(/_/g, ' ')}</div>
                      <div className="room-number">Room {room.rooms.room_number}</div>
                      <div className="stay-period">
                        {formatDate(booking.checkin_date)} to {formatDate(booking.checkout_date)}
                      </div>
                    </div>
                  </td>
                  <td className="amount">{formatCurrency(room.rooms.price_per_night)}</td>
                  <td className="nights">{booking.nights}</td>
                  <td className="amount">
                    {formatCurrency(room.rooms.price_per_night * booking.nights)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3">Subtotal</td>
                <td className="amount">{formatCurrency(booking.total_amount / 1.18)}</td>
              </tr>
              <tr>
                <td colSpan="3">GST (18%)</td>
                <td className="amount">
                  {formatCurrency(booking.total_amount - (booking.total_amount / 1.18))}
                </td>
              </tr>
              <tr className="total">
                <td colSpan="3">Total Amount</td>
                <td className="amount">{formatCurrency(booking.total_amount)}</td>
              </tr>
            </tfoot>
          </table>

          <div className="invoice-footer">
            <div className="status-info">
              <div className={`status status-${booking.payment_status.toLowerCase()}`}>
                {booking.payment_status}
              </div>
              <div className={`status status-${booking.status.toLowerCase()}`}>
                {booking.status}
              </div>
            </div>

            {(booking.checkin_time || booking.checkout_time) && (
              <div className="timestamp-info">
                {booking.checkin_time && (
                  <p>Check-in: {new Date(booking.checkin_time).toLocaleString()}</p>
                )}
                {booking.checkout_time && (
                  <p>Check-out: {new Date(booking.checkout_time).toLocaleString()}</p>
                )}
              </div>
            )}

            <div className="terms">
              <h4>Terms & Conditions</h4>
              <ul>
                <li>This is a computer generated invoice and does not require a signature</li>
                <li>All prices are inclusive of GST</li>
                <li>Please retain this invoice for your records</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
