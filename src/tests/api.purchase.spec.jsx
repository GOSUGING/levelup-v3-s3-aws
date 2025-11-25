import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import PurchasePages from '../pages/PurchasePages.jsx'
import { AuthContext } from '../context/AuthContext.jsx'
import { CartContext } from '../context/CartContext.jsx'

describe('API Checkout (PurchasePages)', () => {
  it('envía payload correcto a /api/payments/checkout', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'ok-1' }) })
    const clearCart = vi.fn()
    const cartItems = [{ id: 1, productId: 1, name: 'Catán', price: 29990, qty: 2 }]

    render(
      <BrowserRouter>
        <AuthContext.Provider value={{ user: { id: 'u1' }, token: 'tk' }}>
          <CartContext.Provider value={{ cartItems, cartSubtotal: 59980, removeFromCart: vi.fn(), clearCart }}>
            <PurchasePages />
          </CartContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    )

    fireEvent.change(screen.getByLabelText(/Nombre en la tarjeta/i), { target: { value: 'B Arancibia' } })
    fireEvent.change(screen.getByLabelText(/Número de tarjeta/i), { target: { value: '1234567890123456' } })
    fireEvent.change(screen.getByLabelText(/Fecha de expiración/i), { target: { value: '12/25' } })
    fireEvent.change(screen.getByLabelText(/^CVV/i), { target: { value: '123' } })
    fireEvent.click(screen.getByRole('button', { name: /Pagar/i }))

    const call = fetchMock.mock.calls[0]
    expect(call[0]).toMatch(/\/api\/payments\/checkout$/)
    const body = JSON.parse(call[1].body)
    expect(body.userId).toBe('u1')
    expect(body.items[0]).toMatchObject({ productId: 1, nombre: 'Catán', cantidad: 2, price: 29990 })
    expect(await screen.findByText(/Compra OK/)).toBeInTheDocument()
    expect(clearCart).toHaveBeenCalled()
  })
})