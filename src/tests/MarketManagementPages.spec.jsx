import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import MarketManagementPages from '../pages/MarketManagementPages.jsx'

vi.mock('../api/payment', () => ({
  getPayments: vi.fn().mockResolvedValue([]),
}))

describe('MarketManagementPages', () => {
  it('muestra encabezado y lista vacía', async () => {
    render(
      <MemoryRouter>
        <MarketManagementPages />
      </MemoryRouter>
    )

    expect(screen.getByText(/Gestión de Ventas/i)).toBeInTheDocument()
    expect(await screen.findByText(/Sin registros/i)).toBeInTheDocument()
  })

  it('muestra resumen general con acumulado 0', async () => {
    render(
      <MemoryRouter>
        <MarketManagementPages />
      </MemoryRouter>
    )
    expect(await screen.findByText(/Resumen General/i)).toBeInTheDocument()
    expect(screen.getByText(/Acumulado/i)).toBeInTheDocument()
    expect(screen.getByText(/\$0/)).toBeInTheDocument()
  })
})
