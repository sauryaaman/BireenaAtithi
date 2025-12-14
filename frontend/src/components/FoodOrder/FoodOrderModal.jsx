// import { useState, useEffect } from 'react';
// import { Dialog, Transition } from '@headlessui/react';
// import { Fragment } from 'react';
// import axios from 'axios';
// import { toast } from 'react-hot-toast';
// import './FoodOrderModal.css';

// const BASE_URL = import.meta.env.VITE_API_URL;

// const FoodOrderModal = ({ booking, isOpen, onClose, existingOrder, roomNumber }) => {
//   const [menuItems, setMenuItems] = useState([]);
//   const [selectedItems, setSelectedItems] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [initialItems, setInitialItems] = useState([]);
//   const [amountPaid, setAmountPaid] = useState(0);
  
//   console.log('FoodOrderModal received - booking:', booking, 'existingOrder:', existingOrder);

//   // Get all room numbers from booking
//   // Try multiple possible data structures
//   let roomNumbers = [];
//   if (booking?.rooms && Array.isArray(booking.rooms)) {
//     roomNumbers = booking.rooms.map(r => r.room_number || r.number).filter(Boolean);
//   } else if (booking?.room) {
//     roomNumbers = [booking.room.room_number || booking.room.number];
//   } else if (roomNumber) {
//     roomNumbers = [roomNumber];
//   } else if (booking?.booking_rooms && Array.isArray(booking.booking_rooms)) {
//     roomNumbers = booking.booking_rooms.map(br => br.rooms?.room_number || br.room_number).filter(Boolean);
//   }
  
//   console.log('Room numbers extracted:', roomNumbers);
  
//   const roomString = roomNumbers.length > 1 
//     ? `Rooms: ${roomNumbers.join(', ')}` 
//     : `Room: ${roomNumbers[0] || 'N/A'}`;

//   useEffect(() => {
//     if (isOpen) {
//       fetchMenuItems();
//       if (existingOrder) {
//         fetchOrderItems();
//         // Load existing payment amounts
//         setAmountPaid(existingOrder.amount_paid || 0);
//       } else {
//         setSelectedItems([]);
//         setInitialItems([]);
//         setAmountPaid(0);
//       }
//     }
//   }, [isOpen, existingOrder]);

//   const fetchMenuItems = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${BASE_URL}/api/menu`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       console.log('Menu items fetched:', response.data);
//       setMenuItems(response.data || []);
//     } catch (err) {
//       console.error('Error fetching menu:', err);
//       toast.error('Failed to load menu items');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchOrderItems = async () => {
//     try {
//       if (!existingOrder?.id) {
//         console.log('⚠️  No existing order or order id');
//         return;
//       }
//       const token = localStorage.getItem('token');
      
//       console.log('\n📥 FETCHING EXISTING ORDER ITEMS');
//       console.log('Order ID:', existingOrder.id);
//       console.log('Booking ID:', booking.booking_id);
      
//       const response = await axios.get(
//         `${BASE_URL}/api/food-orders/booking/${booking.booking_id}/details`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
      
//       console.log('✅ Response received from backend:', response.data);
      
//       // Format items for display
//       const formattedItems = [];
//       console.log('\n📝 Processing items from database:');
      
//       for (const item of response.data?.items || []) {
//         // Try to get menu item name from menuItems
//         const menuItem = menuItems.find(m => (m.item_id || m.id) === item.menu_item_id);
//         const itemName = menuItem?.name || item.menu_item_id;
        
//         const formattedItem = {
//           menu_item_id: item.menu_item_id,
//           name: itemName,
//           price: item.price,
//           quantity: item.quantity,
//           id: item.id // Keep track of the DB id for updates
//         };
        
//         formattedItems.push(formattedItem);
//         console.log(`  📦 Item ${formattedItems.length}:`);
//         console.log(`     - Name: ${itemName}`);
//         console.log(`     - Menu Item ID: ${item.menu_item_id}`);
//         console.log(`     - DB Item ID: ${item.id}`);
//         console.log(`     - Quantity: ${item.quantity}`);
//         console.log(`     - Price: ₹${item.price}`);
//       }
      
//       setSelectedItems(formattedItems);
//       setInitialItems(JSON.parse(JSON.stringify(formattedItems))); // Deep copy for comparison
      
//       console.log('\n✅ Total items loaded:', formattedItems.length);
//       console.log('Ready for editing...\n');
//     } catch (err) {
//       console.error('❌ Error fetching order items:', err);
//       console.error('Error details:', err.response?.data);
//       setSelectedItems([]);
//       setInitialItems([]);
//     }
//   };

//   const handleAddItem = (item) => {
//     const itemId = item.item_id || item.id;
    
