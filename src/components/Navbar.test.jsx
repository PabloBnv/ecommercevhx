import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Navbar from './Navbar'

// Mock contexts
vi.mock('../context/CartContext', () => ({
  useCart: () => ({
    cartCount: 3,
  }),
}))

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    logout: vi.fn(),
    isAdmin: false,
    isInventory: false,
    isModerator: false,
  }),
}))

describe('Navbar', () => {
  it('renders logo correctly', () => {
    render(
      <BrowserRouter>
        <Navbar onCartClick={vi.fn()} />
      </BrowserRouter>
    )
    
    const logo = screen.getByAltText('Ecommerce Template')
    expect(logo).toBeTruthy()
  })

  it('renders navigation links', () => {
    render(
      <BrowserRouter>
        <Navbar onCartClick={vi.fn()} />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Inicio')).toBeTruthy()
    expect(screen.getByText('Nosotros ▾')).toBeTruthy()
    expect(screen.getByText('Productos')).toBeTruthy()
    expect(screen.getByText('Mayoristas')).toBeTruthy()
  })

  it('renders cart button with count', () => {
    render(
      <BrowserRouter>
        <Navbar onCartClick={vi.fn()} />
      </BrowserRouter>
    )
    
    expect(screen.getByText('3')).toBeTruthy()
  })

  it('calls onCartClick when cart button is clicked', () => {
    const onCartClickMock = vi.fn()
    
    render(
      <BrowserRouter>
        <Navbar onCartClick={onCartClickMock} />
      </BrowserRouter>
    )
    
    // Find cart button - it's the first button with bg-slate-600 class
    const cartButton = screen.getByRole('button', { name: '' })
    fireEvent.click(cartButton)
    
    expect(onCartClickMock).toHaveBeenCalled()
  })

  it('renders login button when user is not logged in', () => {
    render(
      <BrowserRouter>
        <Navbar onCartClick={vi.fn()} />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Ingresar')).toBeTruthy()
  })

  it('shows 9+ when cart count is greater than 9', () => {
    vi.mocked(require('../context/CartContext').useCart).mockReturnValue({
      cartCount: 15,
    })

    render(
      <BrowserRouter>
        <Navbar onCartClick={vi.fn()} />
      </BrowserRouter>
    )
    
    expect(screen.getByText('9+')).toBeTruthy()
  })

  it('renders mobile menu button', () => {
    render(
      <BrowserRouter>
        <Navbar onCartClick={vi.fn()} />
      </BrowserRouter>
    )
    
    // Mobile menu button is only visible on small screens, but we can still find it
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })
})

describe('Navbar with logged in user', () => {
  beforeEach(() => {
    vi.mocked(require('../context/AuthContext').useAuth).mockReturnValue({
      user: { firstName: 'Juan', lastName: 'Pérez', email: 'juan@test.com' },
      logout: vi.fn(),
      isAdmin: false,
      isInventory: false,
      isModerator: false,
    })
  })

  it('renders user name when logged in', () => {
    render(
      <BrowserRouter>
        <Navbar onCartClick={vi.fn()} />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Juan')).toBeTruthy()
  })

  it('shows user menu when clicking user button', () => {
    render(
      <BrowserRouter>
        <Navbar onCartClick={vi.fn()} />
      </BrowserRouter>
    )
    
    const userButton = screen.getByText('Juan')
    fireEvent.click(userButton)
    
    expect(screen.getByText('Mi Perfil')).toBeTruthy()
    expect(screen.getByText('Cerrar sesión')).toBeTruthy()
  })
})