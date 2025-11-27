import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import InventoryManagementPages from '../pages/InventoryManagementPages.jsx'

vi.mock('../api/products', async () => {
  const actual = await vi.importActual('../api/products')
  return {
    ...actual,
    getProducts: vi.fn().mockResolvedValue([]),
  }
})

describe('InventoryManagementPages', () => {
  it('muestra encabezado y tabla vacía', async () => {
    render(
      <MemoryRouter>
        <InventoryManagementPages />
      </MemoryRouter>
    )

    expect(screen.getByText(/Gestión de Inventario/i)).toBeInTheDocument()
    expect(await screen.findByText(/Sin productos/i)).toBeInTheDocument()
  })

  it('botón Aplicar cambios está deshabilitado sin cambios', async () => {
    render(
      <MemoryRouter>
        <InventoryManagementPages />
      </MemoryRouter>
    )
    const applyBtn = await screen.findByRole('button', { name: /Aplicar cambios/i })
    expect(applyBtn).toBeDisabled()
    expect(screen.getByRole('button', { name: /Volver al menú principal/i })).toBeInTheDocument()
  })
})
