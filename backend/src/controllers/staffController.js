const supabase = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Get all staff (requires auth)
const getAllStaff = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ message: 'Authentication required' });

    const { data, error } = await supabase
        .from('staff_users')
        .select('id, full_name, phone, permissions, is_active, created_at, created_by')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (err) {
    console.error('getAllStaff error:', err);
    res.status(500).json({ message: 'Failed to fetch staff', error: err.message });
  }
};

// Create staff (admin creates staff) - requires auth
const createStaff = async (req, res) => {
  try {
    const { password, full_name, phone } = req.body;
    if (!password || !phone) {
      return res.status(400).json({ message: 'password and phone are required' });
    }

    // Validate phone number format (should be 10 digits)
    const phoneDigits = String(phone).replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
    }

    // Only a logged-in user (owner/admin) can create staff
    const creatorId = req.user?.user_id;
    if (!creatorId) return res.status(401).json({ message: 'Authentication required to create staff' });

    // Check if phone number already exists in staff_users table
    const { data: existingStaff, error: checkError } = await supabase
      .from('staff_users')
      .select('id, phone, full_name')
      .eq('phone', phoneDigits)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing staff:', checkError);
      return res.status(500).json({ message: 'Error validating phone number' });
    }

    if (existingStaff) {
      return res.status(400).json({ 
        message: `Phone number ${phone} is already registered with staff member: ${existingStaff.full_name || 'Unknown'}` 
      });
    }

    // Check if phone number exists in users table (hotel owners/admins)
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('user_id, phone, full_name')
      .eq('phone', phoneDigits)
      .maybeSingle();

    if (userCheckError) {
      console.error('Error checking existing user:', userCheckError);
    }

    if (existingUser) {
      return res.status(400).json({ 
        message: `Phone number ${phone} is already registered as a hotel owner/admin account` 
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const created_by = creatorId;

    const { data, error } = await supabase
      .from('staff_users')
      .insert([{ password: hash, full_name, phone: phoneDigits, permissions: {}, created_by }])
      .select()
      .single();

    if (error) {
      // Handle unique constraint violation
      if (error.code === '23505' || error.message.includes('duplicate') || error.message.includes('unique')) {
        return res.status(400).json({ message: 'Phone number already exists in the system' });
      }
      return res.status(400).json({ message: 'Unable to create staff', details: error.message });
    }

    res.status(201).json(data);
  } catch (err) {
    console.error('createStaff error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
// Update staff
const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { password, full_name, phone, is_active, permissions } = req.body;
    // Only the creator (user) who created this staff can update it
    const requesterUserId = req.user?.user_id;
    if (!requesterUserId) return res.status(403).json({ message: 'Only creator can update staff' });

    // Fetch existing staff to verify ownership
    const { data: existing, error: fetchErr } = await supabase
      .from('staff_users')
      .select('id, created_by')
      .eq('id', id)
      .single();

    if (fetchErr || !existing) return res.status(404).json({ message: 'Staff not found' });
    if (existing.created_by !== requesterUserId) return res.status(403).json({ message: 'Not authorized to update this staff' });

    const updates = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (phone !== undefined) updates.phone = phone;
    if (is_active !== undefined) updates.is_active = is_active;
    if (permissions !== undefined) updates.permissions = permissions;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }

    const { data, error } = await supabase
      .from('staff_users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(400).json({ message: 'Update failed', details: error.message });

    res.json(data);
  } catch (err) {
    console.error('updateStaff error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete staff
const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    // Only creator can delete
    const requesterUserId = req.user?.user_id;
    if (!requesterUserId) return res.status(403).json({ message: 'Only creator can delete staff' });

    const { data: existing, error: fetchErr } = await supabase.from('staff_users').select('id, created_by').eq('id', id).single();
    if (fetchErr || !existing) return res.status(404).json({ message: 'Staff not found' });
    if (existing.created_by !== requesterUserId) return res.status(403).json({ message: 'Not authorized to delete this staff' });

    const { error } = await supabase.from('staff_users').delete().eq('id', id);
    if (error) return res.status(400).json({ message: 'Delete failed', details: error.message });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('deleteStaff error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update only permissions for a staff member
const updatePermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;

    const requesterUserId = req.user?.user_id;
    if (!requesterUserId) return res.status(403).json({ message: 'Only creator can update permissions' });

    const { data: existing, error: fetchErr } = await supabase.from('staff_users').select('id, created_by').eq('id', id).single();
    if (fetchErr || !existing) return res.status(404).json({ message: 'Staff not found' });
    if (existing.created_by !== requesterUserId) return res.status(403).json({ message: 'Not authorized to change permissions for this staff' });

    const { data, error } = await supabase.from('staff_users').update({ permissions }).eq('id', id).select().single();
    if (error) return res.status(400).json({ message: 'Failed to update permissions', details: error.message });
    res.json(data);
  } catch (err) {
    console.error('updatePermissions error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update only is_active status for a staff member
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const requesterUserId = req.user?.user_id;
    if (!requesterUserId) return res.status(403).json({ message: 'Only creator can update status' });

    const { data: existing, error: fetchErr } = await supabase.from('staff_users').select('id, created_by').eq('id', id).single();
    if (fetchErr || !existing) return res.status(404).json({ message: 'Staff not found' });
    if (existing.created_by !== requesterUserId) return res.status(403).json({ message: 'Not authorized to change status for this staff' });

    const { data, error } = await supabase.from('staff_users').update({ is_active }).eq('id', id).select().single();
    if (error) return res.status(400).json({ message: 'Failed to update status', details: error.message });
    res.json(data);
  } catch (err) {
    console.error('updateStatus error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Staff login - by phone OR username + password. Only allow login if is_active === true
const staffLogin = async (req, res) => {
  try {
    let { phone, username, password, identifier } = req.body;
    if (!password) return res.status(400).json({ message: 'password is required' });

    identifier = identifier || phone || username;
    if (!identifier) return res.status(400).json({ message: 'phone or username is required' });

    // Normalize
    if (typeof phone === 'string') phone = phone.trim();
    if (typeof username === 'string') username = username.trim();
    const id = String(identifier).trim();

    // Lookup by phone only (username removed)
    let staff;
    let fetchErr;
    const lookup = phone || id;
    if (!lookup) return res.status(400).json({ message: 'phone is required' });
    const r = await supabase.from('staff_users').select('id, password, full_name, phone, permissions, is_active, created_by').eq('phone', String(lookup).trim()).single();
    staff = r.data; fetchErr = r.error;

    if (fetchErr || !staff) return res.status(400).json({ message: 'Invalid credentials' });
    if (!staff.is_active) return res.status(403).json({ message: 'Account is inactive' });

    const match = await bcrypt.compare(password, staff.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const payload = { staff_id: staff.id, created_by: staff.created_by };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, staff: { id: staff.id, full_name: staff.full_name, phone: staff.phone, permissions: staff.permissions } });
  } catch (err) {
    console.error('staffLogin error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get logged in staff profile (token should contain staff_id)
const getStaffProfile = async (req, res) => {
  try {
    const staff_id = req.user?.staff_id;
    if (!staff_id) return res.status(400).json({ message: 'Invalid token' });

    const { data: staff, error } = await supabase
        .from('staff_users')
        .select('id, full_name, phone, permissions, is_active, created_by, created_at')
      .eq('id', staff_id)
      .single();

    if (error || !staff) return res.status(404).json({ message: 'Staff not found' });
    res.json(staff);
  } catch (err) {
    console.error('getStaffProfile error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get staff profile with hotel details
const getStaffProfileWithHotel = async (req, res) => {
  try {
    const staff_id = req.user?.staff_id;
    if (!staff_id) return res.status(400).json({ message: 'Invalid token' });

    // Get staff details
    const { data: staff, error: staffError } = await supabase
      .from('staff_users')
      .select('id, full_name, phone, permissions, is_active, created_by, created_at')
      .eq('id', staff_id)
      .single();

    if (staffError || !staff) return res.status(404).json({ message: 'Staff not found' });

    // Get hotel owner details
    const { data: owner, error: ownerError } = await supabase
      .from('users')
      .select('user_id, hotel_name, name, email, owner_phone')
      .eq('user_id', staff.created_by)
      .single();

    if (ownerError) {
      console.error('Error fetching owner:', ownerError);
      return res.json({ ...staff, hotel: null });
    }

    // Get hotel details
    const { data: hotelDetails, error: hotelError } = await supabase
      .from('hotel_details')
      .select('hotel_name, hotel_logo_url, address_line1, city, state, country, pin_code, gst_number')
      .eq('user_id', staff.created_by)
      .single();

    if (hotelError && hotelError.code !== 'PGRST116') {
      console.error('Error fetching hotel details:', hotelError);
    }

    res.json({
      ...staff,
      hotel: {
        hotel_name: hotelDetails?.hotel_name || owner?.hotel_name || 'N/A',
        hotel_logo_url: hotelDetails?.hotel_logo_url || null,
        address_line1: hotelDetails?.address_line1 || null,
        city: hotelDetails?.city || null,
        state: hotelDetails?.state || null,
        country: hotelDetails?.country || null,
        pin_code: hotelDetails?.pin_code || null,
        gst_number: hotelDetails?.gst_number || null,
        owner_name: owner?.name || 'N/A',
        owner_email: owner?.email || null,
        owner_phone: owner?.owner_phone || null
      }
    });
  } catch (err) {
    console.error('getStaffProfileWithHotel error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getAllStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  staffLogin,
  getStaffProfile,
  getStaffProfileWithHotel,
  updatePermissions,
  updateStatus,
};
