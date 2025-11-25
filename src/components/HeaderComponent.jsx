// src/components/HeaderComponent.jsx
import React, { useState, useContext } from "react";
import { Navbar, Nav, Container, Badge, Dropdown, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";

export default function HeaderComponent() {
  const { cartItems, cartItemsCount, removeFromCart, cartSubtotal } = useCart();
  const [showCart, setShowCart] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext) || { user: null };

  return (
    <Navbar collapseOnSelect expand="lg" className="navbar-custom" variant="dark" sticky="top">
      <Container>
        {/* Logo */}
        <Navbar.Brand as={Link} to="/">Level-Up</Navbar.Brand>

        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link as={Link} to="/categorias">Categorías</Nav.Link>
            <Nav.Link as={Link} to="/productos">Productos</Nav.Link>
            <Nav.Link as={Link} to="/registro">Registrarse</Nav.Link>
            {user ? (
              ['ADMIN','BODEGUERO','VENTAS'].includes((user.role || '').toUpperCase()) ? (
                <Button
                  variant="success"
                  className="ms-2"
                  onClick={() => navigate('/admin')}
                >
                  ADMIN
                </Button>
              ) : (
                <Nav.Link as={Link} to="/perfil">Perfil</Nav.Link>
              )
            ) : (
              <Nav.Link as={Link} to="/login">Iniciar Sesión</Nav.Link>
            )}

            {/* Carrito */}
            <Dropdown show={showCart} onToggle={setShowCart} align="end">
              <Dropdown.Toggle as={Button} variant="dark" aria-label="shopping cart">
                <FaShoppingCart size={20} />
                {cartItemsCount > 0 && (
                  <Badge bg="light" text="dark" className="ms-1">
                    {cartItemsCount}
                  </Badge>
                )}
              </Dropdown.Toggle>

              <Dropdown.Menu style={{ minWidth: 320 }}>
                {cartItems.length === 0 ? (
                  <Dropdown.Item disabled>Carrito vacío</Dropdown.Item>
                ) : (
                  <>
                    {cartItems.map((item) => (
                      <Dropdown.Item
                        key={item.id}
                        className="d-flex align-items-center justify-content-between"
                      >
                        <div className="me-2" style={{ flex: 1 }}>
                          <div className="fw-semibold">{item.name}</div>
                          <small className="text-muted">
                            {item.qty || 1} × ${Number(item.price || 0).toLocaleString("es-CL")}
                          </small>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-bold">
                            ${(Number(item.price || 0) * (item.qty || 1)).toLocaleString("es-CL")}
                          </span>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={(e) => {
                              e.preventDefault();
                              removeFromCart(item.id);
                            }}
                          >
                            ×
                          </Button>
                        </div>
                      </Dropdown.Item>
                    ))}

                    <Dropdown.Divider />
                    <div className="d-flex justify-content-between align-items-center px-3">
                      <strong>Total:</strong>
                      <strong>${cartSubtotal.toLocaleString("es-CL")}</strong>
                    </div>
                    <div className="px-3 mt-2 mb-2">
                      <Button
                        variant="success"
                        className="w-100"
                        onClick={() => {
                          setShowCart(false);
                          navigate("/pago");
                        }}
                      >
                        Ir a pagar 💳
                      </Button>
                    </div>
                  </>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
