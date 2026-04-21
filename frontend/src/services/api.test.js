import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from './api'

// Mock fetch globally
global.fetch = vi.fn()

describe('ApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('auth endpoints', () => {
    it('calls login endpoint correctly', async () => {
      const mockResponse = { token: 'test-token', user: { id: 1 } }
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await api.auth.login({ email: 'test@test.com', password: '123' })

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/login'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('calls register endpoint correctly', async () => {
      const mockResponse = { token: 'test-token', user: { id: 1 } }
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await api.auth.register({
        email: 'new@test.com',
        password: '123',
        firstName: 'Test',
        lastName: 'User',
      })

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/register'),
        expect.objectContaining({ method: 'POST' })
      )
      expect(result).toEqual(mockResponse)
    })

    it('calls getProfile endpoint correctly', async () => {
      localStorage.setItem('token', 'test-token')
      
      const mockResponse = { id: 1, email: 'test@test.com' }
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await api.auth.getProfile()

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/me'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('products endpoints', () => {
    it('calls getAll products endpoint', async () => {
      const mockProducts = [{ id: 1, name: 'Product 1' }]
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProducts),
      })

      const result = await api.products.getAll()

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/products'),
        expect.any(Object)
      )
      expect(result).toEqual(mockProducts)
    })

    it('calls getById endpoint with correct id', async () => {
      const mockProduct = { id: 1, name: 'Product 1' }
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProduct),
      })

      await api.products.getById(1)

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/products/1'),
        expect.any(Object)
      )
    })

    it('calls getByCategory endpoint correctly', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })

      await api.products.getByCategory('Organicos')

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/products/category/Organicos'),
        expect.any(Object)
      )
    })

    it('calls search endpoint with encoded query', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })

      await api.products.search('quinoa organica')

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/products/search?q=quinoa%20organica'),
        expect.any(Object)
      )
    })
  })

  describe('orders endpoints', () => {
    it('calls create order endpoint', async () => {
      localStorage.setItem('token', 'test-token')
      
      const mockOrder = { id: 1, status: 'PENDING' }
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockOrder),
      })

      const result = await api.orders.create({ items: [] })

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/orders'),
        expect.objectContaining({ method: 'POST' })
      )
      expect(result).toEqual(mockOrder)
    })

    it('calls getMyOrders endpoint with auth', async () => {
      localStorage.setItem('token', 'test-token')
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })

      await api.orders.getMyOrders()

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/orders'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      )
    })

    it('calls updateStatus endpoint correctly', async () => {
      localStorage.setItem('token', 'test-token')
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      })

      await api.orders.updateStatus(1, 'SHIPPED')

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/orders/1/status?status=SHIPPED'),
        expect.objectContaining({ method: 'PUT' })
      )
    })
  })

  describe('admin endpoints', () => {
    it('calls admin getProducts endpoint', async () => {
      localStorage.setItem('token', 'admin-token')
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })

      await api.admin.getProducts()

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/products'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer admin-token',
          }),
        })
      )
    })

    it('calls createProduct endpoint', async () => {
      localStorage.setItem('token', 'admin-token')
      
      const mockProduct = { id: 1, name: 'New Product' }
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProduct),
      })

      const result = await api.admin.createProduct({ name: 'New Product' })

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/products'),
        expect.objectContaining({ method: 'POST' })
      )
      expect(result).toEqual(mockProduct)
    })

    it('calls deleteProduct endpoint', async () => {
      localStorage.setItem('token', 'admin-token')
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      })

      await api.admin.deleteProduct(1)

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/products/1'),
        expect.objectContaining({ method: 'DELETE' })
      )
    })
  })

  describe('error handling', () => {
    it('throws error when response is not ok', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Not found' }),
      })

      await expect(api.products.getById(999)).rejects.toThrow('Not found')
    })

    it('throws default error when response has no message', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({}),
      })

      await expect(api.products.getAll()).rejects.toThrow('Error en la solicitud')
    })
  })
})