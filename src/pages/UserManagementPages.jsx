import React, { useEffect, useMemo, useState } from 'react'
import { Container, Table, Button, Spinner, Alert, Form } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { getUsers, updateUser, deleteUser } from '../api/users'
import { FaTrash } from 'react-icons/fa'

export default function UserManagementPages() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [savingIds, setSavingIds] = useState(new Set())
  const [dirty, setDirty] = useState(new Map())

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getUsers()
        setRows(data)
      } catch (e) {
        const msg = e?.message === 'Network Error'
          ? 'No se pudo conectar con AuthService (puerto 8081).'
          : (e?.message || 'No se pudo cargar usuarios')
        setError(msg)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const columns = useMemo(() => ([
    { key: 'id', label: 'ID', readonly: true },
    { key: 'name', label: 'Nombre' },
    { key: 'email', label: 'Email', readonly: true },
    { key: 'address', label: 'Dirección' },
    { key: 'phone', label: 'Teléfono' },
    { key: 'role', label: 'ROL', readonly: true },
  ]), [])

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
      const payload = {
        name: row.name,
        address: row.address,
        phone: row.phone,
      }
      const updated = await updateUser(row.id, payload)
      setRows(prev => prev.map(r => (r.id === row.id ? updated : r)))
      setDirty(prev => { const m = new Map(prev); m.delete(row.id); return m })
    } catch (e) {
      setError(e?.message || 'Error al guardar cambios')
    } finally {
      setSavingIds(prev => { const s = new Set(prev); s.delete(row.id); return s })
    }
  }

  const applyChanges = async () => {
    const ids = Array.from(dirty.keys())
    for (const id of ids) {
      const row = rows.find(r => r.id === id)
      if (row) await commitRow(row)
    }
    setEditMode(false)
  }

  const cancelEdit = () => {
    setEditMode(false)
    setDirty(new Map())
  }

  return (
    <Container className="page-container">
      <h2>Administración de Usuarios</h2>
      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
      {loading ? (
        <div className="d-flex align-items-center"><Spinner animation="border" className="me-2" />Cargando usuarios...</div>
      ) : (
        <div className="table-responsive">
          <Table striped bordered hover size="sm" className="align-middle">
            <thead>
              <tr>
                {columns.map(col => (<th key={col.key}>{col.label}</th>))}
                {editMode && (<th>Acciones</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id}>
                  {columns.map(col => (
                    <td key={col.key} style={{ minWidth: 140 }}>
                      {col.readonly || !editMode ? (
                        <span>{row[col.key] ?? ''}</span>
                      ) : col.key === 'role' ? (
                        <Form.Select
                          size="sm"
                          value={(row.role || '').toUpperCase()}
                          onChange={(e) => onChange(row.id, 'role', e.target.value)}
                          onBlur={() => commitRow(row)}
                          disabled={savingIds.has(row.id)}
                          className="role-select"
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="BODEGUERO">BODEGUERO</option>
                          <option value="VENTAS">VENTAS</option>
                        </Form.Select>
                      ) : (
                        <Form.Control
                          size="sm"
                          type={col.key === 'email' ? 'email' : 'text'}
                          value={row[col.key] ?? ''}
                          onChange={(e) => onChange(row.id, col.key, e.target.value)}
                          onBlur={() => commitRow(row)}
                          disabled={savingIds.has(row.id)}
                        />
                      )}
                    </td>
                  ))}
                  {editMode && (
                    <td style={{ minWidth: 100 }}>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={async () => {
                          const ok = window.confirm(`¿Está seguro que desea eliminar al usuario "${row.name}"?`)
                          if (!ok) return
                          setError('')
                          try {
                            await deleteUser(row.id)
                            setRows(prev => prev.filter(r => r.id !== row.id))
                          } catch (e) {
                            setError(e?.message || 'No se pudo eliminar el usuario')
                          }
                        }}
                        title="Eliminar usuario"
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={columns.length + (editMode ? 1 : 0)} className="text-center">Sin usuarios</td></tr>
              )}
            </tbody>
          </Table>
        </div>
      )}

      {!editMode ? (
        <div className="d-flex mt-3 gap-2">
          <Button variant="secondary" onClick={() => navigate('/admin')}>Volver</Button>
          <Button variant="primary" onClick={() => navigate('/admin/usuarios/nuevo')}>Agregar admin</Button>
          <Button variant="warning" onClick={() => setEditMode(true)}>Modificar usuarios</Button>
        </div>
      ) : (
        <div className="d-flex mt-3">
          <Button variant="outline-secondary" onClick={cancelEdit}>Volver</Button>
          <div className="ms-auto">
            <Button variant="success" onClick={applyChanges} disabled={dirty.size === 0}>Aplicar Cambios</Button>
          </div>
        </div>
      )}
    </Container>
  )
}