import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AddNewProduct from '../pages/AddNewProduct.jsx'

describe('AddNewProduct', () => {
  it('renderiza encabezado y placeholder de imagen', () => {
    render(
      <MemoryRouter>
        <AddNewProduct />
      </MemoryRouter>
    )

    expect(screen.getByText(/Agregar Producto Nuevo/i)).toBeInTheDocument()
    expect(screen.getByText(/Imagen vacía/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Inspeccionar imagen/i })).toBeInTheDocument()
  })

  it('muestra campos del formulario y feedback inválido de nombre por defecto', () => {
    render(
      <MemoryRouter>
        <AddNewProduct />
      </MemoryRouter>
    )

    expect(screen.getAllByText(/Nombre/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Descripción/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Precio/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Stock/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Categoría/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/El nombre debe tener al menos 3 caracteres/i).length).toBeGreaterThan(0)
  })
})
