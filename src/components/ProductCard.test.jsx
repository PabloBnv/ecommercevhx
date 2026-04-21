import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ProductCard from './ProductCard'

const mockProduct = {
  id: 1,
  name: 'Quinoa Organica',
  price: 1500,
  unit: 'kg',
  category: { name: 'Orgánicos' },
  imageUrl: 'https://example.com/quinoa.jpg',
}

describe('ProductCard', () => {
  it('renders product name correctly', () => {
    render(
      <BrowserRouter>
        <ProductCard product={mockProduct} />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Quinoa Organica')).toBeTruthy()
  })

  it('renders product price correctly', () => {
    render(
      <BrowserRouter>
        <ProductCard product={mockProduct} />
      </BrowserRouter>
    )
    
    expect(screen.getByText('$1.500')).toBeTruthy()
  })

  it('renders product unit correctly', () => {
    render(
      <BrowserRouter>
        <ProductCard product={mockProduct} />
      </BrowserRouter>
    )
    
    expect(screen.getByText(/x kg/)).toBeTruthy()
  })

  it('renders category badge', () => {
    render(
      <BrowserRouter>
        <ProductCard product={mockProduct} />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Orgánicos')).toBeTruthy()
  })

  it('renders add to cart button', () => {
    render(
      <BrowserRouter>
        <ProductCard product={mockProduct} />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Agregar')).toBeTruthy()
  })

  it('renders product image when imageUrl exists', () => {
    render(
      <BrowserRouter>
        <ProductCard product={mockProduct} />
      </BrowserRouter>
    )
    
    const img = screen.getByAltText('Quinoa Organica')
    expect(img).toBeTruthy()
    expect(img.src).toBe('https://example.com/quinoa.jpg')
  })

  it('renders placeholder when no imageUrl', () => {
    const productWithoutImage = { ...mockProduct, imageUrl: null }
    
    render(
      <BrowserRouter>
        <ProductCard product={productWithoutImage} />
      </BrowserRouter>
    )
    
    expect(screen.getByText('📦')).toBeTruthy()
  })

  it('link points to correct product page', () => {
    render(
      <BrowserRouter>
        <ProductCard product={mockProduct} />
      </BrowserRouter>
    )
    
    const links = screen.getAllByRole('link')
    const productLink = links.find(link => link.getAttribute('href') === '/product/1')
    expect(productLink).toBeTruthy()
  })
})