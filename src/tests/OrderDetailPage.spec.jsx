import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { vi } from 'vitest'
import OrderDetailPage from '../pages/OrderDetailPage.jsx'

vi.mock('../api/payment', () => ({
  getPayment: vi.fn().mockResolvedValue({
    id: 'o-100',
    fecha: '2024-01-01',
    direccionEnvio: 'Calle 123',
    estado: 'APROBADO',
    rawPayload: JSON.stringify([{ productId: 1, cantidad: 2, price: 29990 }])
  })
}))

function renderWithRoute() {
  return render(
    <MemoryRouter initialEntries={["/perfil/pedidos/o-100"]}>
      <Routes>
        <Route path="/perfil/pedidos/:id" element={<OrderDetailPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('OrderDetailPage', () => {
  it('muestra encabezado del pedido y tabla de productos', async () => {
    renderWithRoute()
    expect(await screen.findByText(/Pedido #o-100/i)).toBeInTheDocument()
    expect(screen.getByText(/Productos/i)).toBeInTheDocument()
  })

  it('muestra datos de líneas de productos con totales', async () => {
    renderWithRoute()
    expect(await screen.findByText(/Pedido #o-100/i)).toBeInTheDocument()
    expect(screen.getAllByText((t) => /29\.990/.test(t)).length).toBeGreaterThan(0)
    expect(screen.getAllByText((t) => /59\.980/.test(t)).length).toBeGreaterThan(0)
  })
})
