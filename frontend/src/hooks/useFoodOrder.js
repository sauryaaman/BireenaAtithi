import { useState } from 'react';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

export const useFoodOrder = () => {
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getOrCreateOrder = async (bookingId) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${BASE_URL}/api/food-orders/order`,
        { booking_id: bookingId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrder(response.data.order);
      return response.data.order;
    } catch (err) {
      setError(err.response?.data?.message || 'Error getting/creating order');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const addItems = async (orderId, menuItemId, quantity) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${BASE_URL}/api/food-orders/order/items`,
        { order_id: orderId, menu_item_id: menuItemId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding items');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (orderId, itemId) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${BASE_URL}/api/food-orders/order/${orderId}/item/${itemId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting item');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${BASE_URL}/api/food-orders/order/${orderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrder(null);
      setItems([]);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Error cancelling order');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getOrder = async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${BASE_URL}/api/food-orders/order/${orderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrder(response.data.order);
      setItems(response.data.items);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching order');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    order,
    items,
    loading,
    error,
    getOrCreateOrder,
    addItems,
    deleteItem,
    cancelOrder,
    getOrder
  };
};
