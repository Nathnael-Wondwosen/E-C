import { delay } from './core';

export const getOrders = async () => {
  await delay(500);
  return [
    { id: 1001, customer: 'ABC Corp', total: 1249.99, status: 'Processing', date: '2025-12-09' },
    { id: 1002, customer: 'XYZ Ltd', total: 875.50, status: 'Shipped', date: '2025-12-08' },
    { id: 1003, customer: 'Global Traders', total: 2100.00, status: 'Delivered', date: '2025-12-07' }
  ];
};

export const getOrderById = async (id) => {
  await delay(300);
  const orders = await getOrders();
  return orders.find((order) => order.id === parseInt(id, 10));
};

export const updateOrderStatus = async (id, status) => {
  await delay(500);
  return {
    id: parseInt(id, 10),
    status
  };
};
