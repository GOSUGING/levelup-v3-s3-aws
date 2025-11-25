import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { CartContext } from '../context/CartContext';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { getProducts } from '../api/products';

const CATEGORIES = ['consolas', 'juegos', 'accesorios', 'ropa'];
const PLACEHOLDER = "/assets/img/placeholder.png"; // opcional

export default function ProductsPages() {
  const { addToCart } = useContext(CartContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [categoria, setCategoria] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lee el hash y valida que sea una categoría conocida
  useEffect(() => {
    const hash = (location.hash || '').replace('#', '').toLowerCase();
    if (CATEGORIES.includes(hash)) {
      setCategoria(hash);
    } else {
      setCategoria(''); // si el hash no coincide, mostramos todos
    }
    window.scrollTo(0, 0);
  }, [location]);

  // Carga productos desde el microservicio
  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProducts();
        setProducts(Array.isArray(data) ? data : []);
      } catch (e) {
        setError('No se pudo cargar productos');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const productosFiltrados = useMemo(() => {
    return categoria ? products.filter(p => p.category === categoria) : products;
  }, [categoria, products]);

  const titulo = categoria
    ? `Categoría: ${categoria.charAt(0).toUpperCase() + categoria.slice(1)}`
    : 'Tienda Level-Up!';

  return (
    <Container className="mt-4">
      <div className="text-center mb-4">
        <h2>{titulo}</h2>

        {/* 🔙 corregido: vuelve a /categorias */}
        <Link to="/categorias" className="btn btn-outline-secondary mt-2">
          Volver a Categorías
        </Link>
      </div>

      <Row>
        {productosFiltrados.length > 0 ? (
          productosFiltrados.map(product => (
            <Col key={product.id} xs={12} sm={6} md={4} lg={3} className="mb-3">
              <Card className="h-100 shadow-sm" onClick={() => navigate(`/productos/${product.id}`)} style={{ cursor: 'pointer' }}>
                <Card.Img variant="top" src={product.img || PLACEHOLDER} style={{ height: '200px', objectFit: 'contain' }} />
                <Card.Body className="d-flex flex-column">
                  <Card.Title>{product.name}</Card.Title>
                  <Card.Text style={{ flex: 1 }}>{product.description}</Card.Text>
                  <Card.Text className="fw-bold">${product.price.toLocaleString()}</Card.Text>
                  <Button variant="success" onClick={(e) => { e.stopPropagation(); addToCart(product); }}>
                    Agregar al Carrito
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <p className="text-center">No hay productos en esta categoría.</p>
        )}
      </Row>
    </Container>
  );
}
