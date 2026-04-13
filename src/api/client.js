export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://fintech-api-y5hn.onrender.com/api';
const API_TOKEN = import.meta.env.VITE_API_TOKEN;

const buildUrl = (path, query = {}) => {
  const url = new URL(`${API_BASE_URL}${path}`);

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
};

const parseErrorMessage = async (response, fallbackMessage) => {
  try {
    const payload = await response.json();
    return payload.detail || payload.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
};

const requestJson = async ({ path, method = 'GET', query, body, fallbackError }) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (API_TOKEN) {
    headers['x-api-token'] = API_TOKEN;
  }

  // Inject current user token into headers for backend authorization
  const userJson = localStorage.getItem('finpay.currentUser');
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      if (user && user.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }
    } catch (e) {
      console.warn('Failed to parse currentUser for auth headers', e);
    }
  }

  const response = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response, fallbackError);
    throw new Error(message);
  }

  return response.json();
};

export const getBalance = () =>
  requestJson({
    path: '/balance',
    fallbackError: 'Failed to fetch balance',
  });

export const getTransactions = (filters = {}) =>
  requestJson({
    path: '/transactions',
    query: {
      tx_type: filters.txType,
      search: filters.search,
      limit: filters.limit,
    },
    fallbackError: 'Failed to fetch transactions',
  });

export const createTransaction = ({ type, counterpartyName, amount, date, time }) =>
  requestJson({
    path: '/transactions',
    method: 'POST',
    body: {
      type,
      counterpartyName,
      amount: Number(amount),
      date,
      time,
    },
    fallbackError: 'Failed to create transaction',
  });

export const createTransfer = ({ recipientName, amount }) =>
  requestJson({
    path: '/transfer',
    method: 'POST',
    body: {
      recipientName,
      amount: Number(amount),
    },
    fallbackError: 'Transfer failed',
  });

export const createTopUp = ({ source, accountNumber, amount }) =>
  requestJson({
    path: '/topup',
    method: 'POST',
    body: {
      source,
      accountNumber,
      amount: Number(amount),
    },
    fallbackError: 'Top up failed',
  });

export const resetSeedData = () =>
  requestJson({
    path: '/seed/reset',
    method: 'POST',
    fallbackError: 'Failed to reset seed data',
  });

export const getStatement = async () => {
  const userJson = localStorage.getItem('finpay.currentUser');
  if (!userJson) return;
  const user = JSON.parse(userJson);
  const response = await fetch(`${API_BASE_URL}/transactions/statement`, {
    headers: { 'Authorization': `Bearer ${user.token}` }
  });
  if (!response.ok) throw new Error('Failed to download statement');
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `FinPay_Statement_${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
};

// Backward-compatible API object for existing callers.
export const api = {
  getBalance,
  getTransactions,
  getStatement,
  createTransaction,
  createTransfer,
  createTopUp,
  resetSeedData,
  transfer: (recipientName, amount) => createTransfer({ recipientName, amount }),
};
