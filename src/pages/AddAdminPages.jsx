import React, { useState } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { registerUser } from "../api/users";

export default function AddAdminPages() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("ADMIN");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await registerUser({
        name,
        email,
        password,
        address,
        phone,
        role,
      });

      setSuccess("Administrador creado correctamente ✔️");

      setName("");
      setEmail("");
      setPassword("");
      setAddress("");
      setPhone("");
      setRole("ADMIN");
    } catch (err) {
      console.error(err);
      setError("Error al crear administrador ❌");
    }

    setLoading(false);
  };

  return (
    <Container className="page-container" style={{ maxWidth: 520 }}>
      <h2>Agregar Administrador</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form onSubmit={onSubmit}>

        {/* NOMBRE */}
        <Form.Group className="mb-3">
          <Form.Label>Nombre</Form.Label>
          <Form.Control
            value={name}
            onChange={(e) => {
              const v = e.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");
              setName(v);
            }}
            disabled={loading}
            isInvalid={!name}
            isValid={!!name}
            placeholder="Ej: Juan Pérez"
          />
          <Form.Control.Feedback type="invalid">
            Solo letras y espacios
          </Form.Control.Feedback>
          <Form.Control.Feedback>Correcto ✔️</Form.Control.Feedback>
        </Form.Group>

        {/* EMAIL */}
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            isInvalid={!!email && !email.includes("@")}
            isValid={email.includes("@")}
            placeholder="correo@ejemplo.com"
          />
          <Form.Control.Feedback type="invalid">
            Correo electrónico inválido
          </Form.Control.Feedback>
          <Form.Control.Feedback>Correcto ✔️</Form.Control.Feedback>
        </Form.Group>

        {/* PASSWORD */}
        <Form.Group className="mb-3">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            isInvalid={password.length < 8}
            isValid={password.length >= 8}
            placeholder="Mínimo 8 caracteres"
          />
          <Form.Control.Feedback type="invalid">
            La contraseña debe tener mínimo 8 caracteres
          </Form.Control.Feedback>
          <Form.Control.Feedback>Correcto ✔️</Form.Control.Feedback>
        </Form.Group>

        {/* ADDRESS */}
        <Form.Group className="mb-3">
          <Form.Label>Dirección</Form.Label>
          <Form.Control
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={loading}
            isInvalid={!address}
            isValid={!!address}
            placeholder="Ej: Calle 123"
          />
          <Form.Control.Feedback type="invalid">
            La dirección es obligatoria
          </Form.Control.Feedback>
          <Form.Control.Feedback>Correcto ✔️</Form.Control.Feedback>
        </Form.Group>

        {/* PHONE */}
        <Form.Group className="mb-3">
          <Form.Label>Teléfono</Form.Label>
          <Form.Control
            value={phone}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-9]/g, "").slice(0, 9);
              setPhone(v);
            }}
            disabled={loading}
            isInvalid={phone.length !== 9}
            isValid={phone.length === 9}
            placeholder="Ej: 987654321"
            maxLength={9}
            inputMode="numeric"
          />
          <Form.Control.Feedback type="invalid">
            Debe tener 9 números
          </Form.Control.Feedback>
          <Form.Control.Feedback>Correcto ✔️</Form.Control.Feedback>
        </Form.Group>

        {/* ROLE */}
        <Form.Group className="mb-3">
          <Form.Label>Rol</Form.Label>
          <Form.Select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={loading}
            isValid={!!role}
          >
            <option value="ADMIN">ADMIN</option>
            <option value="BODEGUERO">BODEGUERO</option>
            <option value="VENTAS">VENTAS</option>
          </Form.Select>
        </Form.Group>

        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Crear Administrador"}
        </Button>
      </Form>
    </Container>
  );
}
