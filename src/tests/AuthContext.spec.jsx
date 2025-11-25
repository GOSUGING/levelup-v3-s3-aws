import React, { useContext } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { AuthProvider, AuthContext } from '../context/AuthContext.jsx'

// Componente probe para testear el contexto

function Probe() {
  const { user, login, logout, updateProfile } = useContext(AuthContext)
  return (
    <div>
      <div data-testid="user-email">{user?.email || ''}</div>
      <button onClick={() => login({ email: 'test@demo.com', password: '123' })}>login</button>
      <button onClick={() => updateProfile({ name: 'Nuevo Nombre' })}>update</button>
      <button onClick={logout}>logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  it('login / updateProfile / logout', async () => {
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ id: 'u1', email: 'test@demo.com' }) })
      .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ id: 'u1', email: 'test@demo.com', name: 'Nuevo Nombre' }) })

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    )

    const loginBtn = screen.getByText('login')
    await userEvent.click(loginBtn)
    expect(screen.getByTestId('user-email')).toHaveTextContent('test@demo.com')

    const updateBtn = screen.getByText('update')
    await userEvent.click(updateBtn)
    // sin UI del name; validamos que no explota

    const logoutBtn = screen.getByText('logout')
    await userEvent.click(logoutBtn)
    expect(screen.getByTestId('user-email')).toHaveTextContent('')
  })
})
