


import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import './ViewBooking.css';

const BASE_URL = import.meta.env.VITE_API_URL;

const ViewBooking = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingData, setBookingData] = useState(null);
// console.log("bookingId:",bookingId);
  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BASE_URL}/api/bookings/${bookingId}/details`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.data) {
          throw new Error('Invalid booking data received');
        }
        console.log("Getting response:", response.data);
        const { booking, customer, guests, foodOrders } = response.data;
        setBookingData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching booking details:', err);
        setError(
          err.response?.data?.message || 
          err.message || 
          'Failed to fetch booking details'
        );
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!bookingData) return <div className="not-found">Booking not found</div>;

  const { booking, customer, guests } = bookingData;

  // Format time from datetime string
  const formatTime = (dateTimeStr) => {
    if (!dateTimeStr) return '-';
    const timeStr = dateTimeStr.split('T')[1];
    return timeStr ? timeStr.substring(0, 5) : '-';
  };

  // Format date from datetime string
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return format(new Date(dateStr), 'dd MMM yyyy');
  };

  return (
    <div className="booking-details">
      {/* <div className="header">
        <h2>Booking Details #{bookingId}</h2>
        <div>
        <button onClick={() => navigate(`/edit-booking/${bookingId}`)} className="back-btn">
          Edit Booking
        </button>&nbsp; 
        <button onClick={() => navigate(`/bookings`)} className="back-btn">
          Back to Bookings
        </button>
        </div>
      </div> */}

      <div className="details-container">

         <div className="header">
        <h2>Booking Details #{bookingId}</h2>
        <div>
        <button onClick={() => navigate(`/edit-booking/${bookingId}`)} className="back-btn">
          Edit Booking
        </button>&nbsp; 
        <button onClick={() => navigate(`/bookings`)} className="back-btn">
          Back to Bookings
        </button>
        </div>
      </div>
        {/* Booking Status */}
        <div className="status-section">
          <div className="status-badges">
            <div className={`status-badge ${booking.payment_status.toLowerCase()}`}>
              {booking.payment_status}
            </div>
            <div className={`status-badge ${booking.status.toLowerCase()}`}>
              {booking.status}
            </div>
          </div>
          <div className="payment-summary">
            <div className="amount-info">
              <span className="amount-label">Total Amount:</span>
              <span className="amount-value">₹{booking.total_amount}</span>
            </div>
            <div className="amount-info">
              <span className="amount-label">Amount Paid:</span>
              <span className="amount-value positive">₹{booking.amount_paid}</span>
            </div>
            {booking.amount_due > 0 && (
              <div className="amount-info">
                <span className="amount-label">Amount Due:</span>
                <span className="amount-value negative">₹{booking.amount_due}</span>
              </div>
            )}
            {booking.refund_amount > 0 && (
              <div className="amount-info">
                <span className="amount-label">Amount Refunded:</span>
                <span className="amount-value refunded">₹{booking.refund_amount}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stay Details */}
        <section className="detail-section">
          <h3>Stay Details</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="label">Check-in</span>
              <div className="value">
                <div>{formatDate(booking.check_in_date)}</div>
                <div className="time">{formatTime(booking.checkin_time)}</div>
              </div>
            </div>
            <div className="detail-item">
              <span className="label">Check-out</span>
              <div className="value">
                <div>{formatDate(booking.check_out_date)}</div>
                <div className="time">{formatTime(booking.checkout_time)}</div>
              </div>
            </div>
            <div className="detail-item">
              <span className="label">Total Nights</span>
              <div className="value">{booking.total_nights}</div>
            </div>
          </div>
        </section>

        {/* Room Details */}
        <section className="detail-section">
          <h3>Room Details</h3>
          <div className="rooms-grid">
            {booking.rooms.map((room, index) => (
              <div key={index} className="room-card">
                <div className="room-header">Room {index + 1}</div>
                <div className="room-details">
                  <div className="detail-row">
                    <span className="label">Room Number</span>
                    <span className="value">{room.room_number}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Type</span>
                    <span className="value">{room.room_type.replace(/_/g, ' ')}</span>
                  </div>
                  {/* <div className="detail-row">
                    <span className="label">Base Price/Night</span>
                    <span className="value">₹{room.price_per_night}</span>
                  </div> */}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Nightly Rates */}
        {booking.nightly_rates && booking.nightly_rates.length > 0 && (
          <section className="detail-section">
            <h3>Nightly Rates</h3>
            <div className="nightly-rates-grid">
              {booking.nightly_rates.map((rate, index) => (
                <div key={index} className="rate-card">
                  <div className="night-header">Night {rate.night}</div>
                  <div className="rate-details">
                    <div className="detail-row">
                      <span className="label">Rate</span>
                      <span className="value">₹{rate.rate}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Date</span>
                      <span className="value">
                        {formatDate(new Date(booking.check_in_date).setDate(
                          new Date(booking.check_in_date).getDate() + rate.night - 1
                        ))}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Guest Details */}
        <section className="detail-section">
          <h3>Guest Information</h3>
          <div className="guest-details">
            <div className="primary-guest">
              <h4>Primary Guest</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">Name</span>
                  <div className="value">{guests.primary.name}</div>
                </div>
                <div className="detail-item">
                  <span className="label">Phone</span>
                  <div className="value">{guests.primary.phone}</div>
                </div>
                <div className="detail-item">
                  <span className="label">Email</span>
                  <div className="value">{guests.primary.email || '-'}</div>
                </div>
                <div className="detail-item">
                  <span className="label">ID Proof</span>
                  <div className="value">{guests.primary.id_proof || '-'}</div>
                </div>
                {guests.primary.id_proof_number && (
                  <div className="detail-item">
                    <span className="label">ID Number</span>
                    <div className="value">{guests.primary.id_proof_number}</div>
                  </div>
                )}
                 {guests.primary.gst_number && (
                  <div className="detail-item">
                    <span className="label">GST Number.</span>
                    <div className="value">{guests.primary.gst_number}</div>
                  </div>
                )}
                 {customer.address?.address_line1 && (
              <div className="detail-item">
                <span className="label">Address</span>
                <div className="value">
                  <div>{customer.address.address_line1},{customer.address.city}, {customer.address.state},{customer.address.country}-{customer.address.pin}</div>
                  
                    
                </div>
              </div>
            )}  {customer.meal_plan && (
              <div className="detail-item">
                <span className="label">Meal Plan</span>
                <div className="value">{customer.meal_plan}</div>
              </div>
            )}
               
              </div>
            </div>

            {guests.additional && guests.additional.length > 0 && (
              <div className="additional-guests">
                <h4>Additional Guests</h4>
                <div className="guests-grid">
                  {guests.additional.map((guest, index) => (
                    <div key={index} className="guest-card">
                      <div className="guest-header">Guest {index + 1}</div>
                      <div className="guest-info">
                        <div className="detail-row">
                          <span className="label">Name</span>
                          <span className="value">{guest.name}</span>
                        </div>
                        {guest.id_proof && (
                          <div className="detail-row">
                            <span className="label">Id Proof</span>
                            <span className="value">{guest.id_proof}</span>
                          </div>
                        )}
                        {guest.id_proof_number && (
                          <div className="detail-row">
                            <span className="label">Id Proof Number</span>
                            <span className="value">{guest.id_proof_number}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Customer Details */}
        <section className="detail-section">
          <h3>Customer Details</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="label">Name</span>
              <div className="value">{customer.name}</div>
            </div>
            <div className="detail-item">
              <span className="label">Phone</span>
              <div className="value">{customer.phone}</div>
            </div>
            <div className="detail-item">
              <span className="label">Email</span>
              <div className="value">{customer.email || '-'}</div>
            </div>
            {customer.gst_number && (
              <div className="detail-item">
                <span className="label">GST Number</span>
                <div className="value">{customer.gst_number}</div>
              </div>
            )}
            {customer.meal_plan && (
              <div className="detail-item">
                <span className="label">Meal Plan</span>
                <div className="value">{customer.meal_plan}</div>
              </div>
            )}
            {customer.address?.address_line1 && (
              <div className="detail-item full-width">
                <span className="label">Address</span>
                <div className="value address">
                  <div>{customer.address.address_line1}</div>
                  {customer.address.city && (
                    <div>
                      {customer.address.city}, {customer.address.state}
                      {customer.address.pin && ` - ${customer.address.pin}`}
                    </div>
                  )}
                  {customer.address.country && <div>{customer.address.country}</div>}
                    
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Food Orders */}
        {bookingData.foodOrders && bookingData.foodOrders.length > 0 && (
          <section className="detail-section">
            <h3>Food Orders</h3>
            <div className="orders-container">
              {bookingData.foodOrders.map((order, orderIndex) => (
                <div key={orderIndex} className="order-card">
                  <div className="order-header">
                    <div className="order-title">Order #{orderIndex + 1}</div>
                    <div className="order-meta">
                      <span className={`status-badge ${order.payment_status?.toLowerCase()}`}>
                        {order.payment_status || 'N/A'}
                      </span>
                      {/* <span className="order-time">
                        {formatDate(order.created_at)} {formatTime(order.created_at)}
                      </span> */}
                    </div>
                  </div>
                  
                  <div className="order-items">
                    <h4>Items:</h4>
                    <table className="items-table">
                      <thead>
                        <tr>
                          <th>Item Name</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Qty</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items && order.items.map((item, itemIndex) => (
                          <tr key={itemIndex}>
                            <td>{item.name}</td>
                            <td>{item.category || '-'}</td>
                            <td>₹{item.price}</td>
                            <td>{item.quantity}</td>
                            <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="order-summary">
                    <div className="summary-row">
                      <span className="label">Total Amount:</span>
                      <span className="value">₹{order.total_amount}</span>
                    </div>
                    <div className="summary-row">
                      <span className="label">Amount Paid:</span>
                      <span className="value positive">₹{order.amount_paid}</span>
                    </div>
                    {order.amount_due > 0 && (
                      <div className="summary-row">
                        <span className="label">Amount Due:</span>
                        <span className="value negative">₹{order.amount_due}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ViewBooking;