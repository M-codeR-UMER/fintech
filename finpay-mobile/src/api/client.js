import axios from 'axios';

// IMPORTANT: Replace this with your computer's local IP address (e.g., 192.168.1.5)
// so your physical phone can connect to the backend while testing.
// Run 'ipconfig' in your terminal to find your IPv4 Address.
// PRODUCTION API URL
export const API_BASE_URL = 'https://fintech-api-y5hn.onrender.com/api';

export const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthUser = (token) => {
  if (token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete client.defaults.headers.common['Authorization'];
  }
};

export const getBalance = async () => {
  try {
    const response = await client.get('/balance');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch balance:', error);
    return { balance: 0 };
  }
};

export const getTransactions = async (filters = {}) => {
  try {
    const response = await client.get('/transactions', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    return [];
  }
};

export const createTransfer = async ({ recipientName, amount }) => {
  try {
    const response = await client.post('/transfer', { recipientName, amount: Number(amount) });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Transfer failed';
  }
};

export const createTopUp = async ({ source, accountNumber, amount }) => {
  try {
    const response = await client.post('/topup', { source, accountNumber, amount: Number(amount) });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Top up failed';
  }
};

export default {
  getBalance,
  getTransactions,
  createTransfer,
  createTopUp,
};
