import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { vi } from 'vitest'
import ProductDetailPage from '../pages/ProductDetailPage.jsx'
import { CartContext } from '../context/CartContext.jsx'

vi.mock('../api/products', () => ({
  getProduct: vi.fn().mockResolvedValue({ id: 1, name: 'Catán', description: 'Juego', price: 29990, img: '/assets/img/catan.png', features: ['Tablero modular'] })
}))

function renderWithRoute() {
  return render(
    <MemoryRouter initialEntries={["/productos/1"]}>
      <CartContext.Provider value={{ addToCart: vi.fn() }}>
        <Routes>
          <Route path="/productos/:id" element={<ProductDetailPage />} />
        </Routes>
      </CartContext.Provider>
    </MemoryRouter>
  )
}

describe('ProductDetailPage', () => {
  it('muestra nombre y botón Agregar al Carrito', async () => {
    renderWithRoute()
    expect(await screen.findByText(/Catán/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Agregar al Carrito/i })).toBeInTheDocument()
  })

  it('muestra características y badge de stock', async () => {
    renderWithRoute()
    expect(await screen.findByText(/Características/i)).toBeInTheDocument()
    expect(await screen.findByText(/Tablero modular/i)).toBeInTheDocument()
    expect(screen.getByText(/Stock:/i)).toBeInTheDocument()
  })
})
