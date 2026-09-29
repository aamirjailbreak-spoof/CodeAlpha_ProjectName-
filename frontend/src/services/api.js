/**
 * Centralized API client service.
 * Handles relative /api requests routed through Vite proxy,
 * automatic JWT Authorization header injection, JSON parsing,
 * and standardized error handling.
 */

const rawApiUrl = (import.meta.env.VITE_API_URL || '/api').trim();
const sanitizedUrl = rawApiUrl.replace(/\/+$/, '');
const API_BASE_URL = (sanitizedUrl.startsWith('http://') || sanitizedUrl.startsWith('https://')) && !sanitizedUrl.endsWith('/api')
  ? `${sanitizedUrl}/api`
  : sanitizedUrl;

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request(endpoint, options = {}) {
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${formattedEndpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = localStorage.getItem('authToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  let res;
  try {
    res = await fetch(url, config);
  } catch (err) {
    console.error(`[API Error] Request failed to ${url}:`, err);
    throw new ApiError('Unable to connect to the server. Please ensure the backend is running.', 0);
  }

  let data = null;
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const message = (data && (data.message || data.error)) || `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status, data);
  }

  return data;
}

export const api = {
  // System Health
  getHealth: () => request('/health'),
  getDbTest: () => request('/db-test'),

  // Authentication
  auth: {
    register: (credentials) => request('/auth/register', { method: 'POST', body: credentials }),
    login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
    getMe: () => request('/users/me')
  },

  // Categories
  categories: {
    getAll: () => request('/categories'),
    getById: (id) => request(`/categories/${id}`)
  },

  // Products
  products: {
    getAll: (params = {}) => {
      const searchParams = new URLSearchParams();
      if (params.category_id) searchParams.append('category_id', params.category_id);
      if (params.search) searchParams.append('search', params.search);
      if (params.page) searchParams.append('page', params.page);
      if (params.limit) searchParams.append('limit', params.limit);

      const qs = searchParams.toString();
      return request(`/products${qs ? `?${qs}` : ''}`);
    },
    getById: (id) => request(`/products/${id}`)
  },

  // Cart
  cart: {
    get: () => request('/cart'),
    addItem: (productId, quantity = 1) =>
      request('/cart/items', { method: 'POST', body: { product_id: productId, quantity } }),
    updateItem: (itemId, quantity) =>
      request(`/cart/items/${itemId}`, { method: 'PUT', body: { quantity } }),
    removeItem: (itemId) =>
      request(`/cart/items/${itemId}`, { method: 'DELETE' })
  },

  // Orders & Checkout
  orders: {
    create: (checkoutData = {}) => request('/orders', { method: 'POST', body: checkoutData }),
    getAll: () => request('/orders'),
    getById: (id) => request(`/orders/${id}`)
  }
};

export default api;
