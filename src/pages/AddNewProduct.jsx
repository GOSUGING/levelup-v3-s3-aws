import React, { useRef, useState } from 'react'
import { Container, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { createProduct, uploadProductImage, getProducts } from '../api/products'

const CATEGORIES = [
  { value: 'juegos', label: 'Juegos' },
  { value: 'accesorios', label: 'Accesorios' },
  { value: 'consolas', label: 'Consolas' },
  { value: 'ropa', label: 'Ropa' },
]

export default function AddNewProduct() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [category, setCategory] = useState('juegos')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [imagePath, setImagePath] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [existing, setExisting] = useState([])
  const [nameTaken, setNameTaken] = useState(false)

  const onPickImage = () => {
    fileInputRef.current?.click()
  }

  const onFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      setError('Selecciona una imagen PNG o JPG')
      return
    }
    setError('')
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = () => {
      const url = reader.result
      if (typeof url === 'string') {
        setImagePreview(url)
      }
    }
    reader.readAsDataURL(file)
  }

  React.useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const data = await getProducts()
        if (active) setExisting(Array.isArray(data) ? data : [])
      } catch {}
    }
    load()
    return () => { active = false }
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!name || !price || !stock || !category) {
      setError('Completa al menos Nombre, Precio, Stock y Categoría')
      return
    }
    if (nameTaken) { setError('Ya existe un producto con este nombre'); return }
    if (name.trim().length < 3) { setError('El nombre debe tener al menos 3 caracteres'); return }
    if (Number(price) <= 0 || Number(stock) <= 0) { setError('Precio y Stock deben ser mayores que 0'); return }
    setLoading(true)
    try {
      let img = imagePath
      if (imageFile && !img) {
        const up = await uploadProductImage(imageFile)
        img = up?.path || ''
        setImagePath(img)
      }

      const created = await createProduct({
        name,
        description,
        price,
        stock,
        category,
        img,
      })
      setSuccess('Producto Agregado Exitosamente')
      setExisting(prev => [...prev, created])
      setName('')
      setDescription('')
      setPrice('')
      setStock('')
      setCategory('juegos')
      setImageFile(null)
      setImagePreview('')
      setImagePath('')
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      setError(err?.message || 'No se pudo agregar el producto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="page-container">
      <h2>Agregar Producto Nuevo</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row className="mt-3">
        <Col xs={12} md={5} className="text-center">
          <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 12 }}>
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>
              {imagePreview ? (
                <img src={imagePreview} alt="preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              ) : (
                <span>Imagen vacía</span>
              )}
            </div>
            <div className="mt-2">
              <Button variant="outline-primary" onClick={onPickImage} disabled={loading}>Inspeccionar imagen</Button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" style={{ display: 'none' }} onChange={onFileChange} />
          </div>
        </Col>

        <Col xs={12} md={7}>
          <Form onSubmit={onSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control value={name} onChange={(e) => { const v = e.target.value; setName(v); const exists = existing.some(p => (p.name || '').trim().toLowerCase() === v.trim().toLowerCase()); setNameTaken(exists); }} disabled={loading} isInvalid={nameTaken || (name.trim().length < 3)} />
              <Form.Control.Feedback type="invalid">{name.trim().length < 3 ? 'El nombre debe tener al menos 3 caracteres' : 'Ya existe un producto con este nombre'}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control as="textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} disabled={loading} maxLength={2000} />
              <div className="text-end small char-counter">{description.length}/2000</div>
            </Form.Group>
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Precio</Form.Label>
                  <Form.Control type="text" inputMode="numeric" value={price} onChange={(e) => { const v = e.target.value.replace(/\D/g, ''); setPrice(v); }} disabled={loading} isInvalid={!price || Number(price) <= 0} />
                  <Form.Control.Feedback type="invalid">{(!price || Number(price) <= 0) ? 'Debe ser un número mayor que 0' : 'Ingresa solo números'}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Stock</Form.Label>
                  <Form.Control type="text" inputMode="numeric" value={stock} onChange={(e) => { const v = e.target.value.replace(/\D/g, ''); setStock(v); }} disabled={loading} isInvalid={!stock || Number(stock) <= 0} />
                  <Form.Control.Feedback type="invalid">{(!stock || Number(stock) <= 0) ? 'Debe ser un número mayor que 0' : 'Ingresa solo números'}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Categoría</Form.Label>
              <Form.Select value={category} onChange={(e) => setCategory(e.target.value)} disabled={loading}>
                {CATEGORIES.map(c => (<option key={c.value} value={c.value}>{c.label}</option>))}
              </Form.Select>
            </Form.Group>

            <div className="d-flex mt-3">
              <Button variant="secondary" type="button" onClick={() => navigate('/admin')}>Volver</Button>
              <div className="ms-auto">
                <Button variant="success" type="submit" disabled={loading || !name || name.trim().length < 3 || !price || Number(price) <= 0 || !stock || Number(stock) <= 0 || nameTaken}>
                  {loading ? (<><Spinner size="sm" animation="border" className="me-2" /> Guardando...</>) : 'Agregar producto al stock'}
                </Button>
              </div>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  )
}