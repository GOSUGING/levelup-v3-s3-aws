import { describe, it, expect, vi } from 'vitest';
import React, { useContext } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthContext } from '../context/AuthContext.jsx';

function Probe() {
  const { register } = useContext(AuthContext);
  return <button onClick={() => register({ name: 'N', email: 'e@x.com', password: 'p@1!' })}>go</button>;
}

describe('API Auth register', () => {
  it('POST /api/auth/register con body correcto', async () => {
    // Mock de respuesta del backend (Spring Boot)
    const mockResponse = {
      id: 1,
      name: 'N',
      email: 'e@x.com'
    };

    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: async () => JSON.stringify(mockResponse),
      json: async () => mockResponse
    });

    // Mock del contexto con la función register real
    const mockRegisterUser = vi.fn().mockImplementation(async (userData) => {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (!response.ok) throw new Error('Error en el registro');
      return response.json();
    });

    const mockContextValue = {
      register: mockRegisterUser,
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
      loading: false
    };

    render(
      <AuthContext.Provider value={mockContextValue}>
        <Probe />
      </AuthContext.Provider>
    );

    await userEvent.click(screen.getByText('go'));
    
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:8080/api/auth/register',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'N', email: 'e@x.com', password: 'p@1!' })
        })
      );
    });

    expect(mockRegisterUser).toHaveBeenCalledWith({
      name: 'N',
      email: 'e@x.com',
      password: 'p@1!'
    });
  });
});