//     if (!itemId) {
//       console.error('Item missing ID:', item);
//       toast.error('Invalid item - missing ID');
//       return;
//     }
    
//     console.log('➕ handleAddItem called for:', item.name, 'menuItemId:', itemId);
    
//     const existingItem = selectedItems.find(si => si.menu_item_id === itemId);
//     if (existingItem) {
//       console.log('  Item already in cart, incrementing quantity');
//       setSelectedItems(
//         selectedItems.map(si =>
//           si.menu_item_id === itemId
//             ? { ...si, quantity: (si.quantity || 0) + 1 }
//             : si
//         )
//       );
//     } else {
//       console.log('  Adding new item to cart');
//       // NOTE: New items from menu don't have DB id yet, only get id when order is saved
//       setSelectedItems([
//         ...selectedItems,
//         {
//           menu_item_id: itemId,
//           name: item.name,
//           price: item.price,
//           quantity: 1
//           // NO id field - only items loaded from existing order have id
//         }
//       ]);
//     }
//   };

//   const handleRemoveItem = (menuItemId) => {
//     const itemToRemove = selectedItems.find(item => item.menu_item_id === menuItemId);
//     console.log(`\n🗑️  REMOVING ITEM:`);
//     console.log(`  Item: ${itemToRemove?.name || 'Unknown'}`);
//     console.log(`  Menu Item ID: ${menuItemId}`);
//     console.log(`  DB Item ID: ${itemToRemove?.id || 'NEW (no DB id)'}`);
//     console.log(`  Quantity: ${itemToRemove?.quantity || 0}`);
    
//     setSelectedItems(selectedItems.filter(item => item.menu_item_id !== menuItemId));
    
//     console.log(`  ✅ Item removed from selection`);
//     console.log(`  Remaining items: ${selectedItems.length - 1}\n`);
//   };

//   const handleQuantityChange = (menuItemId, quantity) => {
//     const itemFound = selectedItems.find(item => item.menu_item_id === menuItemId);
//     console.log(`\n📝 QUANTITY CHANGE:`);
//     console.log(`  Item: ${itemFound?.name || 'Unknown'}`);
//     console.log(`  Menu Item ID: ${menuItemId}`);
//     console.log(`  Old Quantity: ${itemFound?.quantity || 0}`);
//     console.log(`  New Quantity: ${quantity}\n`);
    
//     if (quantity <= 0) {
//       handleRemoveItem(menuItemId);
//     } else {
//       setSelectedItems(
//         selectedItems.map(item =>
//           item.menu_item_id === menuItemId ? { ...item, quantity } : item
//         )
//       );
//     }
//   };

//   const calculateTotal = () => {
//     const total = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
//     return { total };
//   };

//   const handleConfirmOrder = async () => {
//     if (selectedItems.length === 0) {
//       toast.error('Please select at least one item');
//       return;
//     }

//     for (const item of selectedItems) {
//       if (!item.menu_item_id || !item.quantity) {
//         console.error('Invalid item:', item);
//         toast.error('Invalid item in selection');
//         return;
//       }
//     }

//     setSubmitting(true);
//     try {
//       const token = localStorage.getItem('token');
      
//       console.log('\n' + '='.repeat(70));
//       console.log('🍽️  FOOD ORDER CONFIRMATION');
//       console.log('='.repeat(70));
//       console.log('Booking ID:', booking.booking_id);
//       console.log('Room(s):', roomNumbers.join(', '));
//       console.log('Customer:', booking.customer_name || 'N/A');

//       if (existingOrder) {
//         // UPDATE existing order
//         console.log('\n📝 MODE: UPDATING EXISTING ORDER');
//         console.log('Order ID:', existingOrder.id);
//         console.log('='.repeat(70));
        
//         console.log('\n📋 CURRENT STATE:');
//         console.log('Selected Items Now:', selectedItems.length);
//         selectedItems.forEach((item, idx) => {
//           console.log(`  ${idx + 1}. ${item.name} | menu_item_id: ${item.menu_item_id} | qty: ${item.quantity} | db_id: ${item.id || 'NEW'}`);
//         });
        
//         console.log('\nInitial Items (from DB):', initialItems.length);
//         initialItems.forEach((item, idx) => {
//           console.log(`  ${idx + 1}. ${item.name} | menu_item_id: ${item.menu_item_id} | qty: ${item.quantity} | db_id: ${item.id}`);
//         });

//         // Separate logic for updates, inserts, deletes
//         console.log('\n🔄 PROCESSING CHANGES:');
        
//         const itemsToUpdate = [];

