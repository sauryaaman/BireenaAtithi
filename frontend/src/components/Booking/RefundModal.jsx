import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

const RefundModal = ({ isOpen, onClose, booking, onRefundComplete }) => {
  const [refundAmount, setRefundAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!refundAmount || parseFloat(refundAmount) <= 0) {
      toast.error('Please enter a valid refund amount');
      return;
    }

    const amountToRefund = parseFloat(refundAmount);
    if (amountToRefund > booking.amount_paid) {
      toast.error('Refund amount cannot exceed amount paid');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${BASE_URL}/api/bookings/${booking.booking_id}/cancel`,
        {
          refund_amount: amountToRefund,
          payment_mode: paymentMode
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Refund processed successfully');
      onRefundComplete();
      onClose();
    } catch (err) {
      console.error('Refund error:', err);
      toast.error(err.response?.data?.error || 'Failed to process refund');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  Process Refund for Booking #{booking?.booking_id}
                </Dialog.Title>

                <div className="mb-4 bg-gray-50 p-4 rounded-lg">
                  <p className="mb-2">
                    <span className="font-medium">Customer:</span>{' '}
                    {booking?.customer?.name || booking?.primary_guest?.name}
                  </p>
                  <div className="text-sm text-gray-600">
                    <p className="flex justify-between py-1">
                      <span>Total Amount:</span>
                      <span>₹{booking?.total_amount}</span>
                    </p>
                    <p className="flex justify-between py-1">
                      <span>Amount Paid:</span>
                      <span>₹{booking?.amount_paid || 0}</span>
                    </p>
                    {refundAmount && (
                      <p className="flex justify-between py-1 text-red-600 font-medium border-t mt-2 pt-2">
                        <span>Refund Amount:</span>
                        <span>₹{parseFloat(refundAmount || 0)}</span>
                      </p>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Refund Amount
                    </label>
                    <input
                      type="number"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      placeholder="Enter refund amount"
                      className="w-full p-2 border rounded-md"
                      max={booking?.amount_paid}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Refund Mode
                    </label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="UPI">UPI</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !refundAmount || parseFloat(refundAmount) <= 0}
                      className={`px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isSubmitting ? 'Processing...' : 'Process Refund'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default RefundModal;