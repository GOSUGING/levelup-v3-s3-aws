// Importaciones necesarias para testear React
import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CategoriesPages from '../pages/CategoriesPages.jsx'

describe('Pruebas de CategoriesPages', () => {
  it('Debe renderizar el título principal de categorías', () => {
    render(
      <MemoryRouter>
        <CategoriesPages />
      </MemoryRouter>
    )

    expect(screen.getByText(/Categorías/i)).toBeInTheDocument()
  })

  it('Debe mostrar al menos una categoría disponible', async () => {
    render(
      <MemoryRouter>
        <CategoriesPages />
      </MemoryRouter>
    )

    const categoria = await screen.findByText(/Gamer/i)
    expect(categoria).toBeInTheDocument()
  })

  it('Los enlaces de categorías apuntan a /productos con hash de categoría', async () => {
    render(
      <MemoryRouter>
        <CategoriesPages />
      </MemoryRouter>
    )

    const linkJuegos = await screen.findByRole('link', { name: /Juegos/i })
    expect(linkJuegos).toHaveAttribute('href', '/productos#juegos')
  })
})
