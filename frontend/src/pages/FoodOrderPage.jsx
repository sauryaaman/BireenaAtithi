import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { RiArrowLeftLine } from 'react-icons/ri';
import './FoodOrderPage.css';

const BASE_URL = import.meta.env.VITE_API_URL;

const FoodOrderPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [amountPaid, setAmountPaid] = useState(0);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [existingOrder, setExistingOrder] = useState(null);
  const [initialItems, setInitialItems] = useState([]);
  const [initialAmountPaid, setInitialAmountPaid] = useState(0);
  const [orderStatus, setOrderStatus] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [printingKOT, setPrintingKOT] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        // First check booking status before allowing food order
        const statusCheckRes = await axios.get(`${BASE_URL}/api/bookings/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const statusData = statusCheckRes.data;
        const bookingStatus = statusData.booking?.status?.toLowerCase();
        
        // If status is not checked-in, redirect back
        const validStatuses = ['checkin', 'checked-in', 'checked in'];
        if (!validStatuses.includes(bookingStatus)) {
          toast.error(`Cannot order food. Booking status is: ${bookingStatus}`);
          navigate(-1);
          return;
        }

        // Fetch booking details
        const bookingRes = await axios.get(`${BASE_URL}/api/bookings/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const responseData = bookingRes.data;
        console.log('📋 Full Response:', responseData);
        
        // The API returns data with booking object nested inside
        const bookingData = {
          booking_id: responseData.booking_id,
          status: responseData.booking?.status,
          customer: responseData.customer,
          primary_guest: responseData.guests?.primary,
          rooms: responseData.booking?.rooms || [],
          checkin_date: responseData.booking?.check_in_date,
          checkout_date: responseData.booking?.check_out_date,
          total_amount: responseData.booking?.total_amount,
          amount_paid: responseData.booking?.amount_paid,
          amount_due: responseData.booking?.amount_due
        };
        
        // console.log('🏨 Processed Booking Data:', bookingData);
        // console.log('🏨 Rooms:', bookingData.rooms);
        setBooking(bookingData);

        // Fetch menu items
        const menuRes = await axios.get(`${BASE_URL}/api/menu`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMenuItems(menuRes.data || []);

        // Fetch existing order if any
        try {
          const orderRes = await axios.get(
            `${BASE_URL}/api/food-orders/booking/${bookingId}/details`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          if (orderRes.data?.order) {
            setExistingOrder(orderRes.data.order);
            setAmountPaid(orderRes.data.order.amount_paid || 0);
            setInitialAmountPaid(orderRes.data.order.amount_paid || 0);
            setOrderStatus(orderRes.data.order.status || 'pending');
            
            // Format items for display
            const formattedItems = [];
            for (const item of orderRes.data.items || []) {
              const menuItem = menuRes.data.find(m => (m.item_id || m.id) === item.menu_item_id);
              const itemName = menuItem?.name || item.menu_item_id;
              
              formattedItems.push({
                menu_item_id: item.menu_item_id,
                name: itemName,
                price: item.price,
                quantity: item.quantity,
                id: item.id
              });
            }
            setSelectedItems(formattedItems);
            setInitialItems(JSON.parse(JSON.stringify(formattedItems)));
          }
        } catch (err) {
          // No existing order, start fresh
          setSelectedItems([]);
          setInitialItems([]);
          setAmountPaid(0);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Failed to load data');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookingId]);

  const handleAddItem = (item) => {
    const itemId = item.item_id || item.id;
    const existingItem = selectedItems.find(si => si.menu_item_id === itemId);
    
    if (existingItem) {
      setSelectedItems(
        selectedItems.map(si =>
          si.menu_item_id === itemId
            ? { ...si, quantity: (si.quantity || 0) + 1 }
            : si
        )
      );
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          menu_item_id: itemId,
          name: item.name,
          price: item.price,
          quantity: 1
        }
      ]);
    }
  };

  const handleRemoveItem = (menuItemId) => {
    setSelectedItems(selectedItems.filter(item => item.menu_item_id !== menuItemId));
  };

  const handleQuantityChange = (menuItemId, quantity) => {
    if (quantity <= 0) {
      handleRemoveItem(menuItemId);
    } else {
      setSelectedItems(
        selectedItems.map(item =>
          item.menu_item_id === menuItemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const calculateTotal = () => {
    return selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleStatusChange = async (newStatus) => {
    if (!existingOrder) {
      toast.error('No order to update');
      return;
    }

    setStatusUpdating(true);
    try {
      const token = localStorage.getItem('token');
      
      await axios.patch(
        `${BASE_URL}/api/food-orders/${existingOrder.id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrderStatus(newStatus);
      setExistingOrder({ ...existingOrder, status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error(err.response?.data?.error || 'Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handlePrintKOT = () => {
    if (!existingOrder) {
      toast.error('No order to print');
      return;
    }

    setPrintingKOT(true);

    const totalAmount = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create KOT content for thermal printer
    const kotContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>KOT - ${existingOrder.id}</title>
        <style>
          @media print {
            @page { 
              margin: 0; 
              size: 80mm auto;
            }
            body { margin: 0; padding: 0; }
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Courier New', Courier, monospace;
            width: 80mm;
            margin: 0;
            padding: 8px;
            font-size: 11px;
            line-height: 1.4;
          }
          .header {
            text-align: center;
            border-bottom: 2px dashed #000;
            padding-bottom: 8px;
            margin-bottom: 8px;
          }
          .header h1 {
            margin: 0;
            font-size: 18px;
            font-weight: bold;
            letter-spacing: 1px;
          }
          .header h2 {
            margin: 3px 0 0 0;
            font-size: 14px;
          }
          .kot-type {
            background: #000;
            color: #fff;
            padding: 6px;
            text-align: center;
            font-weight: bold;
            margin: 8px 0;
            font-size: 12px;
          }
          .info {
            margin: 8px 0;
            border-bottom: 1px dashed #000;
            padding-bottom: 8px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin: 2px 0;
            font-size: 11px;
          }
          .info-label {
            font-weight: bold;
          }
          .room-highlight {
            font-size: 18px;
            font-weight: bold;
            background: #f0f0f0;
            padding: 2px 4px;
          }
          .items-header {
            border-bottom: 2px solid #000;
            padding: 5px 0;
            margin: 8px 0 5px 0;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            font-size: 11px;
          }
          .item-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 6px 0;
            border-bottom: 1px dotted #ccc;
          }
          .item-details {
            flex: 1;
            padding-right: 8px;
          }
          .item-name {
            font-weight: bold;
            font-size: 11px;
            margin-bottom: 2px;
          }
          .item-price {
            font-size: 10px;
            color: #555;
          }
          .item-right {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            min-width: 80px;
          }
          .item-qty {
            font-weight: bold;
            font-size: 13px;
            margin-bottom: 2px;
          }
          .item-total {
            font-size: 11px;
            font-weight: bold;
          }
          .totals {
            margin-top: 8px;
            padding-top: 8px;
            border-top: 2px solid #000;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin: 4px 0;
            font-size: 12px;
          }
          .total-row.grand {
            font-size: 14px;
            font-weight: bold;
            margin-top: 4px;
            padding-top: 4px;
            border-top: 1px dashed #000;
          }
          .footer {
            border-top: 2px dashed #000;
            padding-top: 8px;
            margin-top: 8px;
            text-align: center;
            font-size: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>KITCHEN ORDER TICKET</h1>
          <h2>(KOT)</h2>
        </div>
        
        <div class="kot-type">
          ${existingOrder.updated_at !== existingOrder.created_at ? '*** UPDATED ORDER ***' : '*** NEW ORDER ***'}
        </div>

        <div class="info">
          <div class="info-row">
            <span class="info-label">Order ID:</span>
            <span>#${existingOrder.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Booking:</span>
            <span>#${booking?.booking_id || bookingId}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Room No:</span>
            <span class="room-highlight">${booking?.rooms?.[0]?.room_number || booking?.room_number || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Customer:</span>
            <span>${booking?.customer?.name || booking?.primary_guest?.name || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Time:</span>
            <span>${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Date:</span>
            <span>${new Date().toLocaleDateString('en-IN')}</span>
          </div>
        </div>

        <div class="items-header">
          <span>ITEM</span>
          <span>QTY | AMOUNT</span>
        </div>

        ${selectedItems.map(item => `
          <div class="item-row">
            <div class="item-details">
              <div class="item-name">${item.name}</div>
              <div class="item-price">@ ₹${item.price.toFixed(2)}</div>
            </div>
            <div class="item-right">
              <div class="item-qty">x ${item.quantity}</div>
              <div class="item-total">₹${(item.price * item.quantity).toFixed(2)}</div>
            </div>
          </div>
        `).join('')}

        <div class="totals">
          <div class="total-row grand">
            <span>TOTAL AMOUNT:</span>
            <span>₹${totalAmount.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Paid:</span>
            <span>₹${(existingOrder.amount_paid || 0).toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Due:</span>
            <span>₹${Math.max(0, totalAmount - (existingOrder.amount_paid || 0)).toFixed(2)}</span>
          </div>
        </div>

        <div class="footer">
          <p>=============================</p>
          <p>Status: ${orderStatus?.toUpperCase()}</p>
          <p>--- END OF KOT ---</p>
          <p>${new Date().toLocaleString('en-IN')}</p>
        </div>

        <div style="text-align: center; margin-top: 15px; padding: 10px; border-top: 2px dashed #000;">
          <button 
            onclick="window.print()" 
            style="
              background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
              color: white;
              border: none;
              padding: 12px 30px;
              border-radius: 8px;
              font-size: 14px;
              font-weight: bold;
              cursor: pointer;
              box-shadow: 0 4px 8px rgba(0,0,0,0.2);
              margin: 5px;
            "
          >
            🖨️ Print KOT
          </button>
          <button 
            onclick="window.close()" 
            style="
              background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
              color: white;
              border: none;
              padding: 12px 30px;
              border-radius: 8px;
              font-size: 14px;
              font-weight: bold;
              cursor: pointer;
              box-shadow: 0 4px 8px rgba(0,0,0,0.2);
              margin: 5px;
            "
          >
            ❌ Close
          </button>
        </div>

        <style>
          @media print {
            button { display: none !important; }
          }
        </style>
      </body>
      </html>
    `;

    // Open print window with larger size for preview
    const printWindow = window.open('', '_blank', 'width=400,height=800');
    if (printWindow) {
      printWindow.document.write(kotContent);
      printWindow.document.close();
      setPrintingKOT(false);
      toast.success('KOT preview opened! Click print when ready.');
    } else {
      toast.error('Please allow popups to print KOT');
      setPrintingKOT(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const total = calculateTotal();

      if (existingOrder) {
        // UPDATE order
        const itemsToUpdate = [];

        selectedItems.forEach(item => {
          itemsToUpdate.push({
            menu_item_id: item.menu_item_id,
            quantity: item.quantity,
            itemId: item.id || null
          });
        });

        const removedItems = initialItems.filter(
          ii => !selectedItems.find(si => si.menu_item_id === ii.menu_item_id)
        );

        removedItems.forEach(item => {
          itemsToUpdate.push({
            menu_item_id: item.menu_item_id,
            quantity: 0,
            itemId: item.id
          });
        });

        await axios.put(
          `${BASE_URL}/api/food-orders/${existingOrder.id}`,
          { 
            items: itemsToUpdate,
            amount_paid: amountPaid,
            amount_due: Math.max(0, total - amountPaid)
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Record only the ADDITIONAL payment if new amount > initial amount
        const additionalPayment = amountPaid - initialAmountPaid;
        if (additionalPayment > 0) {
          await axios.post(
            `${BASE_URL}/api/food-payments/record`,
            {
              food_order_id: existingOrder.id,
              amount: additionalPayment,
              payment_mode: paymentMode,
              notes: `Additional payment for Food Order - Booking #${bookingId}`
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }

        toast.success('Order updated successfully!');
        
        // Ask if user wants to print updated KOT
        const printKOT = window.confirm('Order updated! Do you want to print updated KOT?');
        if (printKOT) {
          setTimeout(() => handlePrintKOT(), 500);
        }
      } else {
        // CREATE order
        const itemsToCreate = selectedItems.map(item => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity
        }));

        const createOrderRes = await axios.post(
          `${BASE_URL}/api/food-orders/create`,
          { 
            booking_id: bookingId,
            items: itemsToCreate,
            amount_paid: amountPaid,
            amount_due: Math.max(0, total - amountPaid)
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Record payment if amount_paid > 0
        if (amountPaid > 0) {
          const foodOrderId = createOrderRes.data.order?.id;
          if (foodOrderId) {
            await axios.post(
              `${BASE_URL}/api/food-payments/record`,
              {
                food_order_id: foodOrderId,
                amount: amountPaid,
                payment_mode: paymentMode,
                notes: `Payment recorded for Food Order - Booking #${bookingId}`
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          }
        }

        toast.success('Order placed successfully!');
        
        // Ask if user wants to print KOT for new order
        const printKOT = window.confirm('Order created! Do you want to print KOT?');
        if (printKOT) {
          // Refresh page to load the order before printing
          window.location.reload();
          return;
        }
      }

      navigate(-1);
    } catch (err) {
      console.error('Error:', err);
      toast.error(err.response?.data?.error || 'Failed to save order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="food-order-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const total = calculateTotal();
  const amountDue = Math.max(0, total - amountPaid);

  return (
    <div className="food-order-page">
      <div className="food-order-container">
        {/* Header */}
        <div className="food-order-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <RiArrowLeftLine /> Back
          </button>
          <h1>🍽️ {existingOrder ? 'Edit' : 'Place'} Food Order</h1>
        </div>

        {/* Booking Info */}
        <div className="booking-info-section">
          <div className="booking-info-card">
            <div className="info-group">
              <span className="info-label">Booking ID</span>
              <span className="info-value">{booking?.booking_id}</span>
            </div>
            <div className="info-group">
              <span className="info-label">Customer</span>
              <span className="info-value">
                {booking?.customer?.name || booking?.primary_guest?.name || 'N/A'}
              </span>
            </div>
            <div className="info-group">
              <span className="info-label">Room</span>
              <span className="info-value">
                {booking?.rooms?.map(r => r.room_number).join(', ') || booking?.room_number || 'N/A'}
              </span>
            </div>
            <div className="info-group">
              <span className="info-label">Status</span>
              <span className={`status-badge ${booking?.status?.toLowerCase()}`}>
                {booking?.status}
              </span>
            </div>
          </div>

          {/* Order Status Section - Only show if order exists */}
          {existingOrder && (
            <div className="order-status-card">
              <div className="status-header">
                <h3>Food Order Status & KOT</h3>
              </div>
              <div className="status-content">
                <div className="current-status">
                  <span className="status-label">Current Status:</span>
                  <span className={`status-badge-large ${orderStatus?.toLowerCase()}`}>
                    {orderStatus?.charAt(0).toUpperCase() + orderStatus?.slice(1)}
                  </span>
                </div>
                
                <div className="status-actions">
                  {orderStatus === 'pending' ? (
                    <button
                      className="mark-delivered-btn"
                      onClick={() => handleStatusChange('delivered')}
                      disabled={statusUpdating}
                    >
                      {statusUpdating ? 'Updating...' : '✓ Mark as Delivered'}
                    </button>
                  ) : (
                    <button
                      className="mark-pending-btn"
                      onClick={() => handleStatusChange('pending')}
                      disabled={statusUpdating}
                    >
                      {statusUpdating ? 'Updating...' : '← Mark as Pending'}
                    </button>
                  )}
                  
                  <button
                    className="print-kot-btn"
                    onClick={handlePrintKOT}
                    disabled={printingKOT}
                  >
                    {printingKOT ? 'Printing...' : '🖨️ Print KOT'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="food-order-content">
          {/* Menu Section */}
          <div className="menu-section">
            <h2>Available Menu Items</h2>
            <div className="menu-grid">
              {menuItems.map((item) => {
                const itemId = item.item_id || item.id;
                const isSelected = selectedItems.some(si => si.menu_item_id === itemId);
                
                return (
                  <div 
                    key={itemId} 
                    className={`menu-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleAddItem(item)}
                  >
                    <div className="menu-card-header">
                      <h3>{item.name}</h3>
                      <span className="price">₹{item.price}</span>
                    </div>
                    {item.description && (
                      <p className="description">{item.description}</p>
                    )}
                    <button className="add-btn">
                      {isSelected ? '✓ Added' : '+ Add'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="order-summary-section">
            <h2>Order Summary</h2>
            
            {selectedItems.length === 0 ? (
              <div className="empty-order">
                <p>No items selected</p>
              </div>
            ) : (
              <>
                <div className="selected-items-list">
                  {selectedItems.map((item) => (
                    <div key={`${item.menu_item_id}-${item.id || 'new'}`} className="order-item">
                      <div className="item-info">
                        <h4>{item.name}</h4>
                        <p className="item-price">₹{item.price}</p>
                      </div>
                      <div className="item-controls">
                        <button 
                          className="qty-btn"
                          onClick={() => handleQuantityChange(item.menu_item_id, item.quantity - 1)}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.menu_item_id, parseInt(e.target.value) || 1)}
                          className="qty-input"
                        />
                        <button 
                          className="qty-btn"
                          onClick={() => handleQuantityChange(item.menu_item_id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <div className="item-total">
                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                      <button 
                        className="remove-btn"
                        onClick={() => handleRemoveItem(item.menu_item_id)}
                        title="Remove item"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* Payment Section */}
                <div className="payment-section">
                  <h3>Payment Details</h3>
                  
                  <div className="payment-field">
                    <label>Amount Paid (₹)</label>
                    {existingOrder ? (
                      <div className="amount-paid-display">
                        <span className="locked-amount">₹{initialAmountPaid.toFixed(2)}</span>
                        <span className="lock-icon" title="Locked - Cannot modify previous payment">🔒</span>
                      </div>
                    ) : (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                        placeholder="Enter amount paid"
                        className="payment-input"
                      />
                    )}
                  </div>

                  <div className="payment-field">
                    <label>Payment Mode</label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      className="payment-input"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="UPI">UPI</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>

                  <div className="bill-summary">
                    <div className="bill-row">
                      <span>Total Amount:</span>
                      <span className="bill-value">₹{total.toFixed(2)}</span>
                    </div>
                    <div className="bill-row">
                      <span>Amount Paid:</span>
                      <span className="bill-value">₹{amountPaid.toFixed(2)}</span>
                    </div>
                    <div className="bill-row amount-due">
                      <span>Amount Due:</span>
                      <span className={`bill-value ${amountDue === 0 ? 'paid' : 'pending'}`}>
                        ₹{amountDue.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button 
                    className="confirm-btn"
                    onClick={handleConfirmOrder}
                    disabled={submitting}
                  >
                    {submitting ? 'Processing...' : (existingOrder ? 'Update Order' : 'Confirm Order')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodOrderPage;
