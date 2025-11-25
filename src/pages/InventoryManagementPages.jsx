import React, { useEffect, useMemo, useState } from 'react'
import { Container, Table, Button, Form, Spinner, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { getProducts, updateProduct, deleteProduct } from '../api/products'
import { FaTrash } from 'react-icons/fa'

export default function InventoryManagementPages() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingIds, setSavingIds] = useState(new Set())
  const [dirty, setDirty] = useState(new Map())
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getProducts()
        setRows(data)
      } catch (e) {
        setError(e?.message || 'No se pudo cargar el inventario')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const markDirty = (id, payload) => {
    setDirty(prev => new Map(prev).set(id, { ...(prev.get(id) || {}), ...payload }))
  }

  const onChange = (id, field, value) => {
    setRows(prev => prev.map(r => (r.id === id ? { ...r, [field]: value } : r)))
    markDirty(id, { [field]: value })
  }

  const commitRow = async (row) => {
    setSavingIds(prev => new Set(prev).add(row.id))
    setError('')
    try {
      const updated = await updateProduct(row)
      setRows(prev => prev.map(r => (r.id === row.id ? updated : r)))
      setDirty(prev => { const m = new Map(prev); m.delete(row.id); return m })
    } catch (e) {
      setError(e?.message || 'Error al guardar cambios')
    } finally {
      setSavingIds(prev => { const s = new Set(prev); s.delete(row.id); return s })
    }
  }

  const applyChanges = async () => {
    setSuccess('')
    setError('')
    const pendingIds = Array.from(dirty.keys())
    if (pendingIds.length === 0) { setSuccess('No hay cambios pendientes'); return }
    for (const id of pendingIds) {
      const row = rows.find(r => r.id === id)
      if (row) await commitRow(row)
    }
    setSuccess('Cambios aplicados correctamente')
  }

  const columns = useMemo(() => ([
    { key: 'id', label: 'ID', readonly: true },
    { key: 'name', label: 'Nombre' },
    { key: 'description', label: 'Descripción' },
    { key: 'price', label: 'Precio', type: 'number' },
    { key: 'img', label: 'Imagen (ruta)' },
    { key: 'category', label: 'Categoría' },
    { key: 'stock', label: 'Stock', type: 'number' },
  ]), [])

  const CATEGORY_OPTIONS = [
    { value: 'juegos', label: 'Juegos' },
    { value: 'accesorios', label: 'Accesorios' },
    { value: 'consolas', label: 'Consolas' },
    { value: 'ropa', label: 'Ropa' },
  ]

  return (
    <Container className="page-container">
      <h2>Gestión de Inventario</h2>
      <p className="inventory-help-text">Edita valores en línea. Los cambios se guardan al salir del campo y también con "Aplicar cambios".</p>

      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
      {success && <Alert variant="success" className="mb-3">{success}</Alert>}

      {loading ? (
        <div className="d-flex align-items-center"><Spinner animation="border" className="me-2" />Cargando inventario...</div>
      ) : (
        <div className="table-responsive">
          <Table striped bordered hover size="sm" className="align-middle">
            <thead>
              <tr>
                {columns.map(col => (<th key={col.key}>{col.label}</th>))}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  {columns.map(col => (
                    <td key={col.key} style={{ minWidth: 140 }}>
                      {col.readonly ? (
                        <span>{row[col.key]}</span>
                      ) : col.key === 'category' ? (
                        <Form.Control
                          as="select"
                          size="sm"
                          value={row.category ?? ''}
                          onChange={(e) => onChange(row.id, 'category', e.target.value)}
                          onBlur={() => commitRow(row)}
                          disabled={savingIds.has(row.id)}
                        >
                          <option value="" disabled>Seleccione categoría</option>
                          {CATEGORY_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </Form.Control>
                      ) : (
                        <Form.Control
                          size="sm"
                          type={col.type || 'text'}
                          value={row[col.key] ?? ''}
                          onChange={(e) => onChange(row.id, col.key, col.type === 'number' ? e.target.value.replace(/[^0-9]/g, '') : e.target.value)}
                          onBlur={() => commitRow(row)}
                          disabled={savingIds.has(row.id)}
                        />
                      )}
                    </td>
                  ))}
                  <td style={{ minWidth: 100 }}>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={async () => {
                        const ok = window.confirm(`¿Estás seguro que desea eliminar el producto ${row.name}? Sus datos no podrán recuperarse.`)
                        if (!ok) return
                        setError('')
                        setSuccess('')
                        try {
                          await deleteProduct(row.id)
                          setRows(prev => prev.filter(r => r.id !== row.id))
                          setSuccess(`Producto eliminado: ${row.name}`)
                        } catch (e) {
                          setError(e?.message || 'No se pudo eliminar el producto')
                        }
                      }}
                      title="Eliminar producto"
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={columns.length + 1} className="text-center">Sin productos</td></tr>
              )}
            </tbody>
          </Table>
        </div>
      )}

      <div className="d-flex mt-3">
        <Button variant="secondary" onClick={() => navigate('/admin')}>Volver al menú principal</Button>
        <div className="ms-auto">
          <Button variant="success" onClick={applyChanges} disabled={dirty.size === 0}>Aplicar cambios</Button>
        </div>
      </div>
    </Container>
  )
}