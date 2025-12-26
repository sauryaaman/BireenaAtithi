const supabase = require('../config/db');

// Create a new menu item (food) for the current user's hotel
const createMenuItem = async (req, res) => {
  try {
    let user_id = req.user?.user_id;
    if (!user_id) return res.status(401).json({ message: 'Authentication required' });
    // If user_id is numeric string, convert to integer to match DB schema (some deployments use integer PKs)
    if (typeof user_id === 'string' && /^\d+$/.test(user_id)) user_id = parseInt(user_id, 10);

    const { name, description, price, category, is_active = true } = req.body;
    if (!name || price === undefined) return res.status(400).json({ message: 'name and price are required' });

    const { data, error } = await supabase
      .from('menu_items')
      .insert([{
        name,
        description: description || null,
        price,
        category: category || null,
        is_active,
        user_id
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('createMenuItem error:', err);
    res.status(500).json({ message: 'Failed to create menu item', error: err.message });
  }
};

// Get all menu items for the current user's hotel
const getMenuItems = async (req, res) => {
  try {
    let user_id = req.user?.user_id;
    if (!user_id) return res.status(401).json({ message: 'Authentication required' });
    if (typeof user_id === 'string' && /^\d+$/.test(user_id)) user_id = parseInt(user_id, 10);

    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getMenuItems error:', error);
      throw error;
    }
    
    res.json(data || []);
  } catch (err) {
    console.error('getMenuItems error:', err);
    res.status(500).json({ message: 'Failed to fetch menu items', error: err.message });
  }
};

// Get single menu item (ensure it belongs to user)
const getMenuItem = async (req, res) => {
  try {
    let user_id = req.user?.user_id;
    const { id } = req.params;
    if (!user_id) return res.status(401).json({ message: 'Authentication required' });
    if (typeof user_id === 'string' && /^\d+$/.test(user_id)) user_id = parseInt(user_id, 10);

    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('id', id)
      .eq('user_id', user_id)
      .single();

    if (error) return res.status(404).json({ message: 'Menu item not found' });
    res.json(data);
  } catch (err) {
    console.error('getMenuItem error:', err);
    res.status(500).json({ message: 'Failed to fetch menu item', error: err.message });
  }
};

// Update a menu item (only owner can update)
const updateMenuItem = async (req, res) => {
  try {
    let user_id = req.user?.user_id;
    const { id } = req.params;
    if (!user_id) return res.status(401).json({ message: 'Authentication required' });
    if (typeof user_id === 'string' && /^\d+$/.test(user_id)) user_id = parseInt(user_id, 10);

    const { name, description, price, category, is_active } = req.body;

    // Verify ownership
    const { data: existing, error: fetchErr } = await supabase
      .from('menu_items')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (fetchErr || !existing) return res.status(404).json({ message: 'Menu item not found' });
    if (String(existing.user_id) !== String(user_id)) return res.status(403).json({ message: 'Not authorized to update this item' });

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = price;
    if (category !== undefined) updates.category = category;
    if (is_active !== undefined) updates.is_active = is_active;

    const { data, error } = await supabase
      .from('menu_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('updateMenuItem error:', err);
    res.status(500).json({ message: 'Failed to update menu item', error: err.message });
  }
};

// Delete a menu item (soft-delete or hard delete — we will hard delete here)
const deleteMenuItem = async (req, res) => {
  try {
    let user_id = req.user?.user_id;
    const { id } = req.params;
    if (!user_id) return res.status(401).json({ message: 'Authentication required' });
    if (typeof user_id === 'string' && /^\d+$/.test(user_id)) user_id = parseInt(user_id, 10);

    // Verify ownership
    const { data: existing, error: fetchErr } = await supabase
      .from('menu_items')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (fetchErr || !existing) return res.status(404).json({ message: 'Menu item not found' });
    if (String(existing.user_id) !== String(user_id)) return res.status(403).json({ message: 'Not authorized to delete this item' });

    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('deleteMenuItem error:', err);
    res.status(500).json({ message: 'Failed to delete menu item', error: err.message });
  }
};

const toggleMenuItemStatus = async (req, res) => {
  try {
    let user_id = req.user?.user_id;
    const { id } = req.params;
    const { is_active } = req.body;

    if (!user_id) return res.status(401).json({ message: 'Authentication required' });
    if (typeof user_id === 'string' && /^\d+$/.test(user_id)) user_id = parseInt(user_id, 10);

    // Verify ownership
    const { data: existing, error: fetchErr } = await supabase
      .from('menu_items')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (fetchErr || !existing) return res.status(404).json({ message: 'Menu item not found' });
    if (String(existing.user_id) !== String(user_id)) return res.status(403).json({ message: 'Not authorized to update this item' });

    // Update status
    const { data, error } = await supabase
      .from('menu_items')
      .update({ is_active })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('toggleMenuItemStatus error:', err);
    res.status(500).json({ message: 'Failed to toggle menu item status', error: err.message });
  }
};

module.exports = {
  createMenuItem,
  getMenuItems,
  getMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemStatus,
};
