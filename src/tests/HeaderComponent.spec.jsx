// Importaciones necesarias para testear React
import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HeaderComponent from '../components/HeaderComponent'
import { CartContext } from '../context/CartContext'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

// ✅ Mock de useNavigate para poder verificar si se llama a la ruta correcta
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => {
      return (path) => {
        // Guardamos la ruta a la que se navega en una variable global
        global.__vNavigateCalls = global.__vNavigateCalls || []
        global.__vNavigateCalls.push(path)
      }
    },
  }
})

describe('Pruebas de HeaderComponent', () => {
  beforeEach(() => {
    // Reiniciamos las llamadas de navegación antes de cada test
    global.__vNavigateCalls = []
  })

  // 🧰 Función auxiliar para renderizar el componente con un contexto de carrito
  const renderWithCart = (cartItems = [], removeFromCart = vi.fn()) => {
    const cartItemsCount = cartItems.reduce((acc, it) => acc + (it.qty || 1), 0)
    const cartSubtotal = cartItems.reduce((sum, it) => sum + (Number(it.price) || 0) * (it.qty || 1), 0)
    return render(
      <CartContext.Provider value={{ cartItems, cartItemsCount, removeFromCart, cartSubtotal }}>
        {/* MemoryRouter sirve para simular rutas sin necesidad de un navegador real */}
        <MemoryRouter>
          <HeaderComponent />
        </MemoryRouter>
      </CartContext.Provider>
    )
  }

  it('Debe mostrar el nombre de la marca en el navbar', () => {
    renderWithCart([])
    expect(screen.getByText(/Level-Up/i)).toBeInTheDocument()
  })

  it('No debe mostrar el badge si el carrito está vacío', () => {
    renderWithCart([])
    // Como no hay productos, no debería aparecer ningún número en el badge
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('Debe mostrar el badge con la cantidad correcta de productos', async () => {
    renderWithCart([{ id: 1, name: 'Gamer Mouse', price: 200 }])

    // Buscamos el botón que contiene el icono del carrito
    const toggle = screen.getByRole('button', { name: /shopping cart/i })
    await userEvent.click(toggle) // Abrimos el dropdown

    // Verificamos que aparezca el número de productos en el badge
    const badge = screen.getByText('1')
    expect(badge).toBeInTheDocument()
  })

  it('Debe llamar a removeFromCart al presionar el botón "X"', async () => {
    const removeSpy = vi.fn() // Espía para verificar si se llamó
    renderWithCart([{ id: 'p1', name: 'Teclado', price: 100 }], removeSpy)

    // Abrimos el dropdown
    const toggleBtn = screen.getByRole('button', { name: /shopping cart/i })
    await userEvent.click(toggleBtn)

    // Buscamos el botón de eliminar
    const removeBtn = await screen.findByText('×')
    await userEvent.click(removeBtn)

    // Verificamos que se llamó con el ID correcto
    expect(removeSpy).toHaveBeenCalledWith('p1')
  })

  it('Debe navegar a /pago al presionar "Ir a pagar"', async () => {
    renderWithCart([
      { id: 1, name: 'Producto A', price: 50 },
      { id: 2, name: 'Producto B', price: 100 },
    ])

    // Abrimos el dropdown
    const toggleBtn = screen.getByRole('button', { name: /shopping cart/i })
    await userEvent.click(toggleBtn)

    // Buscamos el botón de "Ir a pagar" y lo presionamos
    const payBtn = await screen.findByRole('button', { name: /Ir a pagar/i })
    await userEvent.click(payBtn)

    // Verificamos que navigate('/pago') fue llamado
    expect(global.__vNavigateCalls).toContain('/pago')
  })
})
