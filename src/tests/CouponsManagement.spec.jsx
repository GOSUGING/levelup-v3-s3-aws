import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import CouponsManagement from '../pages/CouponsManagement.jsx'

vi.mock('../api/coupons', async () => {
  const actual = await vi.importActual('../api/coupons')
  return {
    ...actual,
    getCoupons: vi.fn().mockResolvedValue([]),
  }
})

describe('CouponsManagement', () => {
  it('muestra encabezado y lista vacía', async () => {
    render(
      <MemoryRouter>
        <CouponsManagement />
      </MemoryRouter>
    )

    expect(screen.getByText(/Administración de Cupones/i)).toBeInTheDocument()
    expect(await screen.findByText(/Sin cupones/i)).toBeInTheDocument()
  })

  it('activa modo edición y muestra botón Aplicar Cambios deshabilitado', async () => {
    render(
      <MemoryRouter>
        <CouponsManagement />
      </MemoryRouter>
    )
    const editBtn = screen.getByRole('button', { name: /Modificar Cupones/i })
    editBtn.click()
    const applyBtn = await screen.findByRole('button', { name: /Aplicar Cambios/i })
    expect(applyBtn).toBeDisabled()
  })
})
