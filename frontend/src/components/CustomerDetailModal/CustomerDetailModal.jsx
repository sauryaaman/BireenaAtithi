import React from 'react';
import { format } from 'date-fns';
import {
  RiArrowLeftLine,
  RiEdit2Line,
  RiPhoneLine,
  RiMailLine,
  RiIdCardLine,
  RiUserLine,
  RiCalendarLine,
  RiMoneyDollarCircleLine,
  RiHotelBedLine,
} from 'react-icons/ri';

const CustomerDetailModal = ({ customer, onClose, onEdit }) => {
  if (!customer) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="customer-detail-modal large-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-left">
            <button className="back-button" onClick={onClose}>
              <RiArrowLeftLine /> 
            </button>
            <div className="header-title">
              <h2>Guest Details</h2>
              <p className="header-subtitle">View complete guest information and booking history</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="edit-button" onClick={onEdit}>
              <RiEdit2Line /> Edit
            </button>
          </div>
        </div>

        <div className="modal-content">
          <div className="detail-form">
            {/* Customer Information Card */}
            <div className="info-card guest-info-card">
              <div className="card-header">
                <div className="card-icon">
                  <RiUserLine />
                </div>
                <h3 className="card-title">Guest Information</h3>
              </div>
              <div className="info-grid">
                <div className="info-item">
                  <label><RiUserLine className="label-icon" /> Full Name</label>
                  <div className="info-value">{customer.name}</div>
                </div>
                <div className="info-item">
                  <label><RiPhoneLine className="label-icon" /> Phone Number</label>
                  <div className="info-value">
                    <a href={`tel:${customer.phone}`} className="phone-link">
                      {customer.phone || 'Not provided'}
                    </a>
                  </div>
                </div>
                <div className="info-item">
                  <label><RiMailLine className="label-icon" /> Email Address</label>
                  <div className="info-value">
                    <a href={`mailto:${customer.email}`} className="email-link">
                      {customer.email || 'Not provided'}
                    </a>
                  </div>
                </div>
                <div className="info-item">
                  <label><RiIdCardLine className="label-icon" /> ID Proof</label>
                  <div className="info-value">{customer.id_proof || 'Not provided'}</div>
                </div>
              </div>
            </div>

            {/* Bookings Section */}
            <div className="bookings-section">
              <div className="section-header">
                <div className="section-icon">
                  <RiCalendarLine />
                </div>
                <h3 className="section-title">Booking History</h3>
                <span className="bookings-count">{customer.bookings?.length || 0} Booking(s)</span>
              </div>
              
              {customer.bookings && customer.bookings.length > 0 ? (
                customer.bookings.map((booking, index) => (
                  <div key={booking.booking_id} className="booking-card">
                    <div className="booking-header">
                      <div className="booking-title">
                        <div className="booking-id-section">
                          <span className="booking-label">Booking ID</span>
                          <h4>#{booking.booking_id}</h4>
                        </div>
                        <span className={`status-badge ${booking.status.toLowerCase().replace(/\s+/g, '-')}`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="booking-payment">
                        <div className="amount-section">
                          <span className="amount-label">Total Amount</span>
                          <span className="amount"><RiMoneyDollarCircleLine /> ₹{booking.total_amount?.toFixed(2)}</span>
                        </div>
                        <span className={`payment-badge ${booking.payment_status?.toLowerCase()}`}>
                          {booking.payment_status}
                        </span>
                      </div>
                    </div>

                    <div className="booking-dates">
                      <div className="date-group">
                        <label><RiCalendarLine className="date-icon" /> Check-in</label>
                        <div className="date">{format(new Date(booking.checkin_date), 'dd MMM yyyy')}</div>
                      </div>
                      <div className="divider">→</div>
                      <div className="date-group">
                        <label><RiCalendarLine className="date-icon" /> Check-out</label>
                        <div className="date">
                          {booking.checkout_date ? format(new Date(booking.checkout_date), 'dd MMM yyyy') : 'Not checked out'}
                        </div>
                      </div>
                    </div>

                    {/* Room Details */}
                    {booking.rooms && booking.rooms.length > 0 && (
                      <div className="rooms-section">
                        <h5><RiHotelBedLine /> Rooms ({booking.rooms.length})</h5>
                        <div className="rooms-grid">
                          {booking.rooms.map((room, roomIndex) => (
                            <div key={roomIndex} className="room-card">
                              <div className="room-icon-wrapper">
                                <RiHotelBedLine className="room-icon" />
                              </div>
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
                        <h5><RiUserLine /> Additional Guests ({booking.additional_guests.length})</h5>
                        <div className="guests-grid">
                          {booking.additional_guests.map((guest, guestIndex) => (
                            <div key={guestIndex} className="guest-card">
                              <div className="guest-avatar">
                                <RiUserLine />
                              </div>
                              <div className="guest-content">
                                <div className="guest-name">{guest.name}</div>
                                <div className="guest-details">
                                  {guest.phone && (
                                    <div className="guest-info">
                                      <RiPhoneLine className="guest-icon" />
                                      <a href={`tel:${guest.phone}`}>{guest.phone}</a>
                                    </div>
                                  )}
                                  {guest.email && (
                                    <div className="guest-info">
                                      <RiMailLine className="guest-icon" />
                                      <a href={`mailto:${guest.email}`}>{guest.email}</a>
                                    </div>
                                  )}
                                  {guest.id_proof && (
                                    <div className="guest-info">
                                      <RiIdCardLine className="guest-icon" />
                                      <span>{guest.id_proof}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-bookings">
                  <RiCalendarLine className="no-bookings-icon" />
                  <p>No booking history available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailModal;
