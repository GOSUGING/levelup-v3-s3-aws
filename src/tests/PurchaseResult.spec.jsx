import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { vi } from 'vitest'
import PurchaseResult from '../pages/PurchaseResult.jsx'

function renderWithRoute(path = '/compra/abc') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/compra/:id" element={<PurchaseResult />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('PurchaseResult', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renderiza encabezado y estado de carga', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'abc', estado: 'APROBADO', total: 0, cantidad: 0, rawPayload: '[]' }) })
    renderWithRoute('/compra/abc')
    expect(screen.getByText(/Detalle de la Compra/i)).toBeInTheDocument()
    expect(screen.getByText(/Cargando detalle/i)).toBeInTheDocument()
    await screen.findByText(/ID de Pago:/i)
  })

  it('muestra datos de pago e items del payload', async () => {
    const payload = JSON.stringify([{ productId: 1, nombre: 'Catán', cantidad: 1, price: 29990 }])
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'p-001', estado: 'APROBADO', total: 29990, cantidad: 1, rawPayload: payload }) })
    renderWithRoute('/compra/p-001')
    expect(await screen.findByText(/ID de Pago:/i)).toBeInTheDocument()
    expect(screen.getByText(/APROBADO/i)).toBeInTheDocument()
    expect(screen.getAllByText((t) => /29\.990/.test(t)).length).toBeGreaterThan(0)
    expect(screen.getByText(/Catán/i)).toBeInTheDocument()
  })

  it('muestra error cuando la API responde con fallo', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })
    renderWithRoute('/compra/err')
    const alert = await screen.findByText(/Error al cargar el detalle de compra|No se pudo cargar el pago/i)
    expect(alert).toBeInTheDocument()
  })
})