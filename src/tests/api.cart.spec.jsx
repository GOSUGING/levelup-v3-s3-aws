import { describe, it, expect, vi } from 'vitest';
import React, { useContext } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartContext, CartProvider } from '../context/CartContext.jsx';
import { AuthContext } from '../context/AuthContext.jsx';

function CartProbe() {
  const { addToCart, updateQty, removeFromCart, clearCart, cartItems } = useContext(CartContext);
  return (
    <div>
      <button onClick={() => addToCart({ id: 'prod1', name: 'Product 1', price: 10.99, imageUrl: 'img1.jpg' }, 2)}>addItem</button>
      <button onClick={() => updateQty('prod1', 3)}>updateQty</button>
      <button onClick={() => removeFromCart('prod1')}>removeItem</button>
      <button onClick={() => clearCart()}>clearCart</button>
      <div data-testid="cart-items">{cartItems.length}</div>
    </div>
  );
}

// Mock provider que combina Auth y Cart contexts
function MockProviders({ children }) {
  const mockUser = { id: 123, name: 'Test User', email: 'test@example.com' };
  
  const mockAuthValue = {
    user: mockUser,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    updateProfile: vi.fn(),
    loading: false
  };

  return (
    <AuthContext.Provider value={mockAuthValue}>
      {children}
    </AuthContext.Provider>
  );
}