//         // Add all currently selected items
//         console.log('\n1️⃣  Checking selected items:');
//         selectedItems.forEach(item => {
//           if (item.id) {
//             console.log(`  🔄 UPDATE (existing): ${item.name} | id: ${item.id} | new qty: ${item.quantity}`);
//             itemsToUpdate.push({
//               menu_item_id: item.menu_item_id,
//               quantity: item.quantity,
//               itemId: item.id
//             });
//           } else {
//             console.log(`  ➕ INSERT (new): ${item.name} | menu_item_id: ${item.menu_item_id} | qty: ${item.quantity}`);
//             itemsToUpdate.push({
//               menu_item_id: item.menu_item_id,
//               quantity: item.quantity,
//               itemId: null
//             });
//           }
//         });

//         // Check for removed items
//         console.log('\n2️⃣  Checking removed items:');
//         const removedItems = initialItems.filter(
//           ii => !selectedItems.find(si => si.menu_item_id === ii.menu_item_id)
//         );

//         if (removedItems.length === 0) {
//           console.log('  ✅ No items removed');
//         } else {
//           console.log(`  ❌ FOUND ${removedItems.length} removed items:`);
//           removedItems.forEach(item => {
//             console.log(`    ❌ DELETE: ${item.name} | id: ${item.id} | was qty: ${item.quantity}`);
//             itemsToUpdate.push({
//               menu_item_id: item.menu_item_id,
//               quantity: 0,
//               itemId: item.id
//             });
//           });
//         }

//         console.log('\n📤 FINAL DATA SENDING TO BACKEND:');
//         console.log('Total items in request:', itemsToUpdate.length);
//         console.table(itemsToUpdate);
//         console.log('Payment - Amount Paid: ₹' + amountPaid.toFixed(2));
//         console.log('Payment - Amount Due: ₹' + (total - amountPaid).toFixed(2));

//         const response = await axios.put(
//           `${BASE_URL}/api/food-orders/${existingOrder.id}`,
//           { 
//             items: itemsToUpdate,
//             amount_paid: amountPaid,
//             amount_due: Math.max(0, total - amountPaid)
//           },
//           { headers: { Authorization: `Bearer ${token}` } }
//         );

//         console.log('✅ Backend response:', response.data);
//       } else {
//         // CREATE new order
//         console.log('\n📝 MODE: CREATING NEW ORDER');
//         console.log('='.repeat(70));
        
//         console.log('\n🍽️  Items to create:');
//         selectedItems.forEach((item, idx) => {
//           console.log(`  ${idx + 1}. ${item.name} | menu_item_id: ${item.menu_item_id} | qty: ${item.quantity}`);
//         });

//         const itemsToCreate = selectedItems.map(item => ({
//           menu_item_id: item.menu_item_id,
//           quantity: item.quantity
//         }));

//         console.log('\n📤 FINAL DATA SENDING TO BACKEND:');
//         console.log('Booking ID:', booking.booking_id);
//         console.log('Items count:', itemsToCreate.length);
//         console.table(itemsToCreate);
//         console.log('Payment - Amount Paid: ₹' + amountPaid.toFixed(2));
//         console.log('Payment - Amount Due: ₹' + (total - amountPaid).toFixed(2));

//         const response = await axios.post(
//           `${BASE_URL}/api/food-orders/create`,
//           { 
//             booking_id: booking.booking_id,
//             items: itemsToCreate,
//             amount_paid: amountPaid,
//             amount_due: Math.max(0, total - amountPaid)
//           },
//           { headers: { Authorization: `Bearer ${token}` } }
//         );

//         console.log('✅ Backend response:', response.data);
//       }

//       const { total } = calculateTotal();
//       console.log('\n' + '='.repeat(70));
//       console.log('💰 ORDER SUMMARY:');
//       console.log('='.repeat(70));
//       console.log('Mode:', existingOrder ? 'UPDATE EXISTING' : 'CREATE NEW');
//       console.log('Total Items in Order:', selectedItems.length);
//       console.log('Total Amount: ₹' + total.toFixed(2));
      
//       selectedItems.forEach((item, idx) => {
//         console.log(`  ${idx + 1}. ${item.name} | Qty: ${item.quantity} | Price: ₹${item.price} | Subtotal: ₹${(item.price * item.quantity).toFixed(2)}`);
//       });
      
//       console.log('='.repeat(70));
//       console.log('✅ ORDER CONFIRMED & SUBMITTED\n');

//       toast.success(existingOrder ? 'Order updated successfully!' : 'Order placed successfully!');
//       onClose();
//       setSelectedItems([]);
//       setInitialItems([]);
//     } catch (err) {
//       console.error('❌ ERROR in handleConfirmOrder:', err);
//       console.error('Error response:', err.response?.data);
//       toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to place order');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const { total } = calculateTotal();

