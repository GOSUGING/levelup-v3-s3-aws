import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Button, Badge } from 'react-bootstrap';
import { CartContext } from '../context/CartContext';
import { PRODUCTS } from '../data/products';
import { getProduct } from '../api/products';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);
  const [serverProduct, setServerProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const localProduct = useMemo(() => PRODUCTS.find(p => String(p.id) === String(id)), [id]);

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        setError(null);
        const p = await getProduct(id);
        setServerProduct(p);
      } catch (e) {
        setError('No se pudo cargar el stock del producto');
      } finally {
        setLoading(false);
      }
    };
    cargar();
    window.scrollTo(0, 0);
  }, [id]);

  const product = serverProduct || localProduct;
  const stock = serverProduct?.stock ?? 0;

  // Lista de características: prioriza las locales si el backend no las trae
  const featuresList = useMemo(() => {
    const f = serverProduct?.features ?? localProduct?.features;
    if (!f) return [];
    if (Array.isArray(f)) return f;
    if (typeof f === 'string') {
      const parts = f.split(/[•|,;\n]/).map(s => s.trim()).filter(Boolean);
      return parts.length ? parts : [f];
    }
    return [];
  }, [serverProduct, localProduct]);

  if (!localProduct && !serverProduct && !loading) {
    return (
      <Container className="mt-4 text-center">
        <p>Producto no encontrado.</p>
        <Link to="/productos" className="btn btn-outline-secondary">Volver a Productos</Link>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="mb-3">
        <Link to="/productos" className="btn btn-outline-secondary">Volver a Productos</Link>
      </div>

      {loading && <p>Cargando información del producto...</p>}
      {error && <p style={{color:'red'}}>⚠ {error}</p>}

      {product && (
        <Row>
          {/* Imagen grande a la izquierda */}
          <Col xs={12} md={6} className="text-center">
            <img src={product.img} alt={product.name} style={{ maxWidth: '100%', height: 'auto', objectFit: 'contain' }} />
          </Col>

          {/* Detalles a la derecha */}
          <Col xs={12} md={6}>
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <p className="fw-bold" style={{ fontSize: '1.25rem' }}>${product.price.toLocaleString()}</p>

            <div className="d-flex align-items-center gap-2">
              <Button
                variant="success"
                disabled={(serverProduct && stock <= 0)}
                onClick={() => addToCart(product)}
              >
                Agregar al Carrito
              </Button>
              <Badge bg={stock > 0 ? 'success' : 'danger'}>
                Stock: {serverProduct ? stock : 'N/D'}
              </Badge>
            </div>
            {serverProduct && stock <= 0 && (
              <p className="mt-2" style={{color:'red'}}>No puedes agregar al carrito: sin stock.</p>
            )}

            {/* Características del producto (independientes de la descripción) */}
            <div className="mt-4">
              <h5>Características</h5>
              {featuresList.length > 0 ? (
                <ul>
                  {featuresList.map((feat, idx) => (
                    <li key={idx}>{feat}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">Aún no hay características específicas para este producto.</p>
              )}
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
}