import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx'
import { vi } from 'vitest'
import RegisterPages from '../pages/RegisterPages.jsx';

describe('Componentes RegisterPages', () => {
  
  /**
   * Test: Validación de nombre vacío
   * Verifica que se muestre un mensaje de error cuando el campo "Nombre completo" 
   * pierde el foco estando vacío.
   */
  it('Muestra error de nombre vacío al enviar', () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ register: vi.fn() }}>
          <RegisterPages />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    fireEvent.blur(screen.getByLabelText(/Nombre completo/i))
    fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }))
    expect(screen.getByText('Por favor ingrese su nombre completo')).toBeInTheDocument();
  });

  /**
   * Test: Validación secuencial de nombre y email
   * Verifica que después de corregir el nombre vacío, se muestre el mensaje
   * de error correspondiente a un email inválido.
   */
  it('Muestra error de email inválido al enviar tras corregir nombre', () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ register: vi.fn() }}>
          <RegisterPages />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    const nombreInput = screen.getByLabelText(/Nombre completo/i);
    const emailInput = screen.getByLabelText(/Correo electrónico/i);

    fireEvent.change(nombreInput, { target: { value: 'Barbara Arancibia' } });
    fireEvent.blur(nombreInput)
    fireEvent.change(emailInput, { target: { value: 'correito' } });
    fireEvent.blur(emailInput)
    fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }))
    expect(screen.getByText('Por favor ingrese un correo electrónico válido')).toBeInTheDocument();
  });

  /**
   * Test: Validación de edad mínima
   * Verifica que se muestre un mensaje de error si la fecha de nacimiento 
   * indica que el usuario tiene menos de 13 años.
   */
  it('Muestra error si la edad es menor a 18 años al enviar', () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ register: vi.fn() }}>
          <RegisterPages />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    const fechaInput = screen.getByLabelText(/Fecha de nacimiento/i);

    fireEvent.change(fechaInput, { target: { value: '2020-01-01' } });
    fireEvent.blur(fechaInput)
    fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }))
    expect(screen.getByText('Debes tener al menos 18 años para registrarte')).toBeInTheDocument();
  });

  /**
   * Test: Validación de contraseña
   * Verifica que se muestre un mensaje de error si la contraseña no cumple
   * con los requisitos mínimos (longitud, número y símbolo).
   */
  it('Muestra error si la contraseña no cumple los requisitos al enviar', () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ register: vi.fn() }}>
          <RegisterPages />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    const passwordInput = screen.getByLabelText(/^Contraseña$/i);

    fireEvent.change(passwordInput, { target: { value: 'abc' } });
    fireEvent.blur(passwordInput)
    fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }))
    expect(
      screen.getByText('La contraseña debe tener al menos 8 caracteres, incluir un número y un símbolo')
    ).toBeInTheDocument();
  });

  /**
   * Test: Confirmación de contraseña vacía
   * Verifica que se muestre un mensaje de error si el usuario no confirma
   * la contraseña antes de enviar el formulario.
   */
  it('Muestra error si la confirmación de contraseña está vacía al enviar', () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ register: vi.fn() }}>
          <RegisterPages />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    const passwordInput = screen.getByLabelText(/^Contraseña$/i);
    const password2Input = screen.getByLabelText(/Confirmar contraseña/i);

    fireEvent.change(passwordInput, { target: { value: '12345678!' } });
    fireEvent.blur(passwordInput)
    fireEvent.blur(password2Input)
    fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }))
    expect(screen.getByText('Por favor confirme su contraseña')).toBeInTheDocument();
  });

  /**
   * Test: Contraseñas no coinciden
   * Verifica que se muestre un error si los campos de contraseña y confirmación
   * no son iguales.
   */
  it('Muestra error si las contraseñas no coinciden al enviar', () => {
    const regMock = vi.fn().mockResolvedValue({ id: 'u1', email: 'barbarita@gmail.com' })
    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ register: regMock }}>
          <RegisterPages />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    const nombreInput = screen.getByLabelText(/Nombre completo/i)
    const emailInput = screen.getByLabelText(/Correo electrónico/i)
    const fechaInput = screen.getByLabelText(/Fecha de nacimiento/i)
    const passwordInput = screen.getByLabelText(/^Contraseña$/i);
    const password2Input = screen.getByLabelText(/Confirmar contraseña/i);

    fireEvent.change(nombreInput, { target: { value: 'Barbara Arancibia' } })
    fireEvent.blur(nombreInput)
    fireEvent.change(emailInput, { target: { value: 'barbarita@gmail.com' } })
    fireEvent.blur(emailInput)
    fireEvent.change(fechaInput, { target: { value: '1999-12-08' } })
    fireEvent.blur(fechaInput)
    fireEvent.change(passwordInput, { target: { value: '12345678!' } });
    fireEvent.blur(passwordInput)
    fireEvent.change(password2Input, { target: { value: 'hola' } });
    fireEvent.blur(password2Input)
    fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }))
    expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument();
  });

  /**
   * Test: Registro exitoso
   * Verifica que al ingresar datos válidos, se muestre un mensaje de éxito 
   * y los campos del formulario se vacíen.
   */
  it('Muestra mensaje de éxito y limpia los campos tras registro válido', async () => {
    const regMock = vi.fn().mockResolvedValue({ id: 'u1', email: 'barbarita@gmail.com' })
    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ register: regMock }}>
          <RegisterPages />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    const nombreInput = screen.getByLabelText(/Nombre completo/i);
    const emailInput = screen.getByLabelText(/Correo electrónico/i);
    const fechaInput = screen.getByLabelText(/Fecha de nacimiento/i);
    const passwordInput = screen.getByLabelText(/^Contraseña$/i);
    const password2Input = screen.getByLabelText(/Confirmar contraseña/i);

    fireEvent.change(nombreInput, { target: { value: 'Barbara Arancibia' } });
    fireEvent.change(emailInput, { target: { value: 'barbarita@gmail.com' } });
    fireEvent.change(fechaInput, { target: { value: '1999-12-08' } });
    fireEvent.change(passwordInput, { target: { value: '12345678!' } });
    fireEvent.change(password2Input, { target: { value: '12345678!' } });

    fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }));

    expect(await screen.findByText('¡Registro exitoso! Ya puedes usar tu cuenta.')).toBeInTheDocument();

    // Campos vaciados
    expect(nombreInput).toHaveValue('');
    expect(emailInput).toHaveValue('');
    expect(fechaInput).toHaveValue('');
    expect(passwordInput).toHaveValue('');
    expect(password2Input).toHaveValue('');
  });

  /**
   * Test: Botón de registro
   * Verifica que el botón de envío del formulario exista y sea de tipo "submit".
   */
  it('Verifica que el botón de registro existe y es de tipo submit', () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ register: vi.fn() }}>
          <RegisterPages />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    const submitButton = screen.getByRole('button', { name: /Registrarse/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveAttribute('type', 'submit');
  });

});
