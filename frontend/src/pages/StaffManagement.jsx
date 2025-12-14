import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './StaffManagement.css';

const BASE_URL = import.meta.env.VITE_API_URL;

const emptyForm = { full_name: '', phone: '', password: '', confirm_password: '', is_active: true };

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState('view'); // 'view' | 'add'
  const [selectedForPerm, setSelectedForPerm] = useState(null);
  const permissionKeys = [
    { key: 'Bookings', label: 'View Bookings' },
    { key: 'Add Bookings', label: 'Manage Bookings' }, 
    { key: 'Customers', label: 'Manage Customers' },
    { key: 'Rooms', label: 'Manage Rooms' },
    { key: 'CashierReport', label: 'Manage Cashier Report' },
    { key: 'Users', label: 'Manage Users' },
    { key: 'FoodMenu', label: 'Manage Food Menu' },
    { key: 'FoodPaymentReport', label: 'View Food Payment Report' },
  ];
  const [search, setSearch] = useState('');

  useEffect(() => { fetchStaff(); }, []);

  const authHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/staff`, authHeaders());
      setStaff(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Unable to load staff list');
    } finally { setLoading(false); }
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newVal = type === 'checkbox' ? checked : value;
    setForm(prev => ({ ...prev, [name]: newVal }));
    // clear/validate field when user types
    setErrors(prev => ({ ...prev, [name]: '' }));
    validateField(name, newVal);
  };

  const validateField = (name, value) => {
    // simple per-field validation and set/remove error
    const e = {};
    if (name === 'full_name') {
      if (!value || !String(value).trim()) e.full_name = 'Full name is required';
    }
    if (name === 'phone') {
      const digits = (value || '').toString().replace(/\D/g, '');
      if (!digits) e.phone = 'Phone is required';
      else if (digits.length !== 10) e.phone = 'Phone must be 10 digits';
    }
    if (name === 'password') {
      if (activeTab === 'add') {
        if (!value) e.password = 'Password is required';
        else if (value.length <= 6) e.password = 'Password must be more than 6 characters';
      } else {
        if (value && value.length <= 6) e.password = 'Password must be more than 6 characters';
      }
      // also validate confirm if present
      if (form.confirm_password && value !== form.confirm_password) e.confirm_password = 'Passwords do not match';
    }
    if (name === 'confirm_password') {
      if (form.password && value !== form.password) e.confirm_password = 'Passwords do not match';
    }

    setErrors(prev => ({ ...prev, ...e }));
    return e;
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setEditingUser(null);
    setShowCreate(true);
    setErrors({});
  };

  const switchToView = () => {
    setActiveTab('view');
    setShowCreate(false);
    setForm(emptyForm);
    setEditingId(null);
    setEditingUser(null);
    setErrors({});
  };

  const validateCreate = () => {
    const e = {};
    const digits = (form.phone || '').replace(/\D/g, '');
    if (!digits) e.phone = 'Phone is required';
    else if (digits.length !== 10) e.phone = 'Phone must be 10 digits';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length <= 6) e.password = 'Password must be more than 6 characters';
    if (form.password !== form.confirm_password) e.confirm_password = 'Passwords do not match';
    return e;
  };

  const validateEdit = () => {
    const e = {};
    if (form.password) {
      if (form.password.length <= 6) e.password = 'Password must be more than 6 characters';
      if (form.password !== form.confirm_password) e.confirm_password = 'New passwords do not match';
    }
    return e;
  };

  const createStaff = async (e) => {
    e?.preventDefault();
    const errs = validateCreate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      const payload = { full_name: form.full_name, phone: form.phone, password: form.password, is_active: !!form.is_active };
      await axios.post(`${BASE_URL}/api/staff`, payload, authHeaders());
      toast.success('Staff created successfully! 🎉');
      setForm(emptyForm);
      setActiveTab('view');
      setErrors({});
      fetchStaff();
    } catch (err) {
      console.error(err);
      // show server message if available
      const msg = err?.response?.data?.message || 'Create failed';
      
      // Check if it's a phone number duplicate error
      if (msg.includes('already registered') || msg.includes('already exists')) {
        toast.error(msg, { autoClose: 7000 });
        setErrors({ phone: msg, general: msg });
      } else {
        toast.error(msg);
        setErrors({ general: msg });
      }
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditingUser(item);
    setForm({ full_name: item.full_name || '', phone: item.phone || '', password: '', confirm_password: '', is_active: !!item.is_active });
    setErrors({});
  };

  const cancelEdit = () => { setEditingId(null); setEditingUser(null); setForm(emptyForm); };

  const saveEdit = async (e) => {
    e?.preventDefault();
    const errs = validateEdit();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      const payload = { full_name: form.full_name, phone: form.phone };
      if (form.password) payload.password = form.password;
      await axios.put(`${BASE_URL}/api/staff/${editingId}`, payload, authHeaders());
      toast.success('Staff updated');
      setErrors({});
      cancelEdit(); fetchStaff();
    } catch (err) {
      console.error(err);
      toast.error('Update failed');
    }
  };

  const deleteStaff = async (id) => {
    if (!window.confirm('Delete this staff?')) return;
    try { await axios.delete(`${BASE_URL}/api/staff/${id}`, authHeaders()); toast.success('Deleted'); fetchStaff(); }
    catch (err) { console.error(err); toast.error('Delete failed'); }
  };

  const toggleActive = async (item) => {
    try {
      await axios.put(`${BASE_URL}/api/staff/${item.id}/status`, { is_active: !item.is_active }, authHeaders());
      toast.success(item.is_active ? 'Deactivated' : 'Activated');
      fetchStaff();
    } catch (err) { console.error(err); toast.error('Status change failed'); }
  };

  const filtered = staff.filter(s => (s.full_name||'').toLowerCase().includes(search.toLowerCase()) || (s.phone||'').includes(search));

  const openPermissions = (item) => {
    setSelectedForPerm({ ...item, permissions: item.permissions || {} });
    setActiveTab('permissions');
  };

  const togglePermission = async (key) => {
    if (!selectedForPerm) return;
    const id = selectedForPerm.id;
    const current = selectedForPerm.permissions || {};
    const newPerms = { ...current };
    if (newPerms[key]) delete newPerms[key]; else newPerms[key] = true;

    // Optimistic UI
    setSelectedForPerm(prev => ({ ...prev, permissions: newPerms }));
    setStaff(prev => prev.map(s => s.id === id ? { ...s, permissions: newPerms } : s));

    try {
      await axios.put(`${BASE_URL}/api/staff/${id}/permissions`, { permissions: newPerms }, authHeaders());
      toast.success('Permissions updated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update permissions');
      // revert on error: refetch staff list
      fetchStaff();
    }
  };

  return (
    <div className="staff-page">
      <div className="staff-card">
        <div className="top-row">
          <div className="left-controls">
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'view' ? 'active' : ''}`}
                onClick={() => { switchToView(); }}
              >
                View Staff
              </button>
              <button
                className={`tab ${activeTab === 'add' ? 'active' : ''}`}
                onClick={() => { setActiveTab('add'); openCreate(); }}
              >
                Add Staff
              </button>
              <button
                className={`tab ${activeTab === 'permissions' ? 'active' : ''}`}
                onClick={() => { setActiveTab('permissions'); setSelectedForPerm(null); }}
              >
                Permissions
              </button>
            </div>
          </div>
          {activeTab === 'view' && (
            <div className="search-box">
              <input placeholder="Search name or phone" value={search} onChange={e=>setSearch(e.target.value)} />
            </div>
          )}
        </div>

        {/* Add form rendered below tabs so it appears under the same view area */}
        {activeTab === 'add' && (
          <div className="add-panel">
            <div className="add-panel-header">
              <h3>Add New Staff Member</h3>
              <p>Fill in the details below to create a new staff account</p>
            </div>
            {errors.general && (
              <div className="general-error-banner">
                ⚠️ {errors.general}
              </div>
            )}
            <form onSubmit={createStaff} className="inline-create full-width" autoComplete="off">
              <label>
                Full Name
                <input 
                  name="full_name" 
                  placeholder="Enter full name" 
                  value={form.full_name || ''} 
                  onChange={onChange} 
                  autoComplete="name" 
                />
                {errors.full_name && <div className="field-error">{errors.full_name}</div>}
              </label>

              <label>
                Phone Number
                <input 
                  name="phone" 
                  type="tel"
                  placeholder="Enter 10-digit phone number" 
                  value={form.phone || ''} 
                  onChange={onChange} 
                  autoComplete="tel"
                  maxLength="10"
                  pattern="[0-9]{10}"
                />
                {errors.phone && <div className="field-error">{errors.phone}</div>}
              </label>

              <label>
                Password
                <input 
                  type="password" 
                  name="password" 
                  placeholder="Enter password (min 6 characters)" 
                  value={form.password || ''} 
                  onChange={onChange} 
                  autoComplete="new-password" 
                />
                {errors.password && <div className="field-error">{errors.password}</div>}
              </label>

              <label>
                Confirm Password
                <input 
                  type="password" 
                  name="confirm_password" 
                  placeholder="Re-enter password" 
                  value={form.confirm_password || ''} 
                  onChange={onChange} 
                  autoComplete="new-password" 
                />
                {errors.confirm_password && <div className="field-error">{errors.confirm_password}</div>}
              </label>

              <div className="form-actions">
                <button type="submit" className="btn primary">
                  Save Staff Member
                </button>
                <button type="button" className="btn muted" onClick={() => { switchToView(); }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'view' && (loading ? <div className="loading">Loading...</div> : (
          <table className="staff-table">
            <thead>
              <tr>
                <th>Full name</th>
                <th>Phone</th>
                <th>Active</th>
                <th>Permissions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (<tr><td colSpan={5}>No staff found</td></tr>)}
              {filtered.map(item => {
                const perms = item.permissions || {};
                const activeKeys = Object.keys(perms).filter(k => !!perms[k]);
                return (
                <tr key={item.id} className={!item.is_active ? 'inactive' : ''}>
                  <td data-label="Full Name">{item.full_name}</td>
                  <td data-label="Phone">{item.phone}</td>
                  <td data-label="Active">{item.is_active ? 'Yes' : 'No'}</td>
                  <td data-label="Permissions">{activeKeys.length ? activeKeys.join(', ') : '-'} </td>
                  <td className="actions" data-label="Actions">
                    <button onClick={() => startEdit(item)} className="btn small">Edit</button>
                    <button onClick={() => deleteStaff(item.id)} className="btn small danger">Delete</button>
                    <button onClick={() => toggleActive(item)} className="btn small muted">{item.is_active ? 'Deactivate' : 'Activate'}</button>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        ))}

        {activeTab === 'permissions' && (
          <div className="permissions-container">
            {!selectedForPerm ? (
              loading ? (
                <div className="loading">Loading...</div>
              ) : (
                <div className="staff-list-section">
                  <div className="section-header">
                    <h3>Select Staff to Manage Permissions</h3>
                    <p className="subtitle">Click on a staff member to edit their permissions</p>
                  </div>
                  <table className="staff-table">
                    <thead>
                      <tr>
                        <th>Full name</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Current Permissions</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staff.length === 0 && (
                        <tr><td colSpan={5} className="text-center">No staff found</td></tr>
                      )}
                      {staff.map(item => {
                        const perms = item.permissions || {};
                        const activeKeys = Object.keys(perms).filter(k => !!perms[k]);
                        return (
                          <tr key={item.id}>
                            <td className="staff-name" data-label="Full Name">{item.full_name}</td>
                            <td data-label="Phone">{item.phone}</td>
                            <td data-label="Status">
                              <span className={`status-badge ${item.is_active ? 'status-active' : 'status-inactive'}`}>
                                {item.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td data-label="Current Permissions">
                              {activeKeys.length ? (
                                <div className="permission-badges">
                                  {activeKeys.map(key => (
                                    <span key={key} className="permission-badge">{key}</span>
                                  ))}
                                </div>
                              ) : (
                                <span className="no-permissions">No permissions</span>
                              )}
                            </td>
                            <td className="actions" data-label="Actions">
                              <button className="btn btn-primary small" onClick={() => openPermissions(item)}>
                                Edit Permissions
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              <div className="perm-panel">
                <div className="perm-header">
                  <div>
                    <h3>Manage Permissions</h3>
                    <p className="staff-info">
                      Staff: <strong>{selectedForPerm.full_name}</strong> | Phone: <strong>{selectedForPerm.phone}</strong>
                    </p>
                  </div>
                  <button className="btn btn-secondary" onClick={() => setSelectedForPerm(null)}>
                    Back to List
                  </button>
                </div>
                <div className="perm-list">
                  {permissionKeys.map(p => (
                    <label key={p.key} className="perm-item">
                      <input 
                        type="checkbox" 
                        checked={!!selectedForPerm.permissions?.[p.key]} 
                        onChange={() => togglePermission(p.key)} 
                      />
                      <span>{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {editingId && activeTab === 'view' && (
            <div className="edit-panel">
              <h3>Edit User</h3>
              <form onSubmit={saveEdit} className="edit-form">
                <div className="row"><label>Full name</label><input name="full_name" value={form.full_name} onChange={onChange} />{errors.full_name && <div className="field-error">{errors.full_name}</div>}</div>
                <div className="row"><label>Phone</label><input name="phone" value={form.phone} onChange={onChange} />{errors.phone && <div className="field-error">{errors.phone}</div>}</div>
                <div className="row"><label>New password</label><input type="password" name="password" value={form.password} onChange={onChange} />{errors.password && <div className="field-error">{errors.password}</div>}</div>
                <div className="row"><label>Confirm password</label><input type="password" name="confirm_password" value={form.confirm_password} onChange={onChange} />{errors.confirm_password && <div className="field-error">{errors.confirm_password}</div>}</div>
                <div className="edit-actions"><button className="btn primary" type="submit">Save</button><button className="btn muted" type="button" onClick={cancelEdit}>Cancel</button></div>
              </form>
            </div>
        )}
      </div>
    </div>
  );
}