//   return (
//     <Transition appear show={isOpen} as={Fragment}>
//       <Dialog as="div" className="relative z-50" onClose={onClose}>
//         <Transition.Child
//           as={Fragment}
//           enter="ease-out duration-300"
//           enterFrom="opacity-0"
//           enterTo="opacity-100"
//           leave="ease-in duration-200"
//           leaveFrom="opacity-100"
//           leaveTo="opacity-0"
//         >
//           <div className="fixed inset-0 bg-black bg-opacity-50" />
//         </Transition.Child>

//         <div className="fixed inset-0 overflow-y-auto">
//           <div className="flex min-h-full items-center justify-center p-4">
//             <Transition.Child
//               as={Fragment}
//               enter="ease-out duration-300"
//               enterFrom="opacity-0 scale-95"
//               enterTo="opacity-100 scale-100"
//               leave="ease-in duration-200"
//               leaveFrom="opacity-100 scale-100"
//               leaveTo="opacity-0 scale-95"
//             >
//               <Dialog.Panel className="food-order-modal">
//                 <Dialog.Title className="modal-title">
//                   🍽️ {existingOrder ? 'Edit Order' : 'Order Food'} for {roomString}
//                 </Dialog.Title>

//                 <div className="modal-content">
//                   <div className="menu-section">
//                     <h3>Menu Items</h3>
//                     <div className="menu-list">
//                       {menuItems.map((item, index) => {
//                         const itemId = item.item_id || item.id;
//                         return (
//                           <div key={`menu-${itemId}-${index}`} className="menu-item">
//                             <div className="item-info">
//                               <p className="item-name">{item.name}</p>
//                               <p className="item-price">₹{item.price}</p>
//                             </div>
//                             <button
//                               onClick={() => handleAddItem(item)}
//                               className="add-item-btn"
//                             >
//                               +
//                             </button>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </div>

//                   <div className="bill-section">
//                     <h3>Bill Summary</h3>
//                     <div className="selected-items">
//                       {selectedItems.map((item, index) => (
//                         <div key={`selected-${item.menu_item_id}-${index}`} className="selected-item">
//                           <div className="item-details">
//                             <p>{item.name}</p>
//                             <p className="item-amount">₹{item.price}</p>
//                           </div>
//                           <div className="item-controls">
//                             <input
//                               type="number"
//                               min="1"
//                               value={item.quantity}
//                               onChange={(e) => handleQuantityChange(item.menu_item_id, parseInt(e.target.value))}
//                               className="qty-input"
//                             />
//                             <button
//                               onClick={() => handleRemoveItem(item.menu_item_id)}
//                               className="remove-btn"
//                             >
//                               ✕
//                             </button>
//                           </div>
//                           <p className="item-total">₹{(item.price * item.quantity).toFixed(2)}</p>
//                         </div>
//                       ))}
//                     </div>

//                     <div className="bill-totals">
//                       <div className="total-row grand-total">
//                         <span>Total:</span>
//                         <span>₹{total.toFixed(2)}</span>
//                       </div>
//                     </div>

//                     <div className="payment-section">
//                       <h3 style={{ marginBottom: '8px' }}>Payment Details</h3>
//                       <div className="payment-field">
//                         <label>Amount Paid (₹)</label>
//                         <input
//                           type="number"
//                           min="0"
//                           step="0.01"
//                           value={amountPaid}
//                           onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
//                           placeholder="Enter amount paid"
//                         />
//                       </div>
                      
//                       <div className="payment-summary">
//                         <div className="total-row">
//                           <span>Total Amount:</span>
//                           <span>₹{total.toFixed(2)}</span>
//                         </div>
//                         <div className="total-row">
//                           <span>Amount Paid:</span>
//                           <span>₹{amountPaid.toFixed(2)}</span>
//                         </div>
//                         <div className="total-row" style={{ borderTop: '1px solid #ddd', paddingTop: '6px', marginTop: '6px' }}>
//                           <span style={{ fontWeight: '600' }}>Amount Due:</span>
//                           <span style={{ color: amountPaid >= total ? '#4CAF50' : '#FF9800', fontWeight: '600' }}>
//                             ₹{(total - amountPaid).toFixed(2)}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="modal-footer">
//                   <button
//                     onClick={handleConfirmOrder}
//                     disabled={submitting || selectedItems.length === 0}
//                     className="confirm-btn"
//                   >
//                     {submitting ? 'Processing...' : existingOrder ? 'Update Order' : 'Confirm Order'}
//                   </button>
//                   <button onClick={onClose} className="cancel-btn">
//                     Cancel
//                   </button>
//                 </div>
//               </Dialog.Panel>
//             </Transition.Child>
//           </div>
//         </div>
//       </Dialog>
//     </Transition>
//   );
// };

// export default FoodOrderModal;
