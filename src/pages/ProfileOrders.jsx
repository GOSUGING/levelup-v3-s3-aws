// src/pages/ProfileOrders.jsx
import React, { useEffect, useState, useContext } from "react";
import { Container, Table, Spinner, Alert, Button } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";
import { getPayments } from "../api/payment";

export default function ProfileOrders() {
  return (
    <Container className="mt-5 text-light text-center">
      <h2>Historial de pedidos</h2>
      <p className="text-secondary mb-4">
        Aquí podrás revisar todas tus compras realizadas.
      </p>

      <Alert variant="info" className="p-4 fs-5">
        🔧 <strong>Función en desarrollo</strong>  
        <br />
        Próximamente podrás ver tus pedidos, boletas y detalles de compra
        una vez que el sistema registre el email o nombre del usuario en los pagos.
      </Alert>

      <p className="mt-4 text-muted">
        Gracias por tu paciencia mientras mejoramos Level-Up Gamer. 🎮⚡
      </p>
    </Container>
  );
}
