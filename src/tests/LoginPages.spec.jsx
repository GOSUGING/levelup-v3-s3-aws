import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import LoginPages from '../pages/LoginPages.jsx';
import { AuthContext } from '../context/AuthContext.jsx';

// Mock de useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => (path) => {
      global.__navCalls = global.__navCalls || [];
      global.__navCalls.push(path);
    },
  };
});

// Render helper con AuthContext mockeado
const renderWithAuth = (ui, { authValue, initialEntries = ['/login'] } = {}) =>
  render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </AuthContext.Provider>
  );

describe('LoginPages', () => {
  beforeEach(() => {
    global.__navCalls = [];
  });

  it('permite escribir en el input de Email', async () => {
    const user = userEvent.setup();
    const loginMock = vi.fn();

    renderWithAuth(<LoginPages />, { authValue: { user: null, login: loginMock } });

    const email = screen.getByLabelText(/Correo electrónico/i);
    await user.type(email, 'usuario@test.com');
    expect(email).toHaveValue('usuario@test.com');
  });

  it('permite escribir en el input de Contraseña', async () => {
    const user = userEvent.setup();
    const loginMock = vi.fn();

    renderWithAuth(<LoginPages />, { authValue: { user: null, login: loginMock } });

    const pass = screen.getByLabelText(/Contraseña/i);
    await user.type(pass, '123456');
    expect(pass).toHaveValue('123456');
  });

  it('llama a login y navega a /perfil en login exitoso', async () => {
    const user = userEvent.setup();
    const loginMock = vi.fn().mockResolvedValue(true);

    renderWithAuth(<LoginPages />, { authValue: { user: null, login: loginMock } });

    await user.type(screen.getByLabelText(/Correo electrónico/i), 'user@test.com');
    await user.type(screen.getByLabelText(/Contraseña/i), 'abc123');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    expect(loginMock).toHaveBeenCalledWith({ email: 'user@test.com', password: 'abc123' });
    expect(global.__navCalls).toContain('/perfil');
  });

  it('muestra error si el email es inválido y NO llama a login', async () => {
    const user = userEvent.setup();
    const loginMock = vi.fn();

    renderWithAuth(<LoginPages />, { authValue: { user: null, login: loginMock } });

    await user.type(screen.getByLabelText(/Correo electrónico/i), 'a@b');
    await user.type(screen.getByLabelText(/Contraseña/i), '123456');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await screen.findByText(/Por favor ingresa un correo electrónico válido/i);
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('redirige automáticamente a /perfil si ya hay usuario', () => {
    renderWithAuth(<LoginPages />, {
      authValue: { user: { email: 'logueado@ok.com' }, login: vi.fn() },
    });
    expect(global.__navCalls).toContain('/perfil');
  });

  it('renderiza el link "¡Regístrate!" con href /registro', () => {
    renderWithAuth(<LoginPages />, { authValue: { user: null, login: vi.fn() } });

    const link = screen.getByRole('link', { name: /¡Regístrate!/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/registro');
  });
});
