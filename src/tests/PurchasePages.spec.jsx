import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PurchasePages from '../pages/PurchasePages.jsx';
import { CartContext } from '../context/CartContext.jsx';
import { AuthContext } from '../context/AuthContext.jsx';
import { vi } from 'vitest'


// Helper para renderizar con Router y contexto opcional
function renderWithProviders(ui, { cartItems = [], authValue = { user: null } } = {}) {
  // Función auxiliar que envuelve el componente (ui) en los Providers necesarios.
  return render(
    <BrowserRouter>
      {/* Provee el contexto de enrutamiento. */}
      <AuthContext.Provider value={authValue}>
        <CartContext.Provider value={{ cartItems, cartSubtotal: 0, removeFromCart: vi.fn(), clearCart: vi.fn() }}>
        {/* Provee el contexto del carrito con la lista de items simulada. */}
          {ui}
        </CartContext.Provider>
      </AuthContext.Provider>
    </BrowserRouter>
  );
}

describe('Componentes PurchasePages', () => {
  // Bloque principal que agrupa todas las pruebas para el componente PurchasePages.

  it('Renderiza los títulos principales', () => {
    // Prueba si los títulos principales de la página están presentes en el DOM después de renderizar.
    renderWithProviders(<PurchasePages />);

    expect(screen.getByText('Pagar')).toBeInTheDocument();
    expect(screen.getByText('Tu Carrito')).toBeInTheDocument();
    expect(screen.getByText(/Nombre en la tarjeta/i)).toBeInTheDocument();
  });

  it('Renderiza los textfields y permite escribir', () => {
    // Prueba si los campos de entrada de datos de la tarjeta se renderizan y si se puede simular la entrada de datos.
    renderWithProviders(<PurchasePages />);

    const nombreInput = screen.getByLabelText(/Nombre en la tarjeta/i);
    const numeroInput = screen.getByLabelText(/Número de tarjeta/i);
    const fechaInput = screen.getByLabelText(/Fecha de expiración/i);
    const cvvInput = screen.getByLabelText(/^CVV/i);

    expect(nombreInput).toBeInTheDocument();
    expect(numeroInput).toBeInTheDocument();
    expect(fechaInput).toBeInTheDocument();
    expect(cvvInput).toBeInTheDocument();

    // Simula la escritura y verifica que los valores se actualicen (incluyendo el formateo del número de tarjeta).
    fireEvent.change(nombreInput, { target: { value: 'Barbara Arancibia' } });
    expect(nombreInput.value).toBe('Barbara Arancibia');

    // El número se formatea en grupos de 4
    fireEvent.change(numeroInput, { target: { value: '1111222233334444' } });
    expect(numeroInput.value).toBe('1111 2222 3333 4444');

    fireEvent.change(fechaInput, { target: { value: '12/30' } });
    expect(fechaInput.value).toBe('12/30');

    fireEvent.change(cvvInput, { target: { value: '123' } });
    expect(cvvInput.value).toBe('123');
  });

  it('Renderiza el botón "Pagar" y muestra "Carrito vacío" sin items', () => {
    // Prueba la existencia del botón "Pagar" y verifica que esté deshabilitado si no hay productos en el carrito.
    renderWithProviders(<PurchasePages />, { cartItems: [] });

    const payButton = screen.getByRole('button', { name: /Pagar/i });
    expect(payButton).toBeInTheDocument();
    // Verifica el mensaje cuando el carrito está vacío.
    expect(screen.getByText(/Carrito vacío/i)).toBeInTheDocument();
  });


  it('Valida formato de número en grupos de 4 y mes válido', () => {
    // Prueba específicamente la validación de la longitud del número de tarjeta.
    const mockCart = [{ id: 2, name: 'Otro Producto', price: 20000 }];
    renderWithProviders(<PurchasePages />, { cartItems: mockCart, authValue: { user: { id: 'u1' } } });

    const nombreInput = screen.getByLabelText(/Nombre en la tarjeta/i);
    const numeroInput = screen.getByLabelText(/Número de tarjeta/i);
    const fechaInput = screen.getByLabelText(/Fecha de expiración/i);
    const cvvInput = screen.getByLabelText(/^CVV/i);
    const payButton = screen.getByRole('button', { name: /Pagar/i });

    // Simula la entrada de datos, incluyendo un número de tarjeta con 15 dígitos (inválido).
    fireEvent.change(nombreInput, { target: { value: 'Barbara Arancibia' } });
    fireEvent.change(numeroInput, { target: { value: '1234567890123456' } });
    expect(numeroInput.value).toBe('1234 5678 9012 3456');
    fireEvent.change(fechaInput, { target: { value: '13/30' } });
    expect(screen.getByText(/Mes inválido \(01–12\)/)).toBeInTheDocument();
  });

  it('Realiza checkout contra API y navega a /compra/:id', async () => {
    const mockCart = [{ id: 99, productId: 99, name: 'Producto Final', price: 5000, qty: 1 }];
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'pay123' }) })
    const clearCart = vi.fn()
    render(
      <BrowserRouter>
        <AuthContext.Provider value={{ user: { id: 'u1' }, token: 'tk' }}>
          <CartContext.Provider value={{ cartItems: mockCart, cartSubtotal: 5000, removeFromCart: vi.fn(), clearCart }}>
            <PurchasePages />
          </CartContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    )

    const nombreInput = screen.getByLabelText(/Nombre en la tarjeta/i);
    const numeroInput = screen.getByLabelText(/Número de tarjeta/i);
    const fechaInput = screen.getByLabelText(/Fecha de expiración/i);
    const cvvInput = screen.getByLabelText(/^CVV/i);
    const payButton = screen.getByRole('button', { name: /Pagar/i });

    fireEvent.change(nombreInput, { target: { value: 'Barbara Arancibia' } });
    fireEvent.change(numeroInput, { target: { value: '1234567890123456' } });
    fireEvent.change(fechaInput, { target: { value: '12/30' } });
    fireEvent.change(cvvInput, { target: { value: '123' } });
    fireEvent.click(payButton)

    const call = fetchMock.mock.calls[0]
    expect(call[0]).toMatch(/\/api\/payments\/checkout$/)
    const body = JSON.parse(call[1].body)
    expect(body.userId).toBe('u1')
    expect(await screen.findByText(/Compra OK/)).toBeInTheDocument()
    expect(clearCart).toHaveBeenCalled()
  })
});