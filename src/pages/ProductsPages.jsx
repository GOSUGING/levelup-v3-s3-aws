import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { CartContext } from '../context/CartContext';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { getProducts } from '../api/products';

const CATEGORIES = ['consolas', 'juegos', 'accesorios', 'ropa'];
const PLACEHOLDER = "/assets/img/placeholder.png";

export default function ProductsPages() {
  const { addToCart, cartItems } = useContext(CartContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [categoria, setCategoria] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Detectar categoría desde el hash
  useEffect(() => {
    const hash = (location.hash || '').replace('#', '').toLowerCase();
    if (CATEGORIES.includes(hash)) {
      setCategoria(hash);
    } else {
      setCategoria('');
    }
    window.scrollTo(0, 0);
  }, [location]);

  // Cargar productos
  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProducts();
        setProducts(Array.isArray(data) ? data : []);
      } catch (e) {
        setError("No se pudo cargar productos");
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
    : "Tienda Level-Up!";

  return (
    <Container className="mt-4">

      <div className="text-center mb-4">
        <h2>{titulo}</h2>

        {/* Botón volver */}
        <Link to="/categorias" className="btn btn-outline-secondary mt-2">
          Volver a Categorías
        </Link>
      </div>

      <Row>
        {productosFiltrados.length > 0 ? (
          productosFiltrados.map((product) => {
            const stock = Number(product?.stock ?? Infinity);
            const cartItem = cartItems.find(
              it => it.id === product.id || it.productId === product.id
            );
            const qtyInCart = cartItem?.qty || 0;
            const canAdd = Number.isFinite(stock) ? qtyInCart < stock : true;
            const isOut = Number.isFinite(stock) ? stock <= 0 : false;

            return (
              <Col key={product.id} xs={12} sm={6} md={4} lg={3} className="mb-3">
                <Card
                  className="h-100 shadow-sm position-relative"
                  onClick={() => {
                    if (!isOut) navigate(`/productos/${product.id}`);
                  }}
                  style={{
                    cursor: isOut ? "not-allowed" : "pointer",
                    opacity: isOut ? 0.7 : 1,
                  }}
                >

                  {/* 🔥 Badge de SIN STOCK */}
                  {isOut && (
                    <span
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        padding: "5px 10px",
                        borderRadius: "5px",
                        fontWeight: "bold",
                        fontSize: "0.9rem",
                        zIndex: 10,
                      }}
                    >
                      SIN STOCK
                    </span>
                  )}

                  <Card.Img
                    variant="top"
                    src={product.img || PLACEHOLDER}
                    style={{ height: "200px", objectFit: "contain" }}
                  />

                  {/* 🔥 Overlay oscuro cuando no hay stock */}
                  {isOut && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(0, 0, 0, 0.55)",
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: "1.2rem",
                        textAlign: "center",
                      }}
                    >
                      STOCK AGOTADO
                    </div>
                  )}

                  <Card.Body className="d-flex flex-column">
                    <Card.Title>{product.name}</Card.Title>
                    <Card.Text style={{ flex: 1 }}>
                      {product.description}
                    </Card.Text>
                    <Card.Text className="fw-bold">
                      ${product.price.toLocaleString()}
                    </Card.Text>

                    <Button
                      variant="success"
                      disabled={!canAdd}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (canAdd) {
                          addToCart({ ...product, stock }, 1);
                        }
                      }}
                    >
                      {canAdd ? "Agregar al Carrito" : "Sin stock disponible"}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })
        ) : (
          <p className="text-center">
            No hay productos en esta categoría.
          </p>
        )}
      </Row>
    </Container>
  );
}
