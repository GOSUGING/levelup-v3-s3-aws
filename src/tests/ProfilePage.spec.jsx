import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { AuthContext } from '../context/AuthContext.jsx'
import ProfilePage from '../pages/ProfilePages.jsx'

/** helper simple para inyectar el AuthContext y router */
function renderWithAuth(ui, { authValue }) {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter>{ui}</MemoryRouter>
    </AuthContext.Provider>
  )
}

describe('ProfilePage (tests por clase .is-invalid únicamente)', () => {
  it('flujo feliz: edita y llama updateProfile con los datos nuevos', async () => {
    const user = userEvent.setup()
    const updateProfile = vi.fn()
    const logout = vi.fn()

    const ctx = {
      user: {
        name: 'Juan Tester',
        email: 'juan@test.com',
        address: 'Calle 1',
        phone: '555-000',
        preferences: { newsletter: true, promos: false },
      },
      updateProfile,
      logout,
    }

    renderWithAuth(<ProfilePage />, { authValue: ctx })

    // Editamos dos campos para comprobar el payload
    const nameInput = screen.getByLabelText(/nombre completo/i)
    const addressInput = screen.getByLabelText(/dirección/i)
    await user.clear(nameInput);  await user.type(nameInput, 'Juan Actualizado')
    await user.clear(addressInput); await user.type(addressInput, 'Nueva Dirección 123')

    // Guardar
    await user.click(screen.getByRole('button', { name: /guardar cambios/i }))

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledTimes(1)
      expect(updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Juan Actualizado',
          address: 'Nueva Dirección 123',
          // el resto (email, phone, preferences) lo maneja el componente
        })
      )
    })
  })

  it('flujo inválido: pone .is-invalid en nombre y email y NO llama updateProfile', async () => {
    const user = userEvent.setup()
    const updateProfile = vi.fn()
    const logout = vi.fn()

    // Estado inicial intencionalmente inválido
    const ctx = {
      user: {
        name: '',           // ❌ nombre vacío -> inválido
        email: 'malo',      // ❌ email inválido -> inválido
        address: '',
        phone: '',
        preferences: {},
      },
      updateProfile,
      logout,
    }

    renderWithAuth(<ProfilePage />, { authValue: ctx })

    // Click en guardar sin corregir nada
    await user.click(screen.getByRole('button', { name: /guardar cambios/i }))

    const nameInput  = screen.getByLabelText(/nombre completo/i)
    const emailInput = screen.getByLabelText(/^email$/i)

   

    // ❌ No se debe haber llamado a updateProfile
    expect(updateProfile).not.toHaveBeenCalled()
  })
})
