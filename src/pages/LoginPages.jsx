import React, { useState, useContext, useEffect } from "react";
import { Container, Form, Button, Alert, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../App.css";

function LoginPages() {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Si ya hay sesión activa, redirige automáticamente
  useEffect(() => {
    if (!user) return;
    const r = (user?.role || '').toUpperCase()
    const dest = (r === 'ADMIN' || r === 'BODEGUERO' || r === 'VENTAS') ? "/admin" : "/perfil";
    navigate(dest);
  }, [user, navigate]);

  // Validación de email básica
  const validateEmail = (value) => /\S+@\S+\.\S+/.test(value);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Por favor completa todos los campos");
      return;
    }

    if (!validateEmail(email)) {
      setError("Por favor ingresa un correo electrónico válido");
      return;
    }

    setLoading(true);
    try {
      const logged = await login({ email, password });
      const r = (logged?.role || '').toUpperCase();
      const dest = (r === 'ADMIN' || r === 'BODEGUERO' || r === 'VENTAS') ? "/admin" : "/perfil";
      navigate(dest);
    } catch (err) {
      setError(err?.message || "Error al iniciar sesión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="main-container d-flex align-items-center justify-content-center">
      <div className="form-container shadow p-4 rounded bg-dark text-light" style={{ maxWidth: "420px", width: "100%" }}>
        <h3 className="text-center mb-4">Iniciar Sesión</h3>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleLogin} noValidate>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="inputEmail">Correo electrónico</Form.Label>
            <Form.Control
              type="email"
              id="inputEmail"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label htmlFor="inputPassword">Contraseña</Form.Label>
            <Form.Control
              type="password"
              id="inputPassword"
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </Form.Group>

          <div className="d-grid gap-2">
            <Button
              className="btn-login neon-green"
              variant="success"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" /> Entrando...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </div>

          <div className="text-center mt-3">
            <p className="register-link text-light">
              ¿No tienes una cuenta?{" "}
              <Link to="/registro" className="text-success fw-bold">
                ¡Regístrate!
              </Link>
            </p>
          </div>
        </Form>
      </div>
    </Container>
  );
}

export default LoginPages;
