import React from 'react';
import { format } from 'date-fns';
import {
  RiArrowLeftLine,
  RiEdit2Line,
  RiPhoneLine,
  RiMailLine,
  RiIdCardLine,
} from 'react-icons/ri';

const CustomerDetailModal = ({ customer, onClose, onEdit }) => {
  if (!customer) return null;

  return (
    <div className="modal-overlay">
      <div className="customer-detail-modal large-modal">
        <div className="modal-header">
          <button className="back-button" onClick={onClose}>
            <RiArrowLeftLine /> Back
          </button>
          <div className="header-actions">
            <button className="edit-button" onClick={onEdit}>
              <RiEdit2Line /> Edit Details
            </button>
          </div>
        </div>

        <div className="modal-content">
          <div className="detail-form">
            {/* Customer Information */}
            <div className="form-section">
              <h3 className="section-title">Guest Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <div className="form-value">{customer.name}</div>
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <div className="form-value">
                    <RiPhoneLine className="form-icon" />
                    {customer.phone || 'Not provided'}
                  </div>
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <div className="form-value">
                    <RiMailLine className="form-icon" />
                    {customer.email || 'Not provided'}
                  </div>
                </div>
                <div className="form-group">
                  <label>ID Proof</label>
                  <div className="form-value">
                    <RiIdCardLine className="form-icon" />
                    {customer.id_proof || 'Not provided'}
                  </div>
                </div>
              </div>
            </div>

            {/* Bookings Section */}
            <div className="form-section">
              <h3 className="section-title">Booking History</h3>
              {customer.bookings?.map((booking, index) => (
                <div key={booking.booking_id} className="booking-card">
                  <div className="booking-header">
                    <div className="booking-title">
                      <h4>Booking #{booking.booking_id}</h4>
                      <span className={`status-badge ${booking.status.toLowerCase()}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="booking-payment">
                      <span className="amount">₹{booking.total_amount}</span>
                      <span className={`payment-badge ${booking.payment_status.toLowerCase()}`}>
                        {booking.payment_status}
                      </span>
                    </div>
                  </div>

                  <div className="booking-dates">
                    <div className="date-group">
                      <label>Check-in</label>
                      <div className="date">{format(new Date(booking.checkin_date), 'PPP')}</div>
                    </div>
                    <div className="divider">→</div>
                    <div className="date-group">
                      <label>Check-out</label>
                      <div className="date">
                        {booking.checkout_date ? format(new Date(booking.checkout_date), 'PPP') : 'Not checked out'}
                      </div>
                    </div>
                  </div>

                  {/* Room Details */}
                  {booking.rooms && booking.rooms.length > 0 && (
                    <div className="rooms-section">
                      <h5>Room Details</h5>
                      <div className="rooms-grid">
                        {booking.rooms.map((room, roomIndex) => (
                          <div key={roomIndex} className="room-card">
                            <div className="room-details">
                              <div className="room-number">Room {room.room_number}</div>
                              <div className="room-type">{room.room_type}</div>
                              <div className="room-price">₹{room.price_per_night}/night</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Guests */}
                  {booking.additional_guests && booking.additional_guests.length > 0 && (
                    <div className="guests-section">
                      <h5>Additional Guests</h5>
                      <div className="guests-grid">
                        {booking.additional_guests.map((guest, guestIndex) => (
                          <div key={guestIndex} className="guest-card">
                            <div className="guest-header">
                              <div className="guest-name">{guest.name}</div>
                            </div>
                            <div className="guest-details">
                              {guest.phone && (
                                <div className="guest-info">
                                  <RiPhoneLine className="guest-icon" />
                                  {guest.phone}
                                </div>
                              )}
                              {guest.id_proof && (
                                <div className="guest-info">
                                  <RiIdCardLine className="guest-icon" />
                                  {guest.id_proof}
                                </div>
                              )}
                              {guest.email && (
                                <div className="guest-info">
                                  <RiMailLine className="guest-icon" />
                                  {guest.email}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailModal;
