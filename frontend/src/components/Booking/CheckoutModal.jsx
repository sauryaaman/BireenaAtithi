import { useState } from 'react';
import { RiCloseLine, RiCheckboxCircleLine } from 'react-icons/ri';
import axios from 'axios';
import './CheckoutModal.css';
const BASE_URL = import.meta.env.VITE_API_URL;

const CheckoutModal = ({ booking, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    finalAmount: booking.total_amount,
    paymentStatus: booking.payment_status
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // Update payment status first if it changed
      if (formData.paymentStatus !== booking.payment_status) {
        await axios.put(
          `${BASE_URL}/api/bookings/${booking.booking_id}/payment`,
          { payment_status: formData.paymentStatus },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // Process checkout
      await axios.put(
        `${BASE_URL}/api/bookings/${booking.booking_id}/checkout`,
        { final_amount: formData.finalAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="checkout-modal">
        <div className="modal-header">
          <h2>Checkout - Room {booking.room.room_number}</h2>
          <button onClick={onClose} className="close-button">
            <RiCloseLine />
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="checkout-details">
            <div className="detail-row">
              <span>Customer:</span>
              <span>{booking.customer.name}</span>
            </div>
            <div className="detail-row">
              <span>Check-in Date:</span>
              <span>{new Date(booking.checkin_date).toLocaleDateString()}</span>
            </div>
            <div className="detail-row">
              <span>Check-out Date:</span>
              <span>{new Date(booking.checkout_date).toLocaleDateString()}</span>
            </div>
            <div className="detail-row">
              <span>Original Amount:</span>
              <span>₹{booking.total_amount}</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="finalAmount">Final Amount</label>
            <input
              type="number"
              id="finalAmount"
              name="finalAmount"
              value={formData.finalAmount}
              onChange={handleInputChange}
              min={0}
              required
            />
            {formData.finalAmount !== booking.total_amount && (
              <small className="amount-difference">
                {formData.finalAmount > booking.total_amount ? 'Additional charges: ' : 'Discount: '}
                ₹{Math.abs(formData.finalAmount - booking.total_amount)}
              </small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="paymentStatus">Payment Status</label>
            <select
              id="paymentStatus"
              name="paymentStatus"
              value={formData.paymentStatus}
              onChange={handleInputChange}
              required
            >
              <option value="PENDING">Pending</option>
              <option value="PARTIAL">Partial</option>
              <option value="PAID">Paid</option>
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="confirm-btn" disabled={loading}>
              {loading ? (
                'Processing...'
              ) : (
                <>
                  <RiCheckboxCircleLine /> Confirm Checkout
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;
