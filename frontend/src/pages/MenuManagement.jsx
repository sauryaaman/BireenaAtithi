import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiCheckCircle, FiXCircle, FiList } from 'react-icons/fi';
import { MdRestaurantMenu } from 'react-icons/md';
import { toast } from 'react-toastify';  // 🎯 Import toast
import './MenuManagement.css';

const BASE_URL = import.meta.env.VITE_API_URL;

export default function MenuManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');  // Category filter state
  const [activeTab, setActiveTab] = useState('add');  // 🎯 Tab state: 'add' or 'show'

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
      if (!form.name || form.price === '' || !form.category) return setError('Name, category and price required');
      const payload = { ...form, price: parseFloat(form.price) };
      if (editingId) {
        await axios.put(`${BASE_URL}/api/menu/${editingId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('✅ Menu item updated successfully!', { autoClose: 2000 });  // 🎯 Toast for update
      } else {
        await axios.post(`${BASE_URL}/api/menu`, payload, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('✅ Menu item added successfully!', { autoClose: 2000 });  // 🎯 Toast for add
      }
      await loadItems();
      resetForm();
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Save failed');
      toast.error('❌ ' + (e.response?.data?.message || 'Failed to save'), { autoClose: 2000 });  // 🎯 Toast for error
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({ name: item.name || '', description: item.description || '', price: item.price || '', category: item.category || '' });
    setActiveTab('show');  // 🎯 Switch to Show Menu tab
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this menu item?')) return;
    try {
      await axios.delete(`${BASE_URL}/api/menu/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      await loadItems();
      toast.success('✅ Menu item deleted successfully!', { autoClose: 2000 });  // 🎯 Toast for delete
    } catch (e) {
      toast.error('❌ ' + (e.response?.data?.message || 'Delete failed'), { autoClose: 2000 });
    }
  };

  const toggleItemStatus = async (id, currentStatus) => {
    try {
      await axios.patch(`${BASE_URL}/api/menu/${id}/toggle-status`, { is_active: !currentStatus }, { headers: { Authorization: `Bearer ${token}` } });
      await loadItems();
      toast.success(`✅ Item ${!currentStatus ? 'activated' : 'deactivated'} successfully!`, { autoClose: 2000 });  // 🎯 Toast for toggle
    } catch (e) {
      toast.error('❌ ' + (e.response?.data?.message || 'Status update failed'), { autoClose: 2000 });
    }
  };

  // 🎯 Get unique categories from items
  const categories = Array.from(new Set(items.map(item => item.category).filter(Boolean))).sort();

  // 🎯 Filter items based on selected category
  const filteredItems = selectedCategory 
    ? items.filter(item => item.category === selectedCategory)
    : items;

  return (
    <div className="menu-management-page">
      <div className="menu-content">
        {/* 🎯 Tab Navigation */}
        <div className="menu-tabs">
          <button 
            className={`tab-button ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => { setActiveTab('add'); resetForm(); }}
          >
            <FiPlus /> Add Items
          </button>
          <button 
            className={`tab-button ${activeTab === 'show' ? 'active' : ''}`}
            onClick={() => setActiveTab('show')}
          >
            <FiList /> Show Menu
          </button>
        </div>

        {/* 🎯 TAB 1: Add Items */}
        {activeTab === 'add' && (
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
                <label htmlFor="category">Category *</label>
                <input
                  id="category"
                  type="text"
                  value={form.category}
                  onChange={e => setForm({...form, category: e.target.value})}
                  placeholder="e.g., Starter, Main Course, Beverage"
                  required
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
        )}

        {/* 🎯 TAB 2: Show Menu */}
        {activeTab === 'show' && (
        <div className="menu-table-section">
          <div className="table-header">
            <div className="header-left">
              <h2>
                <FiList />
                Menu Items
              </h2>
            </div>
            
            {/* 🎯 Category Filter - Moved to RIGHT */}
            <div className="header-right">
              <div className="category-filter">
                <label htmlFor="category-filter">Filter by Category:</label>
                <select
                  id="category-filter"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Categories ({items.length})</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat} ({items.filter(item => item.category === cat).length})
                    </option>
                  ))}
                </select>
              </div>
              <div className="table-stats">
                Total: {filteredItems.length} items
              </div>
            </div>
          </div>

          <div className="menu-table-wrapper">
            {loading ? (
              <div className="loading-state">Loading menu items...</div>
            ) : filteredItems.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <MdRestaurantMenu />
                </div>
                <p>{selectedCategory ? `No items in "${selectedCategory}" category` : 'No menu items yet. Add your first item above!'}</p>
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
                  {filteredItems.map(item => (
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
                            onClick={() => toggleItemStatus(item.id, item.is_active)} 
                            className={`btn-icon ${item.is_active ? 'btn-deactivate' : 'btn-activate'}`}
                            title={item.is_active ? 'Deactivate item' : 'Activate item'}
                          >
                            {item.is_active ? <FiCheckCircle /> : <FiXCircle />}
                          </button>
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

          {/* 🎯 Edit Form Modal (Centered Popup) */}
          {editingId && (
            <div className="modal-overlay" onClick={resetForm}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>
                    <FiEdit2 />
                    Edit Menu Item
                  </h3>
                  <button 
                    type="button" 
                    className="modal-close" 
                    onClick={resetForm}
                    title="Close"
                  >
                    ✕
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="menu-form">
                  {error && (
                    <div className="error-message">
                      <FiXCircle />
                      {error}
                    </div>
                  )}
                  
                  <div className="form-group">
                    <label htmlFor="edit-name">Item Name</label>
                    <input
                      id="edit-name"
                      type="text"
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                      placeholder="e.g., Paneer Butter Masala"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-category">Category *</label>
                    <input
                      id="edit-category"
                      type="text"
                      value={form.category}
                      onChange={e => setForm({...form, category: e.target.value})}
                      placeholder="e.g., Starter, Main Course, Beverage"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-price">Price (₹)</label>
                    <input
                      id="edit-price"
                      type="number"
                      step="0.01"
                      value={form.price}
                      onChange={e => setForm({...form, price: e.target.value})}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-description">Description</label>
                    <textarea
                      id="edit-description"
                      value={form.description}
                      onChange={e => setForm({...form, description: e.target.value})}
                      placeholder="Brief description of the item"
                      rows="3"
                    />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                      <FiEdit2 /> Update Item
                    </button>
                    <button type="button" onClick={resetForm} className="btn btn-secondary">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
