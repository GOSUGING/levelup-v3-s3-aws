// src/tests/ProtectedRoute.spec.jsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute.jsx'
import { AuthContext } from '../context/AuthContext.jsx'

describe('ProtectedRoute', () => {
  it('redirige a /login cuando NO hay usuario', () => {
    render(
      <AuthContext.Provider value={{ user: null }}>
        <MemoryRouter initialEntries={['/profile']}>
          <Routes>
            {/* Ruta de destino (login) para verificar la redirección */}
            <Route path="/login" element={<div>LoginPage</div>} />
            {/* Ruta protegida */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <div>ProfilePage</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    )

    // Debe mostrar la "LoginPage" (redirección) y NO el contenido protegido
    expect(screen.getByText('LoginPage')).toBeInTheDocument()
    expect(screen.queryByText('ProfilePage')).not.toBeInTheDocument()
  })

  it('renderiza el contenido protegido cuando SÍ hay usuario', () => {
    render(
      <AuthContext.Provider value={{ user: { id: 1, name: 'Test User' } }}>
        <MemoryRouter initialEntries={['/profile']}>
          <Routes>
            <Route path="/login" element={<div>LoginPage</div>} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <div>ProfilePage</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    )

    // Debe mostrar el contenido protegido y NO la "LoginPage"
    expect(screen.getByText('ProfilePage')).toBeInTheDocument()
    expect(screen.queryByText('LoginPage')).not.toBeInTheDocument()
  })
})
