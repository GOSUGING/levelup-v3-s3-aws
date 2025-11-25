
import React from 'react'
import { render, screen } from '@testing-library/react'
import Footer from '../components/Footer'

describe('Pruebas del Footer', () => {
  it('Muestra el título "Aceptamos todo medio de pago"', () => {
    render(<Footer />)
    // Verificar que el heading esté presente
    expect(screen.getByText(/Aceptamos todo medio de pago/i)).toBeInTheDocument()
  })

  it('Renderiza 5 íconos SVG (métodos de pago)', () => {
    const { container } = render(<Footer />)
    // Los íconos de react-icons se renderizan como <svg>.
    const svgs = container.getElementsByTagName('svg')
    // Esperamos exactamente 5 íconos (Paypal, Visa, Mastercard, ApplePay, GooglePay)
    expect(svgs.length).toBe(5)
  })

  it('Muestra el texto de copyright con el año 2025', () => {
    render(<Footer />)
    expect(screen.getByText(/© 2025 Level-Up Gamer/i)).toBeInTheDocument()
  })
})