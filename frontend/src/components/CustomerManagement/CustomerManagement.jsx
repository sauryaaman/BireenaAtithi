import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { RiSearch2Line, RiUserAddLine } from 'react-icons/ri';
import CustomerDetailModal from '../CustomerDetailModal/CustomerDetailModal';
import './CustomerManagement.css';
const BASE_URL = import.meta.env.VITE_API_URL;

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/customers`);
      setCustomers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setIsEditing(false);
  };

  const handleEditCustomer = () => {
    setIsEditing(true);
  };

  const closeModal = () => {
    setSelectedCustomer(null);
    setIsEditing(false);
  };

  return (
    <div className="customer-management">
      <div className="page-header">
        <h1>Customer Management</h1>
        <button className="add-customer-btn">
          <RiUserAddLine /> Add New Customer
        </button>
      </div>

      <div className="search-section">
        <div className="search-bar">
          <RiSearch2Line className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, phone or email..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading customers...</div>
      ) : (
        <div className="customers-table">
          <table>
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Last Visit</th>
                <th>Total Visits</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(customer => (
                <tr key={customer.customer_id}>
                  <td>{customer.name}</td>
                  <td>{customer.phone || 'Not provided'}</td>
                  <td>{customer.email || 'Not provided'}</td>
                  <td>
                    {customer.bookings && customer.bookings.length > 0
                      ? format(new Date(customer.bookings[0].checkin_date), 'PPP')
                      : 'No visits'}
                  </td>
                  <td>{customer.bookings?.length || 0}</td>
                  <td>
                    <span className={`status ${customer.status?.toLowerCase()}`}>
                      {customer.status || 'Active'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="view-button"
                      onClick={() => handleViewCustomer(customer)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={closeModal}
          onEdit={handleEditCustomer}
        />
      )}
    </div>
  );
};

export default CustomerManagement;
