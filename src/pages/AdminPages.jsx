import React, { useContext, useEffect, useState } from 'react'
import { Container, Row, Col, Button, Modal, Form, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { getProducts, getFeaturedConfig, saveFeaturedConfig } from '../api/products'

const AdminPages = () => {
  const navigate = useNavigate()
  const { logout, user } = useContext(AuthContext) || {}
  const role = (user?.role || '').toUpperCase()
  const isAdmin = role === 'ADMIN'
  const isBodeguero = role === 'BODEGUERO'
  const isVendedor = role === 'VENTAS'
  const [showFeaturedModal, setShowFeaturedModal] = useState(false)
  const [featuredTitle, setFeaturedTitle] = useState('Productos Más Vendidos 🔥')
  const [maxCount, setMaxCount] = useState(4)
  const [selectedIds, setSelectedIds] = useState([])
  const [availableProducts, setAvailableProducts] = useState([])
  const [saveError, setSaveError] = useState(null)
  const [saveOk, setSaveOk] = useState(null)

  useEffect(() => {
    const cargarConfig = async () => {
      try {
        const cfg = await getFeaturedConfig()
        setFeaturedTitle(cfg?.title || 'Productos Más Vendidos 🔥')
        setMaxCount(Number(cfg?.maxCount || 4))
        setSelectedIds(Array.isArray(cfg?.productIds) ? cfg.productIds : [])
      } catch {}
    }
    cargarConfig()
  }, [])

  const openFeatured = async () => {
    setShowFeaturedModal(true)
    try {
      const data = await getProducts()
      const list = (Array.isArray(data) ? data : []).filter(p => Number(p.stock ?? 0) > 0)
      setAvailableProducts(list)
    } catch {}
  }

  const saveFeatured = async () => {
    setSaveError(null); setSaveOk(null)
    // Validaciones
    const trimmed = selectedIds.slice(0, maxCount)
    const hasDup = trimmed.length !== new Set(trimmed).size
    if (hasDup) {
      setSaveError('No se permiten productos duplicados')
      return
    }
    try {
      const resp = await saveFeaturedConfig({ title: featuredTitle, maxCount, productIds: trimmed })
      setSaveOk(resp?.message || 'Configuración guardada')
    } catch (e) {
      setSaveError('Error al guardar configuración')
      return
    }
  }

  const go = (path) => navigate(path)
  const handleExit = () => {
    try { logout && logout() } finally { navigate('/') }
  }

  return (
    <Container className="page-container">
      <h1>Panel de Administración</h1>
      <p>Bienvenido {user?.name ?? user?.email ?? 'Administrador'}</p>
      <Row className="justify-content-center mt-4">
        <Col xs={12} md={8}>
          <div className="d-grid gap-3">
            <Button
              variant="primary"
              onClick={() => go('/admin/inventario')}
              disabled={!(isAdmin || isBodeguero)}
            >
              Gestionar Inventario
            </Button>
            <Button
              variant="primary"
              onClick={() => go('/admin/productos/nuevo')}
              disabled={!(isAdmin || isBodeguero)}
            >
              Agregar Productos Nuevos
            </Button>

            <Button
              variant="primary"
              onClick={() => go('/admin/ventas')}
              disabled={!(isAdmin || isVendedor)}
            >
              Gestionar Ventas
            </Button>
            <Button
              variant="primary"
              onClick={() => go('/admin/cupones')}
              disabled={!(isAdmin || isVendedor)}
            >
              Gestionar Cupones
            </Button>

            <Button
              variant="primary"
              onClick={() => go('/admin/usuarios')}
              disabled={!isAdmin}
            >
              Gestionar Usuarios
            </Button>
            <Button
              variant="primary"
              onClick={openFeatured}
              disabled={!(isAdmin)}
            >
              Administrar Productos Principales
            </Button>

            <Button variant="outline-danger" onClick={handleExit}>Salir</Button>
          </div>
        </Col>
      </Row>
      
      <div className="mt-4">
        <small style={{ fontSize: '0.75rem', opacity: 0.6, color: '#ccc' }}>
          ROL: {role}
        </small>
      </div>

      <Modal show={showFeaturedModal} onHide={() => setShowFeaturedModal(false)} centered contentClassName="featured-modal">
        <Modal.Header closeButton>
          <Modal.Title>Administrar Productos Principales</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {saveError && <Alert variant="danger">{saveError}</Alert>}
          {saveOk && <Alert variant="success">{saveOk}</Alert>}
          <Form.Group className="mb-3">
            <Form.Label>Título</Form.Label>
            <Form.Control
              type="text"
              value={featuredTitle}
              onChange={(e) => setFeaturedTitle(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Cantidad máxima</Form.Label>
            <Form.Select value={String(maxCount)} onChange={(e) => {
              const val = Number(e.target.value);
              setMaxCount(val);
              setSelectedIds(prev => prev.slice(0, val));
            }}>
              {[2,3,4,5,6,7,8].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">Selecciona cuántos productos destacar</Form.Text>
          </Form.Group>

          {[...Array(maxCount)].map((_, idx) => (
            <Form.Group className="mb-3" key={idx}>
              <Form.Label>Producto {idx+1}</Form.Label>
              <Form.Select
                value={String(selectedIds[idx] || '')}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setSelectedIds(prev => {
                    const next = [...prev];
                    next[idx] = id;
                    return next;
                  })
                }}
              >
                <option value="">-- Seleccionar --</option>
                {availableProducts.map(p => {
                  const disabled = selectedIds.includes(p.id) && selectedIds[idx] !== p.id;
                  return (
                    <option key={p.id} value={p.id} disabled={disabled}>
                      {p.name} ({p.category})
                    </option>
                  )
                })}
              </Form.Select>
            </Form.Group>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFeaturedModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={saveFeatured}>Guardar</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default AdminPages