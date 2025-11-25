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
import ProductsPages from '../pages/ProductsPages.jsx'

describe('Pruebas de ProductsPages', () => {
  it('Renderiza el título principal de la tienda', () => {
    render(
      <MemoryRouter>
        <CartContext.Provider value={{ addToCart: () => {} }}>
          <ProductsPages />
        </CartContext.Provider>
      </MemoryRouter>
    )

    expect(screen.getByText(/Tienda Level-Up!/i)).toBeInTheDocument()
  })

  it('Muestra al menos un producto en pantalla', async () => {
    render(
      <MemoryRouter>
        <CartContext.Provider value={{ addToCart: () => {} }}>
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
        <CartContext.Provider value={{ addToCart: addSpy }}>
          <ProductsPages />
        </CartContext.Provider>
      </MemoryRouter>
    )

    const addBtns = await screen.findAllByRole('button', { name: /Agregar al Carrito/i })
    await userEvent.click(addBtns[0])

    expect(addSpy).toHaveBeenCalledTimes(1)
  })
})
