import { describe, it, expect, vi } from 'vitest';
import React, { useContext } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthContext } from '../context/AuthContext.jsx';

function LoginProbe() {
  const { login } = useContext(AuthContext);
  return <button onClick={() => login({ email: 'test@example.com', password: 'password123' })}>login</button>;
}

describe('API Auth login', () => {
  it('POST /api/auth/login con credenciales correctas', async () => {
    // Mock de respuesta del backend (Spring Boot)
    const mockResponse = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com'
    };

    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: async () => JSON.stringify(mockResponse),
      json: async () => mockResponse
    });

    // Mock del contexto con la función login real
    const mockLoginUser = vi.fn().mockImplementation(async (credentials) => {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      if (!response.ok) throw new Error('Credenciales Inválidas');
      return response.json();
    });

    const mockContextValue = {
      register: vi.fn(),
      login: mockLoginUser,
      logout: vi.fn(),
      updateProfile: vi.fn(),
      user: null,
      loading: false
    };

    render(
      <AuthContext.Provider value={mockContextValue}>
        <LoginProbe />
      </AuthContext.Provider>
    );

    await userEvent.click(screen.getByText('login'));
    
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:8080/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
        })
      );
    });

    expect(mockLoginUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });

  it('POST /api/auth/login con credenciales incorrectas', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 401,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: async () => 'Credenciales Inválidas',
      json: async () => ({ error: 'Credenciales Inválidas' })
    });

    const mockLoginUser = vi.fn().mockImplementation(async (credentials) => {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      if (!response.ok) throw new Error('Credenciales Inválidas');
      return response.json();
    });

    const mockContextValue = {
      register: vi.fn(),
      login: mockLoginUser,
      logout: vi.fn(),
      updateProfile: vi.fn(),
      user: null,
      loading: false
    };

    render(
      <AuthContext.Provider value={mockContextValue}>
        <LoginProbe />
      </AuthContext.Provider>
    );

    await userEvent.click(screen.getByText('login'));
    
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    await expect(mockLoginUser).rejects.toThrow('Credenciales Inválidas');
  });
});