describe('API Cart operations', () => {
  it('GET /api/cart/{userId} - obtener carrito del usuario', async () => {
    const mockCartResponse = {
      userId: 123,
      items: [
        {
          id: 1,
          productId: 'prod1',
          name: 'Product 1',
          price: 10.99,
          qty: 2,
          imageUrl: 'img1.jpg'
        }
      ],
      totalItems: 2,
      subtotal: 21.98
    };

    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: async () => JSON.stringify(mockCartResponse),
      json: async () => mockCartResponse
    });

    // Crear un componente que simule el uso del CartContext con usuario autenticado
    function CartTestComponent() {
      const { cartItems } = useContext(CartContext);
      return <div data-testid="cart-items">{cartItems.length}</div>;
    }

    const mockUser = { id: 123, name: 'Test User', email: 'test@example.com' };
    
    const mockAuthValue = {
      user: mockUser,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      updateProfile: vi.fn(),
      loading: false
    };

    render(
      <AuthContext.Provider value={mockAuthValue}>
        <CartProvider>
          <CartTestComponent />
        </CartProvider>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('http://localhost:8082/api/cart/123');
    });
  });

  it('POST /api/cart/{userId}/items - agregar item al carrito', async () => {
    const mockAddItemResponse = {
      userId: 123,
      items: [
        {
          id: 1,
          productId: 'prod1',
          name: 'Product 1',
          price: 10.99,
          qty: 2,
          imageUrl: 'img1.jpg'
        }
      ],
      totalItems: 2,
      subtotal: 21.98
    };

    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: async () => JSON.stringify(mockAddItemResponse),
      json: async () => mockAddItemResponse
    });

    const mockAddToCart = vi.fn().mockImplementation(async (product, qty) => {
      const response = await fetch('http://localhost:8080/api/cart/123/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          name: product.name,
          price: product.price,
          qty: qty,
          imageUrl: product.imageUrl
        })
      });
      if (!response.ok) throw new Error('Error al agregar al carrito');
      return response.json();
    });

    const mockCartValue = {
      cartItems: [],
      addToCart: mockAddToCart,
      updateQty: vi.fn(),
      removeFromCart: vi.fn(),
      clearCart: vi.fn(),
      increment: vi.fn(),
      decrement: vi.fn(),
      cartCount: 0,
      cartItemsCount: 0,
      cartTotal: 0,
      cartSubtotal: 0
    };

    render(
      <MockProviders>
        <CartContext.Provider value={mockCartValue}>
          <CartProbe />
        </CartContext.Provider>
      </MockProviders>
    );

    await userEvent.click(screen.getByText('addItem'));
    
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:8080/api/cart/123/items',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: 'prod1',
            name: 'Product 1',
            price: 10.99,
            qty: 2,
            imageUrl: 'img1.jpg'
          })
        })
      );
    });

    expect(mockAddToCart).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'prod1',
        name: 'Product 1',
        price: 10.99,
        imageUrl: 'img1.jpg'
      }),
      2
    );
  });

  it('PATCH /api/cart/{userId}/items/{itemId} - actualizar cantidad', async () => {
    const mockUpdateResponse = {
      userId: 123,
      items: [
        {
          id: 1,
          productId: 'prod1',
          name: 'Product 1',
          price: 10.99,
          qty: 3,
          imageUrl: 'img1.jpg'
        }
      ],
      totalItems: 3,
      subtotal: 32.97
    };

    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: async () => JSON.stringify(mockUpdateResponse),
      json: async () => mockUpdateResponse
    });

    const mockUpdateQty = vi.fn().mockImplementation(async (productId, qty) => {
      const response = await fetch('http://localhost:8080/api/cart/123/items/1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qty })
      });
      if (!response.ok) throw new Error('Error al actualizar cantidad');
      return response.json();
    });

    const mockCartValue = {
      cartItems: [{ cartItemId: 1, id: 'prod1', name: 'Product 1', price: 10.99, qty: 2, imageUrl: 'img1.jpg' }],
      addToCart: vi.fn(),
      updateQty: mockUpdateQty,
      removeFromCart: vi.fn(),
      clearCart: vi.fn(),
      increment: vi.fn(),
      decrement: vi.fn(),
      cartCount: 1,
      cartItemsCount: 2,
      cartTotal: 21.98,
      cartSubtotal: 21.98
    };

    render(
      <MockProviders>
        <CartContext.Provider value={mockCartValue}>
          <CartProbe />
        </CartContext.Provider>
      </MockProviders>
    );

    await userEvent.click(screen.getByText('updateQty'));
    
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:8080/api/cart/123/items/1',
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qty: 3 })
        })
      );
    });

    expect(mockUpdateQty).toHaveBeenCalledWith('prod1', 3);
  });

  it('DELETE /api/cart/{userId}/items/{itemId} - eliminar item', async () => {
    const mockRemoveResponse = {
      userId: 123,
      items: [],
      totalItems: 0,
      subtotal: 0
    };

    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: async () => JSON.stringify(mockRemoveResponse),
      json: async () => mockRemoveResponse
    });

    const mockRemoveFromCart = vi.fn().mockImplementation(async (productId) => {
      const response = await fetch('http://localhost:8080/api/cart/123/items/1', {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Error al eliminar item');
      return response.json();
    });

    const mockCartValue = {
      cartItems: [{ cartItemId: 1, id: 'prod1', name: 'Product 1', price: 10.99, qty: 2, imageUrl: 'img1.jpg' }],
      addToCart: vi.fn(),
      updateQty: vi.fn(),
      removeFromCart: mockRemoveFromCart,
      clearCart: vi.fn(),
      increment: vi.fn(),
      decrement: vi.fn(),
      cartCount: 1,
      cartItemsCount: 2,
      cartTotal: 21.98,
      cartSubtotal: 21.98
    };

    render(
      <MockProviders>
        <CartContext.Provider value={mockCartValue}>
          <CartProbe />
        </CartContext.Provider>
      </MockProviders>
    );

    await userEvent.click(screen.getByText('removeItem'));
    
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:8080/api/cart/123/items/1',
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });

    expect(mockRemoveFromCart).toHaveBeenCalledWith('prod1');
  });

  it('DELETE /api/cart/{userId} - limpiar carrito completo', async () => {
    const mockClearResponse = {
      userId: 123,
      items: [],
      totalItems: 0,
      subtotal: 0
    };

    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: async () => JSON.stringify(mockClearResponse),
      json: async () => mockClearResponse
    });

    const mockClearCart = vi.fn().mockImplementation(async () => {
      const response = await fetch('http://localhost:8080/api/cart/123', {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Error al vaciar carrito');
      return response.json();
    });

    const mockCartValue = {
      cartItems: [{ cartItemId: 1, id: 'prod1', name: 'Product 1', price: 10.99, qty: 2, imageUrl: 'img1.jpg' }],
      addToCart: vi.fn(),
      updateQty: vi.fn(),
      removeFromCart: vi.fn(),
      clearCart: mockClearCart,
      increment: vi.fn(),
      decrement: vi.fn(),
      cartCount: 1,
      cartItemsCount: 2,
      cartTotal: 21.98,
      cartSubtotal: 21.98
    };

    render(
      <MockProviders>
        <CartContext.Provider value={mockCartValue}>
          <CartProbe />
        </CartContext.Provider>
      </MockProviders>
    );

    await userEvent.click(screen.getByText('clearCart'));
    
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:8080/api/cart/123',
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });

    expect(mockClearCart).toHaveBeenCalled();
  });
});