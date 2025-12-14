import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { RiCloseLine } from 'react-icons/ri';
import './FoodPaymentModal.css';

const FoodPaymentModal = ({
  isOpen,
  onClose,
  onSubmit,
  booking,
  foodOrder,
  paymentAmount,
  setPaymentAmount,
  paymentMode,
  setPaymentMode,
  isSubmitting
}) => {
  if (!foodOrder) return null;

  const amountDue = foodOrder.amount_due || 0;
  const totalAmount = foodOrder.total_amount || 0;
  const amountPaid = foodOrder.amount_paid || 0;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="food-payment-modal-container" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="food-payment-backdrop" />
        </Transition.Child>

        <div className="food-payment-modal-wrapper">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="food-payment-modal">
              {/* Header */}
              <div className="food-payment-header">
                <Dialog.Title>Food Order Payment</Dialog.Title>
                <button
                  onClick={onClose}
                  className="close-btn"
                  disabled={isSubmitting}
                >
                  <RiCloseLine />
                </button>
              </div>

              {/* Body */}
              <div className="food-payment-body">
                {/* Booking Info */}
                <div className="booking-info-box">
                  <div className="info-row">
                    <span className="label">Booking ID:</span>
                    <span className="value">#{booking?.booking_id}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Customer:</span>
                    <span className="value">
                      {booking?.customer?.name || booking?.primary_guest?.name || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Food Order Summary */}
                <div className="food-summary-box">
                  <h3>Order Summary</h3>
                  <div className="summary-row">
                    <span>Total Amount:</span>
                    <span className="amount">₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Already Paid:</span>
                    <span className="amount paid">₹{amountPaid.toFixed(2)}</span>
                  </div>
                  <div className="summary-row highlight">
                    <span>Amount Due:</span>
                    <span className={`amount ${amountDue > 0 ? 'due' : 'paid'}`}>
                      ₹{amountDue.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Payment Form */}
                <div className="payment-form">
                  <div className="form-group">
                    <label>Payment Amount</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      max={amountDue}
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder={`Enter amount (Max: ₹${amountDue.toFixed(2)})`}
                      className="payment-input"
                      disabled={isSubmitting}
                    />
                    {paymentAmount && parseFloat(paymentAmount) > amountDue && (
                      <span className="error-text">Amount cannot exceed due amount</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Payment Mode</label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      className="payment-select"
                      disabled={isSubmitting}
                    >
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="UPI">UPI</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>

                  {paymentAmount && (
                    <div className="payment-preview">
                      <p>
                        You are adding <span className="highlight-amount">₹{parseFloat(paymentAmount).toFixed(2)}</span> payment
                      </p>
                      <p>
                        New amount due will be: <span className="new-due">₹{Math.max(0, amountDue - parseFloat(paymentAmount || 0)).toFixed(2)}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="food-payment-footer">
                <button
                  onClick={onClose}
                  className="cancel-btn"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={onSubmit}
                  className="submit-btn"
                  disabled={isSubmitting || !paymentAmount || parseFloat(paymentAmount) <= 0 || parseFloat(paymentAmount) > amountDue}
                >
                  {isSubmitting ? 'Processing...' : 'Record Payment'}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default FoodPaymentModal;
