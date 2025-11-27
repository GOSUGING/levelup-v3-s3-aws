import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import AddAdminPages from '../pages/AddAdminPages.jsx'

vi.mock('../api/users', async () => {
  const actual = await vi.importActual('../api/users')
  return {
    ...actual,
    registerUser: vi.fn().mockResolvedValue({ id: 'u1' }),
  }
})

describe('AddAdminPages', () => {
  it('muestra encabezado y permite enviar mostrando éxito', async () => {
    render(
      <MemoryRouter>
        <AddAdminPages />
      </MemoryRouter>
    )

    expect(screen.getByText(/Agregar Administrador/i)).toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText(/Juan Pérez/i), { target: { value: 'Juan Perez' } })
    fireEvent.change(screen.getByPlaceholderText(/correo@ejemplo.com/i), { target: { value: 'juan@example.com' } })
    fireEvent.change(screen.getByPlaceholderText(/Mínimo 8 caracteres/i), { target: { value: '12345678' } })
    fireEvent.change(screen.getByPlaceholderText(/Calle 123/i), { target: { value: 'Calle 123' } })
    fireEvent.change(screen.getByPlaceholderText(/987654321/i), { target: { value: '987654321' } })

    fireEvent.click(screen.getByRole('button', { name: /Crear Administrador/i }))

    expect(await screen.findByText(/Administrador creado correctamente/i)).toBeInTheDocument()
  })

  it('tiene select de rol con opciones y limpia campos tras éxito', async () => {
    render(
      <MemoryRouter>
        <AddAdminPages />
      </MemoryRouter>
    )

    expect(screen.getByText(/Agregar Administrador/i)).toBeInTheDocument()
    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
    expect(select.querySelectorAll('option').length).toBeGreaterThanOrEqual(3)

    fireEvent.change(screen.getByPlaceholderText(/Juan Pérez/i), { target: { value: 'Juan Perez' } })
    fireEvent.change(screen.getByPlaceholderText(/correo@ejemplo.com/i), { target: { value: 'juan@example.com' } })
    fireEvent.change(screen.getByPlaceholderText(/Mínimo 8 caracteres/i), { target: { value: '12345678' } })
    fireEvent.change(screen.getByPlaceholderText(/Calle 123/i), { target: { value: 'Calle 123' } })
    fireEvent.change(screen.getByPlaceholderText(/987654321/i), { target: { value: '987654321' } })

    fireEvent.click(screen.getByRole('button', { name: /Crear Administrador/i }))

    expect(await screen.findByText(/Administrador creado correctamente/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Juan Pérez/i)).toHaveValue('')
    expect(screen.getByPlaceholderText(/correo@ejemplo.com/i)).toHaveValue('')
    expect(screen.getByPlaceholderText(/Mínimo 8 caracteres/i)).toHaveValue('')
    expect(screen.getByPlaceholderText(/Calle 123/i)).toHaveValue('')
    expect(screen.getByPlaceholderText(/987654321/i)).toHaveValue('')
  })
})
