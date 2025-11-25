import React from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../context/AuthContext.jsx'

/**
 * Renderiza un componente envuelto con MemoryRouter y AuthProvider
 */
export function renderWithAuthRouter(ui, { route = '/', initialEntries = [route] } = {}) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>
  )
}
