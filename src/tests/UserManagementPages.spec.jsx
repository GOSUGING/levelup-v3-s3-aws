import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import UserManagementPages from '../pages/UserManagementPages.jsx'

vi.mock('../api/users', async () => {
  const actual = await vi.importActual('../api/users')
  return {
    ...actual,
    getUsers: vi.fn().mockResolvedValue([]),
  }
})

describe('UserManagementPages', () => {
  it('muestra encabezado y lista vacía', async () => {
    render(
      <MemoryRouter>
        <UserManagementPages />
      </MemoryRouter>
    )

    expect(screen.getByText(/Administración de Usuarios/i)).toBeInTheDocument()
    expect(await screen.findByText(/Sin usuarios/i)).toBeInTheDocument()
  })

  it('activa modo edición y muestra botón Aplicar Cambios deshabilitado', async () => {
    render(
      <MemoryRouter>
        <UserManagementPages />
      </MemoryRouter>
    )

    const editBtn = screen.getByRole('button', { name: /Modificar usuarios/i })
    editBtn.click()
    const applyBtn = await screen.findByRole('button', { name: /Aplicar Cambios/i })
    expect(applyBtn).toBeDisabled()
  })
})
