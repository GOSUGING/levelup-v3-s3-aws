// Importaciones necesarias para testear React
import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
vi.mock('../api/products', () => ({
  getProducts: vi.fn().mockResolvedValue([
    { id: 1, name: 'Catán', description: 'Juego', price: 29990, img: '/x.png', category: 'juegos' },
    { id: 2, name: 'Mouse', description: 'Accesorio', price: 9990, img: '/y.png', category: 'accesorios' },
  ]),
}))
import { CartContext } from '../context/CartContext.jsx'
import { AuthContext } from '../context/AuthContext.jsx'
import ProductsPages from '../pages/ProductsPages.jsx'

describe('Pruebas de ProductsPages', () => {
  it('Renderiza el título principal de la tienda', () => {
    render(
      <MemoryRouter>
        <CartContext.Provider value={{ addToCart: () => {}, cartItems: [] }}>
          <ProductsPages />
        </CartContext.Provider>
      </MemoryRouter>
    )

    expect(screen.getByText(/Tienda Level-Up!/i)).toBeInTheDocument()
  })

  it('Muestra al menos un producto en pantalla', async () => {
    render(
      <MemoryRouter>
        <CartContext.Provider value={{ addToCart: () => {}, cartItems: [] }}>
          <ProductsPages />
        </CartContext.Provider>
      </MemoryRouter>
    )

    const producto = await screen.findByText(/Catán/i)
    expect(producto).toBeInTheDocument()
  })

  it('Llama a addToCart al presionar "Agregar al Carrito"', async () => {
    const addSpy = vi.fn()

    render(
      <MemoryRouter>
        <CartContext.Provider value={{ addToCart: addSpy, cartItems: [] }}>
          <ProductsPages />
        </CartContext.Provider>
      </MemoryRouter>
    )

    const addBtns = await screen.findAllByRole('button', { name: /Agregar al Carrito/i })
    await userEvent.click(addBtns[0])

    expect(addSpy).toHaveBeenCalledTimes(1)
  })

  it('No permite agregar más que el stock disponible desde los cards', async () => {
    vi.resetModules()
    vi.doMock('../api/products', () => ({
      getProducts: vi.fn().mockResolvedValue([
        { id: 'sd1', name: 'Steam Deck', description: 'Consola portátil', price: 399990, img: '/sd.png', category: 'consolas', stock: 1 },
      ]),
    }))
    const { default: ProductsPageLocal } = await import('../pages/ProductsPages.jsx')
    const { CartProvider } = await import('../context/CartContext.jsx')

    render(
      <MemoryRouter>
        <CartProvider>
          <ProductsPageLocal />
        </CartProvider>
      </MemoryRouter>
    )

    const btn = await screen.findByRole('button', { name: /Agregar al Carrito/i })
    await userEvent.click(btn)
    await screen.findByText(/Steam Deck/i)
    await userEvent.click(btn)
    expect(btn).toBeDisabled()
  })

  it('Con usuario autenticado, bloquea agregar más que el stock', async () => {
    vi.resetModules()
    window.localStorage.removeItem('levelup:cart')
    vi.doMock('../api/products', () => ({
      getProducts: vi.fn().mockResolvedValue([
        { id: 'sd1', name: 'Steam Deck', description: 'Consola portátil', price: 399990, img: '/sd.png', category: 'consolas', stock: 1 },
      ]),
    }))
    const { default: ProductsPageLocal } = await import('../pages/ProductsPages.jsx')
    const { CartProvider } = await import('../context/CartContext.jsx')

    vi.spyOn(global, 'fetch').mockImplementation(async (_url, opts = {}) => {
      const method = opts?.method || 'GET'
      if (method === 'GET') {
        return { ok: true, json: async () => ({ items: [] }) }
      }
      if (method === 'POST') {
        return {
          ok: true,
          json: async () => ({ items: [{ id: 'ci1', productId: 'sd1', name: 'Steam Deck', price: 399990, qty: 1, imageUrl: '/sd.png' }] })
        }
      }
      return { ok: true, json: async () => ({ items: [] }) }
    })

    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ user: { id: 'u1', email: 'u@u.com' } }}>
          <CartProvider>
            <ProductsPageLocal />
          </CartProvider>
        </AuthContext.Provider>
      </MemoryRouter>
    )

    const btn = await screen.findByRole('button', { name: /Agregar al Carrito/i })
    await userEvent.click(btn)
    await screen.findByText(/Steam Deck/i)
    expect(btn).toBeDisabled()
  })
})
