import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import AdminPages from '../pages/AdminPages.jsx'
import { AuthContext } from '../context/AuthContext.jsx'

vi.mock('../api/products', () => ({
  getProducts: vi.fn().mockResolvedValue([]),
  getFeaturedConfig: vi.fn().mockResolvedValue({ title: 'Productos Más Vendidos 🔥', maxCount: 4, productIds: [] }),
  saveFeaturedConfig: vi.fn().mockResolvedValue({ message: 'OK' }),
}))

describe('AdminPages', () => {
  it('renderiza el panel y texto de bienvenida', () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ user: { role: 'ADMIN', name: 'Admin' }, logout: vi.fn() }}>
          <AdminPages />
        </AuthContext.Provider>
      </MemoryRouter>
    )

    expect(screen.getByText(/Panel de Administración/i)).toBeInTheDocument()
    expect(screen.getByText(/Bienvenido/i)).toBeInTheDocument()
  })

  it('muestra botones de gestión habilitados para ADMIN y abre modal de destacados', async () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ user: { role: 'ADMIN', name: 'Root' }, logout: vi.fn() }}>
          <AdminPages />
        </AuthContext.Provider>
      </MemoryRouter>
    )

    expect(screen.getByRole('button', { name: /Gestionar Inventario/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: /Agregar Productos Nuevos/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: /Gestionar Ventas/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: /Gestionar Cupones/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: /Gestionar Usuarios/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: /Administrar Productos Principales/i })).toBeEnabled()

    const openBtn = screen.getByRole('button', { name: /Administrar Productos Principales/i })
    openBtn.click()
    expect(await screen.findByText(/Administrar Productos Principales/i)).toBeInTheDocument()
  })
})
