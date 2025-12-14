import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiCheckCircle, FiXCircle, FiList } from 'react-icons/fi';
import { MdRestaurantMenu } from 'react-icons/md';
import './MenuManagement.css';

const BASE_URL = import.meta.env.VITE_API_URL;

export default function MenuManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({ name: '', description: '', price: '', category: '' });
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true); setError(null);
    try {
      const resp = await axios.get(`${BASE_URL}/api/menu`, { headers: { Authorization: `Bearer ${token}` } });
      setItems(resp.data || []);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load');
    } finally { setLoading(false); }
  };

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', category: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (!form.name || form.price === '') return setError('Name and price required');
      const payload = { ...form, price: parseFloat(form.price) };
      if (editingId) {
        await axios.put(`${BASE_URL}/api/menu/${editingId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`${BASE_URL}/api/menu`, payload, { headers: { Authorization: `Bearer ${token}` } });
      }
      await loadItems();
      resetForm();
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Save failed');
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({ name: item.name || '', description: item.description || '', price: item.price || '', category: item.category || '' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this menu item?')) return;
    try {
      await axios.delete(`${BASE_URL}/api/menu/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      await loadItems();
    } catch (e) {
      alert(e.response?.data?.message || e.message || 'Delete failed');
    }
  };

  return (
    <div className="menu-management-page">
      <div className="menu-content">
        {/* Form Section */}
        <div className="menu-form-section">
          <h2>
            <MdRestaurantMenu />
            {editingId ? 'Edit Menu Item' : 'Add New Item'}
          </h2>
          <form onSubmit={handleSubmit} className="menu-form">
            {error && (
              <div className="error-message">
                <FiXCircle />
                {error}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="name">Item Name</label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                placeholder="e.g., Paneer Butter Masala"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <input
                id="category"
                type="text"
                value={form.category}
                onChange={e => setForm({...form, category: e.target.value})}
                placeholder="e.g., Starter, Main Course, Beverage"
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">Price (₹)</label>
              <input
                id="price"
                type="number"
                step="0.01"
                value={form.price}
                onChange={e => setForm({...form, price: e.target.value})}
                placeholder="0.00"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                placeholder="Brief description of the item"
                rows="2"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? <><FiEdit2 /> Update Item</> : <><FiPlus /> Add Item</>}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="btn btn-secondary">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Table Section */}
        <div className="menu-table-section">
          <div className="table-header">
            <h2>
              <FiList />
              Menu Items
            </h2>
            <div className="table-stats">
              Total: {items.length} items
            </div>
          </div>

          <div className="menu-table-wrapper">
            {loading ? (
              <div className="loading-state">Loading menu items...</div>
            ) : items.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <MdRestaurantMenu />
                </div>
                <p>No menu items yet. Add your first item above!</p>
              </div>
            ) : (
              <table className="menu-table">
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.category || '-'}</td>
                      <td>{item.description || '-'}</td>
                      <td>₹{parseFloat(item.price).toFixed(2)}</td>
                      <td>
                        <span className={`status-badge ${item.is_active ? 'status-active' : 'status-inactive'}`}>
                          {item.is_active ? <><FiCheckCircle /> Active</> : <><FiXCircle /> Inactive</>}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button 
                            onClick={() => startEdit(item)} 
                            className="btn-icon btn-edit"
                            title="Edit item"
                          >
                            <FiEdit2 />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)} 
                            className="btn-icon btn-delete"
                            title="Delete item"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
