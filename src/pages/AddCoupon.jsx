import React, { useState } from 'react'
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { createCoupon } from '../api/coupons'

const DESCUENTOS = [
  { value: 10, label: '10%' },
  { value: 20, label: '20%' },
  { value: 30, label: '30%' },
  { value: 40, label: '40%' },
  { value: 50, label: '50%' },
]

export default function AddCoupon() {
  const navigate = useNavigate()
  const [codigo, setCodigo] = useState('')
  const [porcentajeDescuento, setPorcentajeDescuento] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (!codigo.trim()) { 
      setError('El código de cupón es obligatorio'); 
      return 
    }
    
    // Validar código de cupón (solo letras, números y guiones)
    const codigoOk = /^[A-Za-z0-9-]+$/.test(codigo.trim())
    if (!codigoOk) { 
      setError('El código solo puede contener letras, números y guiones'); 
      return 
    }
    
    setLoading(true)
    try {
      const couponData = {
        codigo: codigo.trim().toUpperCase(),
        porcentajeDescuento: porcentajeDescuento,
        estado: "HABILITADO",
      }
      
      const response = await createCoupon(couponData)
      setSuccess(`Cupón creado exitosamente: ${response?.codigo || codigo}`)
      
      // Limpiar campos
      setCodigo('')
      setPorcentajeDescuento(10)
      
    } catch (err) {
      if (err?.response?.status === 409) {
        setError('Ya existe un cupón con ese código. Por favor, elige otro.')
      } else {
        setError(err?.message || 'No se pudo crear el cupón')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="page-container" style={{ maxWidth: 520 }}>
      <h2>Crear Nuevo Cupón</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={onSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Código de Cupón</Form.Label>
          <Form.Control 
            type="text" 
            value={codigo} 
            onChange={(e) => {
              const v = e.target.value.toUpperCase().replace(/[^A-Za-z0-9-]/g, '');
              setCodigo(v); 
            }} 
            disabled={loading} 
            placeholder="Ej: DESCUENTO10, VERANO2024, BLACKFRIDAY"
            isInvalid={!!codigo && !/^[A-Za-z0-9-]+$/.test(codigo)}
            maxLength={20}
          />
          <Form.Control.Feedback type="invalid">
            Solo se permiten letras, números y guiones
          </Form.Control.Feedback>
          <Form.Text className="text-white-50">
            El código se convertirá automáticamente a mayúsculas
          </Form.Text>
        </Form.Group>
        
        <Form.Group className="mb-4">
          <Form.Label>Porcentaje de Descuento</Form.Label>
          <Form.Select 
            value={porcentajeDescuento} 
            onChange={(e) => setPorcentajeDescuento(Number(e.target.value))} 
            disabled={loading}
          >
            {DESCUENTOS.map(d => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </Form.Select>
          <Form.Text className="text-white-50">
            Este cupón otorgará un {porcentajeDescuento}% de descuento en las compras
          </Form.Text>
        </Form.Group>
        
        <div className="d-flex">
          <Button variant="secondary" type="button" onClick={() => navigate('/admin/cupones')}>
            Volver
          </Button>
          <div className="ms-auto">
            <Button 
              variant="success" 
              type="submit" 
              disabled={loading || !codigo.trim() || !/^[A-Za-z0-9-]+$/.test(codigo.trim())}
            >
              {loading ? (
                <><Spinner size="sm" animation="border" className="me-2" /> Creando...</>
              ) : 'Crear Cupón'}
            </Button>
          </div>
        </div>
      </Form>
    </Container>
  )
}