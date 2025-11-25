import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Spinner, Alert, Container, Table } from "react-bootstrap";
import { getPayment } from "../api/payment";

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPayment(id);
        setOrder(data);
      } catch (e) {
        setError("No fue posible cargar el detalle del pedido.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const parseItems = (raw) => {
    try {
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <Container className="text-light">
        <Spinner animation="border" /> Cargando detalle...
      </Container>
    );
  }

  if (error) return <Alert variant="danger">{error}</Alert>;

  const productos = parseItems(order.rawPayload);

  return (
    <Container className="mt-4 text-light">
      <h2>Pedido #{order.id}</h2>
      <p><strong>Fecha:</strong> {order.fecha}</p>
      <p><strong>Dirección:</strong> {order.direccionEnvio}</p>
      <p><strong>Estado:</strong> {order.estado}</p>

      <h4>Productos</h4>
      <Table striped bordered hover variant="dark">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio unitario</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p, i) => (
            <tr key={i}>
              <td>{p.productId}</td>
              <td>{p.cantidad}</td>
              <td>${p.price.toLocaleString("es-CL")}</td>
              <td>${(p.price * p.cantidad).toLocaleString("es-CL")}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}
