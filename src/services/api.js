import { products, users, orders, tickets, categories, currentUser } from '../data/mockData';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class ApiService {
  getToken() {
    return localStorage.getItem('token');
  }

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem('token', 'mock-token-' + user.id);
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  async request(endpoint, options = {}) {
    await delay(300);
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body) : null;

    if (endpoint === '/api/auth/login') {
      return this.mockLogin(body.email, body.password);
    }
    if (endpoint === '/api/auth/register') {
      return this.mockRegister(body);
    }
    if (endpoint === '/api/auth/me') {
      return this.mockGetProfile();
    }
    if (endpoint === '/api/auth/profile') {
      return this.mockUpdateProfile(body);
    }
    if (endpoint === '/api/auth/change-password') {
      return { success: true };
    }
    if (endpoint === '/api/products') {
      return products;
    }
    if (endpoint.startsWith('/api/products/') && !endpoint.includes('category') && !endpoint.includes('search')) {
      const id = parseInt(endpoint.split('/').pop());
      return products.find((p) => p.id === id);
    }
    if (endpoint.includes('/category/')) {
      const category = endpoint.split('/category/').pop();
      return products.filter((p) => p.category === category);
    }
    if (endpoint.includes('search=')) {
      const query = decodeURIComponent(endpoint.split('q=')[1]).toLowerCase();
      return products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }
    if (endpoint === '/api/orders' && method === 'POST') {
      return this.mockCreateOrder(body);
    }
    if (endpoint === '/api/orders') {
      return this.mockGetMyOrders();
    }
    if (endpoint === '/api/orders/all') {
      return orders;
    }
    if (endpoint.startsWith('/api/orders/') && endpoint.includes('/status') && method === 'PUT') {
      return { success: true };
    }
    if (endpoint.startsWith('/api/orders/') && endpoint.includes('/payment') && method === 'PUT') {
      return { success: true };
    }
    if (endpoint === '/api/support/ticket' && method === 'POST') {
      return this.mockCreateTicket(body);
    }
    if (endpoint === '/api/support/tickets') {
      return this.mockGetTickets();
    }
    if (endpoint.startsWith('/api/support/tickets/')) {
      const id = parseInt(endpoint.split('/').pop());
      return tickets.find((t) => t.id === id);
    }
    if (endpoint === '/api/support/tickets' && method === 'PUT') {
      return { success: true };
    }
    if (endpoint === '/api/support/tickets/stats') {
      return { open: 1, closed: 1 };
    }
    if (endpoint === '/api/support/escalate' && method === 'POST') {
      return { success: true };
    }
    if (endpoint === '/api/admin/products') {
      return products;
    }
    if (endpoint === '/api/admin/products' && method === 'POST') {
      return { id: products.length + 1, ...body };
    }
    if (endpoint.startsWith('/api/admin/products/') && method === 'PUT') {
      return { id: parseInt(endpoint.split('/').pop()), ...body };
    }
    if (endpoint.startsWith('/api/admin/products/') && method === 'DELETE') {
      return { success: true };
    }
    if (endpoint === '/api/admin/products/categories') {
      return categories.map((c) => ({ name: c }));
    }
    if (endpoint === '/api/admin/products/categories' && method === 'POST') {
      return { name: body.name };
    }
    if (endpoint === '/api/admin/users') {
      return users.map((u) => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        status: u.status || 'ACTIVE',
        enabled: u.status !== 'SUSPENDED' && u.status !== 'BANNED',
      }));
    }
    if (endpoint.startsWith('/api/admin/users/') && endpoint.includes('/role') && method === 'PUT') {
      const userId = parseInt(endpoint.split('/')[4]);
      const user = users.find((u) => u.id === userId);
      if (user && body?.role) {
        user.role = body.role;
      }
      return { success: true };
    }
    if (endpoint.startsWith('/api/admin/users/') && endpoint.includes('/status') && method === 'PUT') {
      const userId = parseInt(endpoint.split('/')[4]);
      const user = users.find((u) => u.id === userId);
      if (user) {
        user.status = body?.enabled ? 'ACTIVE' : 'SUSPENDED';
      }
      return { success: true };
    }
    if (endpoint === '/api/admin/users' && method === 'POST') {
      const newUser = {
        id: users.length + 1,
        email: body.email,
        password: body.password || 'password123',
        firstName: body.firstName,
        lastName: body.lastName,
        role: body.role || 'CUSTOMER',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        lastLogin: null,
      };
      users.push(newUser);
      return { id: newUser.id, email: newUser.email };
    }
    if (endpoint.startsWith('/api/admin/users/') && method === 'DELETE') {
      const userId = parseInt(endpoint.split('/')[4]);
      const idx = users.findIndex((u) => u.id === userId);
      if (idx >= 0) {
        users.splice(idx, 1);
      }
      return { success: true };
    }
    if (endpoint.startsWith('/api/admin/users/') && endpoint.includes('/role') && method === 'PUT') {
      return { success: true };
    }
    if (endpoint.startsWith('/api/admin/users/') && endpoint.includes('/status') && method === 'PUT') {
      return { success: true };
    }
    if (endpoint === '/api/moderator/users') {
      return users.filter((u) => u.role !== 'ADMIN');
    }

    throw new Error('Endpoint no implementado: ' + endpoint);
  }

  mockLogin(email, password) {
    const user = users.find(
      (u) => u.email === email && u.password === password
    );
    if (!user) {
      throw new Error('Credenciales inválidas');
    }
    const { password: _, ...userWithoutPassword } = user;
    this.setCurrentUser(userWithoutPassword);
    return { token: 'mock-token-' + user.id, user: userWithoutPassword };
  }

  mockRegister(data) {
    const existing = users.find((u) => u.email === data.email);
    if (existing) {
      throw new Error('El email ya está registrado');
    }
    const newUser = {
      id: users.length + 1,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'CUSTOMER',
    };
    this.setCurrentUser(newUser);
    return { token: 'mock-token-' + newUser.id, user: newUser };
  }

  mockGetProfile() {
    return this.getCurrentUser() || currentUser;
  }

  mockUpdateProfile(data) {
    const user = this.getCurrentUser();
    if (user) {
      const updated = { ...user, ...data };
      this.setCurrentUser(updated);
      return updated;
    }
    return currentUser;
  }

  mockCreateOrder(data) {
    const user = this.getCurrentUser() || { id: 2 };
    const newOrder = {
      id: orders.length + 1,
      userId: user.id,
      items: data.items,
      total: data.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: 'PENDING',
      paymentStatus: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    orders.push(newOrder);
    return newOrder;
  }

  mockGetMyOrders() {
    const user = this.getCurrentUser() || { id: 2 };
    return orders.filter((o) => o.userId === user.id);
  }

  mockCreateTicket(data) {
    const user = this.getCurrentUser() || { id: 2 };
    const newTicket = {
      id: tickets.length + 1,
      userId: user.id,
      subject: data.subject,
      message: data.message,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    };
    tickets.push(newTicket);
    return newTicket;
  }

  mockGetTickets() {
    const user = this.getCurrentUser() || { id: 2 };
    return tickets.filter((t) => t.userId === user.id);
  }

  auth = {
    login: (data) => this.request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    register: (data) => this.request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    getProfile: () => this.request('/api/auth/me'),
    updateProfile: (data) => this.request('/api/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
    changePassword: (data) => this.request('/api/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),
  };

  products = {
    getAll: () => this.request('/api/products'),
    getById: (id) => this.request(`/api/products/${id}`),
    getByCategory: (category) => this.request(`/api/products/category/${category}`),
    search: (query) => this.request(`/api/products/search?q=${encodeURIComponent(query)}`),
  };

  orders = {
    create: (data) => this.request('/api/orders', { method: 'POST', body: JSON.stringify(data) }),
    getMyOrders: () => this.request('/api/orders'),
    getAll: () => this.request('/api/orders/all'),
    updateStatus: (id, status) => this.request(`/api/orders/${id}/status?status=${status}`, { method: 'PUT' }),
    updatePayment: (id, status, paymentId) => this.request(`/api/orders/${id}/payment?status=${status}&paymentId=${paymentId}`, { method: 'PUT' }),
  };

  support = {
    createTicket: (data) => this.request('/api/support/ticket', { method: 'POST', body: JSON.stringify(data) }),
    getTickets: () => this.request('/api/support/tickets'),
    getTicket: (id) => this.request(`/api/support/tickets/${id}`),
    updateTicket: (id, data) => this.request(`/api/support/tickets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    getTicketStats: () => this.request('/api/support/tickets/stats'),
    escalate: (data) => this.request('/api/support/escalate', { method: 'POST', body: JSON.stringify(data) }),
  };

  admin = {
    getProducts: () => this.request('/api/admin/products'),
    createProduct: (data) => this.request('/api/admin/products', { method: 'POST', body: JSON.stringify(data) }),
    updateProduct: (id, data) => this.request(`/api/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteProduct: (id) => this.request(`/api/admin/products/${id}`, { method: 'DELETE' }),
    getCategories: () => this.request('/api/admin/products/categories'),
    createCategory: (data) => this.request('/api/admin/products/categories', { method: 'POST', body: JSON.stringify(data) }),
    getUsers: () => this.request('/api/admin/users'),
    updateUserRole: (userId, role) => this.request(`/api/admin/users/${userId}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
    updateUserStatus: (userId, enabled) => this.request(`/api/admin/users/${userId}/status`, { method: 'PUT', body: JSON.stringify({ enabled }) }),
  };

  moderator = {
    getUsers: () => this.request('/api/moderator/users'),
  };

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, data) {
    return this.request(endpoint, { method: 'POST', body: JSON.stringify(data) });
  }

  put(endpoint, data) {
    return this.request(endpoint, { method: 'PUT', body: JSON.stringify(data) });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiService();
export const API_URL = '';