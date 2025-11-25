import React, { useEffect, useMemo, useState } from 'react'
import { Container, Table, Button, Spinner, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { getPayments } from '../api/payment'
import { PRODUCTS } from '../data/products'

export default function MarketManagementPages() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getPayments()
        setRows(data)
      } catch (e) {
        const msg = e?.message === 'Network Error'
          ? 'No se pudo conectar con PaymentService (puerto 8083). Asegúrate que esté ejecutándose.'
          : (e?.message || 'No se pudo cargar los pagos')
        setError(msg)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const parseItems = (raw) => {
    if (!raw) return []
    try {
      const arr = JSON.parse(raw)
      return Array.isArray(arr) ? arr : []
    } catch { return [] }
  }

  const getProductName = (id) => {
    const found = PRODUCTS.find(p => Number(p.id) === Number(id))
    return found?.name || `Producto #${id}`
  }

  const rowTotal = (p) => {
    const items = parseItems(p?.rawPayload)
    return items.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.cantidad) || 0), 0)
  }

  const grandTotal = useMemo(() => rows.reduce((s, p) => s + rowTotal(p), 0), [rows])

  return (
    <Container className="page-container">
      <h2>Gestión de Ventas</h2>
      <p className="text-light">Listado de pagos registrados.</p>

      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

      {loading ? (
        <div className="d-flex align-items-center"><Spinner animation="border" className="me-2" />Cargando boletas...</div>
      ) : (
        <div className="table-responsive">
          <Table striped bordered hover size="sm" className="align-middle">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Usuario</th>
                <th>Dirección de Envío</th>
                <th>Cantidad</th>
                <th>Estado</th>
                <th>Detalles</th>
                <th>Precio</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.fecha || 'Sin fecha'}</td>
                  <td>{p.nombreUsuario || 'Usuario desconocido'}</td>
                  <td>{p.direccionEnvio || 'Sin dirección'}</td>
                  <td>{p.cantidad}</td>
                  <td>{p.estado}</td>
                  <td>
                    {parseItems(p.rawPayload).map((it, idx) => (
                      <div key={idx}>
                        Nombre de producto: {getProductName(it.productId)} — Cantidad: {it.cantidad}
                      </div>
                    ))}
                  </td>
                  <td>
                    ${rowTotal(p).toLocaleString('es-CL')}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={8} className="text-center">Sin registros</td></tr>
              )}
            </tbody>
          </Table>
        </div>
      )}

      <div className="d-flex mt-3">
        <Button variant="secondary" onClick={() => navigate('/admin')}>Volver al menú principal</Button>
      </div>

      <div className="mt-4">
        <h5>Resumen General</h5>
        <Table bordered size="sm" className="align-middle" style={{ maxWidth: 420 }}>
          <thead>
            <tr>
              <th colSpan={2}>Total de todas las compras</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Acumulado</td>
              <td>${grandTotal.toLocaleString('es-CL')}</td>
            </tr>
          </tbody>
        </Table>
      </div>
    </Container>
  )
}