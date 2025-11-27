import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import AddCoupon from '../pages/AddCoupon.jsx'

vi.mock('../api/coupons', async () => {
  const actual = await vi.importActual('../api/coupons')
  return {
    ...actual,
    createCoupon: vi.fn().mockResolvedValue({ codigo: 'DESCUENTO10' }),
  }
})

describe('AddCoupon', () => {
  it('crea cupón con datos válidos y muestra éxito', async () => {
    render(
      <MemoryRouter>
        <AddCoupon />
      </MemoryRouter>
    )

    expect(screen.getByText(/Crear Nuevo Cupón/i)).toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText(/DESCUENTO10/i), { target: { value: 'DESCUENTO10' } })
    fireEvent.click(screen.getByRole('button', { name: /Crear Cupón/i }))

    expect(await screen.findByText(/Cupón creado exitosamente/i)).toBeInTheDocument()
  })

  it('mantiene porcentaje por defecto y resetea campos tras crear', async () => {
    render(
      <MemoryRouter>
        <AddCoupon />
      </MemoryRouter>
    )

    const codeInput = screen.getByPlaceholderText(/DESCUENTO10/i)
    const select = screen.getByRole('combobox')
    expect(select).toHaveValue('10')

    codeInput.focus()
    codeInput.blur()
    fireEvent.change(codeInput, { target: { value: 'OFERTA20' } })
    fireEvent.click(screen.getByRole('button', { name: /Crear Cupón/i }))

    expect(await screen.findByText(/Cupón creado exitosamente/i)).toBeInTheDocument()
    expect(codeInput).toHaveValue('')
    expect(select).toHaveValue('10')
  })
})
